"use client";

import { useState } from 'react';
import Image from 'next/image';
import { HiUpload, HiX } from 'react-icons/hi';

interface ImagePreviewProps {
  imageUrl: string;
  onImageChange: (file: File | null) => void;
  onImageUrlChange: (url: string) => void;
  maxSize?: number; // in MB
  className?: string;
}

export default function ImagePreview({
  imageUrl,
  onImageChange,
  onImageUrlChange,
  maxSize = 5,
  className = ''
}: ImagePreviewProps) {
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(imageUrl);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');
    
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`Image size should be less than ${maxSize}MB`);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      onImageChange(file);
      onImageUrlChange(''); // Clear the URL since we're using a file
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    onImageChange(null);
    onImageUrlChange('');
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreview(url);
    onImageUrlChange(url);
    onImageChange(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {preview && (
        <div className="relative w-48 h-64">
          <Image
            src={preview}
            alt="Image preview"
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
          Max size: {maxSize}MB. Supported formats: JPG, PNG, GIF
        </span>
      </div>

      <div className="mt-4">
        <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
          Or provide an image URL
        </label>
        <input
          type="url"
          value={preview === imageUrl ? imageUrl : ''}
          onChange={handleUrlChange}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  );
} 