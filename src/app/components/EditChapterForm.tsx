"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiTrash, HiPencil, HiPlus, HiArrowLeft, HiUpload, HiX } from 'react-icons/hi';
import Link from 'next/link';
import Image from 'next/image';

interface Part {
  _id: string;
  title: string;
  order: number;
  content: string;
}

interface Chapter {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  type: 'main' | 'side';
  order: number;
  hasParts: boolean;
  parts?: Part[];
}

interface EditChapterFormProps {
  novelId: string;
  chapterId: string;
}

export default function EditChapterForm({ novelId, chapterId }: EditChapterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'main',
    order: 1,
    hasParts: true,
    coverImage: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        console.log('Fetching chapter data for ID:', chapterId);
        const response = await fetch(`http://localhost:5000/api/chapters/${chapterId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chapter');
        }
        const data: Chapter = await response.json();
        console.log('Full chapter data:', JSON.stringify(data, null, 2));
        
        setFormData({
          title: data.title,
          description: data.description || '',
          type: data.type,
          order: data.order,
          hasParts: data.hasParts,
          coverImage: data.coverImage || ''
        });
        if (data.coverImage) {
          setImagePreview(data.coverImage);
        }

        // Set parts from the chapter data if available
        if (data.parts && Array.isArray(data.parts)) {
          setParts(data.parts);
        } else {
          // If parts not in chapter data, fetch them separately
          const partsResponse = await fetch(`http://localhost:5000/api/chapters/${chapterId}/parts`);
          if (!partsResponse.ok) {
            throw new Error('Failed to fetch parts');
          }
          const partsData = await partsResponse.json();
          console.log('Parts data:', JSON.stringify(partsData, null, 2));
          
          if (Array.isArray(partsData)) {
            setParts(partsData);
          } else {
            console.log('Invalid parts data format');
            setParts([]);
          }
        }
      } catch (err) {
        console.error('Error in fetchChapter:', err);
        setError('Error loading chapter');
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 1 : value
    }));
  };

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/parts/${partId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete part');
      }

      // Update the parts list in the UI
      setParts(prevParts => prevParts.filter(part => part._id !== partId));
    } catch (err) {
      console.error('Error deleting part:', err);
      setError('Failed to delete part. Please try again.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setFormData(prev => ({ ...prev, coverImage: '' })); // Clear the URL since we're using a file
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, coverImage: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let coverImageUrl = formData.coverImage;

      // If there's a new image file, upload it first
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const { imageUrl } = await uploadResponse.json();
        coverImageUrl = imageUrl;
      }

      const response = await fetch(`http://localhost:5000/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          coverImage: coverImageUrl,
          novelId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update chapter');
      }

      router.push(`/novel/${novelId}`);
      router.refresh();
    } catch (err) {
      setError('Error updating chapter. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            title="Back"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Chapter</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Chapter Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter chapter title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Chapter Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter chapter description (optional)"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Cover Image
              </label>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative w-48 h-64">
                    <Image
                      src={imagePreview}
                      alt="Cover preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <HiUpload className="w-5 h-5" />
                    <span>Choose Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Max size: 5MB. Supported formats: JPG, PNG, GIF
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="coverImage" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                  Or provide an image URL
                </label>
                <input
                  type="url"
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="type" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Chapter Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="main">Main Chapter</option>
                <option value="side">Side Story</option>
              </select>
            </div>

            <div>
              <label htmlFor="order" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Chapter Order
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Parts List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chapter Parts</h2>
                <Link
                  href={`/novel/${novelId}/chapter/${chapterId}/add-part`}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  title="Add New Part"
                >
                  <HiPlus className="w-5 h-5" />
                </Link>
              </div>
              
              {parts.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {parts.map((part) => (
                    <div
                      key={part._id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="text-gray-900 dark:text-white">
                        <span className="font-medium">Part {part.order}:</span> {part.title}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/novel/${novelId}/chapter/${chapterId}/part/${part._id}/edit`}
                          className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit Part"
                        >
                          <HiPencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeletePart(part._id)}
                          className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete Part"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No parts added yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Add parts to organize your chapter content</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 