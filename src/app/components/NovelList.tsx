"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HiPencil, HiTrash } from 'react-icons/hi';
import { useSession } from 'next-auth/react';

interface Novel {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
}

export default function NovelList() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const { data: session } = useSession();

  const fetchNovels = async () => {
    try {
      console.log('Fetching novels from backend...');
      const response = await fetch('http://localhost:5000/api/novels');
      if (!response.ok) {
        throw new Error('Failed to fetch novels');
      }
      const data = await response.json();
      console.log('Novels fetched:', data.length);
      setNovels(data);
    } catch (error) {
      console.error('Error fetching novels:', error);
    }
  };

  useEffect(() => {
    fetchNovels();
    
    // Set up an interval to refresh novels every 5 seconds
    const intervalId = setInterval(() => {
      fetchNovels();
    }, 5000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleDeleteNovel = async (novelId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this novel? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/novels/${novelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete novel');
      }

      setNovels(novels.filter(novel => novel._id !== novelId));
    } catch (error) {
      console.error('Error deleting novel:', error);
      alert('Failed to delete novel');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Available Novels</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {novels.map((novel) => (
          <div key={novel._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <Link
              href={`/novel/${novel._id}`}
              className="block transform transition duration-200 hover:opacity-90"
            >
              <div className="relative h-64">
                <Image
                  src={novel.coverImage}
                  alt={novel.title}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Link href={`/novel/${novel._id}`} className="block">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">{novel.title}</h2>
                </Link>
                {session?.user?.role === 'ADMIN' && (
                  <div className="flex gap-2">
                    <Link
                      href={`/novel/${novel._id}/edit`}
                      className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title="Edit Novel"
                    >
                      <HiPencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={(e) => handleDeleteNovel(novel._id, e)}
                      className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      title="Delete Novel"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{novel.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 