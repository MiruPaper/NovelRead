"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi';

interface Part {
  _id: string;
  title: string;
  order: number;
}

interface AddPartFormProps {
  novelId: string;
  chapterId: string;
}

export default function AddPartForm({ novelId, chapterId }: AddPartFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    order: 1,
    chapterId: chapterId
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingParts, setExistingParts] = useState<Part[]>([]);
  const [nextAvailableOrder, setNextAvailableOrder] = useState(1);

  useEffect(() => {
    const fetchExistingParts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chapters/${chapterId}/parts`);
        if (response.ok) {
          const parts = await response.json();
          setExistingParts(parts);
          
          // Find the next available order number
          if (parts.length > 0) {
            const maxOrder = Math.max(...parts.map((p: Part) => p.order));
            setNextAvailableOrder(maxOrder + 1);
            setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
          }
        }
      } catch (err) {
        console.error('Error fetching parts:', err);
      }
    };

    fetchExistingParts();
  }, [chapterId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add part');
      }

      router.push(`/novel/${novelId}`);
    } catch (err) {
      console.error('Error adding part:', err);
      setError(err instanceof Error ? err.message : 'Failed to add part. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => router.push(`/novel/${novelId}`)}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <HiArrowLeft className="w-5 h-5" />
          Back to Novel
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Part</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      {existingParts.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h2 className="font-medium mb-2 text-gray-900 dark:text-white">Existing Parts:</h2>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            {existingParts.map((part) => (
              <li key={part._id}>Part {part.order}: {part.title}</li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Enter part title"
            />
          </div>

          <div>
            <label htmlFor="order" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              Part Order
              <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-2">
                (Next available: {nextAvailableOrder})
              </span>
            </label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
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
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Enter part content"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Adding...' : 'Add Part'}
          </button>
        </div>
      </form>
    </div>
  );
} 