"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImagePreview from './ImagePreview';

export default function UploadNovelForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Image file:', imageFile);
    
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        console.log('Title validation failed');
        setError('Please enter a title');
        setLoading(false);
        return;
      }

      let coverImageUrl = formData.coverImage;

      // If there's a new image file, upload it first
      if (imageFile) {
        console.log('Uploading image file...');
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        try {
          const uploadResponse = await fetch('http://localhost:5000/api/upload/image', {
            method: 'POST',
            body: imageFormData,
          });

          console.log('Image upload response status:', uploadResponse.status);
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            console.error('Image upload failed:', errorData);
            throw new Error('Failed to upload image');
          }

          const data = await uploadResponse.json();
          console.log('Image uploaded successfully:', data);
          coverImageUrl = data.imageUrl;
        } catch (error) {
          console.error('Image upload error:', error);
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      const novelData = {
        title: formData.title.trim(),
        description: formData.description.trim() || 'No description provided',
        coverImage: coverImageUrl || '',
        chapters: [],
        sideStories: []
      };
      
      console.log('Sending novel data:', novelData);

      // Create the novel with the image URL
      const response = await fetch('http://localhost:5000/api/novels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novelData)
      });

      console.log('Novel creation response status:', response.status);
      
      // Add more detailed logging of the response
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // Try to parse as JSON for more info
        if (responseText) {
          try {
            const responseJson = JSON.parse(responseText);
            console.log('Response JSON:', responseJson);
          } catch {
            console.log('Response is not JSON');
          }
        }
      } catch (err) {
        console.error('Error reading response:', err);
      }

      if (!response.ok) {
        throw new Error(`Failed to create novel: ${response.status} ${response.statusText}`);
      }

      console.log('Novel created successfully');
      // Redirect to home page after successful upload
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Error uploading novel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Upload New Novel</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Cover Image
          </label>
          <ImagePreview
            imageUrl={formData.coverImage}
            onImageChange={setImageFile}
            onImageUrlChange={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Novel'}
          </button>
        </div>
      </form>
    </div>
  );
} 