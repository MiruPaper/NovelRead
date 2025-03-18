"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi';
import ImagePreview from './ImagePreview';

interface PartFormData {
  title: string;
  content: string;
  order: number;
  coverImage: string;
}

interface Part {
  _id: string;
  title: string;
  content: string;
  order: number;
  chapterId: string;
  coverImage: string;
}

export default function EditPartForm({ partId, chapterId, novelId }: { partId: string; chapterId: string; novelId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<PartFormData>({
    title: '',
    content: '',
    order: 1,
    coverImage: ''
  });

  useEffect(() => {
    const fetchPart = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/parts/${partId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch part');
        }
        const part: Part = await response.json();
        setFormData({
          title: part.title,
          content: part.content,
          order: part.order,
          coverImage: part.coverImage || ''
        });
      } catch (err) {
        setError('Error loading part details');
        console.error(err);
      }
    };

    fetchPart();
  }, [partId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let coverImageUrl = formData.coverImage;

      // If there's a new image file, upload it first
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const uploadResponse = await fetch('http://localhost:5000/api/upload/image', {
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const { imageUrl } = await uploadResponse.json();
        coverImageUrl = imageUrl;
      }

      const response = await fetch(`http://localhost:5000/api/parts/${partId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          order: formData.order,
          coverImage: coverImageUrl,
          chapterId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update part');
      }

      router.push(`/novel/${novelId}`);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error updating part. Please try again.');
      }
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this part? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/parts/${partId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete part');
      }

      router.push(`/novel/${novelId}`);
      router.refresh();
    } catch (err) {
      console.error('Error deleting part:', err);
      alert('Failed to delete part');
    }
  };

  if (error && !formData.title) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            title="Back"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Part</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="order" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Part Number
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

            <div>
              <label htmlFor="title" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Part Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter part title"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Cover Image
              </label>
              <ImagePreview
                imageUrl={formData.coverImage}
                onImageChange={setImageFile}
                onImageUrlChange={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={10}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter part content"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Part
              </button>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 