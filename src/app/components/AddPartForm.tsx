"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi';

interface PartFormData {
  title: string;
  content: string;
  order: number;
}

interface Chapter {
  _id: string;
  title: string;
  type: 'main' | 'side';
  order: number;
  parts?: Part[];
}

interface Part {
  _id: string;
  order: number;
}

export default function AddPartForm({ chapterId, novelId }: { chapterId: string; novelId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [formData, setFormData] = useState<PartFormData>({
    title: '',
    content: '',
    order: 1
  });

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chapters/${chapterId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chapter');
        }
        const chapterData = await response.json();
        setChapter(chapterData);

        // Calculate the next available order number
        if (chapterData.parts && chapterData.parts.length > 0) {
          const maxOrder = Math.max(...chapterData.parts.map((part: Part) => part.order));
          setFormData(prev => ({
            ...prev,
            order: maxOrder + 1
          }));
        }
      } catch (err) {
        console.error('Error fetching chapter:', err);
        setError('Error loading chapter details');
      }
    };

    fetchChapter();
  }, [chapterId]);

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
      const response = await fetch('http://localhost:5000/api/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          order: formData.order,
          chapterId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create part');
      }

      // Redirect back to the novel page
      router.push(`/novel/${novelId}`);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error creating part. Please try again.');
      }
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (error && !chapter) {
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
          <h1 className="text-2xl font-bold">Add New Part</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {chapter && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800">
                Adding Part to {chapter.type === 'main' ? 'Chapter' : 'Side Story'} {chapter.order}: {chapter.title}
              </h2>
              {chapter.parts && chapter.parts.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  This chapter has {chapter.parts.length} part{chapter.parts.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="order" className="block text-gray-700 font-medium mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                This will be the order in which the part appears in the chapter
              </p>
            </div>

            <div>
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                Part Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter part title"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter part content"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Part'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 