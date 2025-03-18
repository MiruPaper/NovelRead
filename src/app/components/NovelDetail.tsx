"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HiArrowLeft, HiPencil, HiTrash, HiPlus, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useSession } from 'next-auth/react';

interface Part {
  _id: string;
  title: string;
  content: string;
  order: number;
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

interface Novel {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  chapters: Chapter[];
  sideStories: Chapter[];
}

export default function NovelDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Add debug logs
  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
    console.log('User role:', session?.user?.role);
    console.log('Is admin:', session?.user?.role === 'ADMIN');
  }, [session, status]);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedParts, setExpandedParts] = useState<{ [key: string]: boolean }>({});
  const INITIAL_PARTS_TO_SHOW = 3;

  useEffect(() => {
    const fetchNovel = async () => {
      try {
        // Fetch novel data
        const novelResponse = await fetch(`http://localhost:5000/api/novels/${id}`);
        if (!novelResponse.ok) {
          throw new Error('Failed to fetch novel');
        }
        const novelData = await novelResponse.json();
        console.log('Novel data:', novelData);

        // Fetch chapters with parts
        const chaptersResponse = await fetch(`http://localhost:5000/api/chapters/novel/${id}`);
        if (!chaptersResponse.ok) {
          throw new Error('Failed to fetch chapters');
        }
        const chaptersData = await chaptersResponse.json();
        console.log('Chapters data:', chaptersData);

        // Separate main chapters and side stories
        const mainChapters = chaptersData.filter((ch: Chapter) => ch.type === 'main');
        const sideStories = chaptersData.filter((ch: Chapter) => ch.type === 'side');

        console.log('Main chapters:', mainChapters);
        console.log('Side stories:', sideStories);

        // Combine novel data with chapters
        const completeNovel = {
          ...novelData,
          chapters: mainChapters,
          sideStories: sideStories
        };

        console.log('Complete novel data:', completeNovel);
        setNovel(completeNovel);
      } catch (err) {
        console.error('Error in fetchNovel:', err);
        setError('Error loading novel details');
      } finally {
        setLoading(false);
      }
    };

    fetchNovel();
  }, [id]);

  const handleDeleteNovel = async () => {
    if (!confirm('Are you sure you want to delete this novel? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/novels/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete novel');
      }

      router.push('/');
    } catch (err) {
      console.error('Error deleting novel:', err);
      alert('Failed to delete novel');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter and all its parts? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chapter');
      }

      // Update the UI by removing the deleted chapter
      if (novel) {
        const updatedNovel = {
          ...novel,
          chapters: novel.chapters.filter(ch => ch._id !== chapterId),
          sideStories: novel.sideStories.filter(ch => ch._id !== chapterId)
        };
        setNovel(updatedNovel);
      }
    } catch (err) {
      console.error('Error deleting chapter:', err);
      alert('Failed to delete chapter');
    }
  };

  const handleDeletePart = async (partId: string) => {
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

      // Update the UI by removing the deleted part
      if (novel) {
        const updatedNovel = {
          ...novel,
          chapters: novel.chapters.map(chapter => ({
            ...chapter,
            parts: chapter.parts?.filter(p => p._id !== partId) || []
          })),
          sideStories: novel.sideStories.map(chapter => ({
            ...chapter,
            parts: chapter.parts?.filter(p => p._id !== partId) || []
          }))
        };
        setNovel(updatedNovel);
      }
    } catch (err) {
      console.error('Error deleting part:', err);
      alert('Failed to delete part');
    }
  };

  const renderChapterList = (chapters: Chapter[], isMainChapter: boolean = true) => (
    <div className="space-y-6">
      {chapters.map((chapter) => {
        const visibleParts = chapter.parts || [];
        const hasMoreParts = visibleParts.length > INITIAL_PARTS_TO_SHOW;
        const shouldShowAllParts = expandedParts[chapter._id] || false;
        const displayedParts = shouldShowAllParts ? visibleParts : visibleParts.slice(0, INITIAL_PARTS_TO_SHOW);

        return (
          <div
            key={chapter._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col md:flex-row">
              {/* Chapter Cover Image */}
              <div className="relative w-full md:w-48 h-48 md:h-64 flex-shrink-0 m-4 md:m-6 rounded-lg overflow-hidden">
                {chapter.coverImage ? (
                  <Image
                    src={chapter.coverImage}
                    alt={`Cover for ${chapter.title}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500">No Cover</span>
                  </div>
                )}
              </div>

              {/* Chapter Details */}
              <div className="flex-1 p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {isMainChapter ? `Chapter ${chapter.order}` : `Side Story ${chapter.order}`}: {chapter.title}
                    </h3>
                    {/* Chapter Description */}
                    {chapter.description && (
                      <p className="mt-3 text-gray-600 dark:text-gray-300">
                        {chapter.description}
                      </p>
                    )}
                  </div>

                  {/* Admin Actions */}
                  {session?.user?.role === 'ADMIN' && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/novel/${id}/chapter/${chapter._id}/edit`}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit Chapter"
                      >
                        <HiPencil className="w-5 h-5" />
                      </Link>
                      {chapter.hasParts && (
                        <Link
                          href={`/novel/${id}/chapter/${chapter._id}/add-part`}
                          className="p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                          title="Add Part"
                        >
                          <HiPlus className="w-5 h-5" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteChapter(chapter._id)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete Chapter"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Parts List */}
                {chapter.hasParts && (
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                    <div className="space-y-2">
                      {displayedParts.map((part) => (
                        <div
                          key={part._id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Link
                            href={`/novel/${id}/chapter/${chapter._id}/part/${part._id}`}
                            className="flex-1 flex items-center gap-4"
                          >
                            <div className="min-w-[60px] font-medium text-gray-900 dark:text-white">
                              Part {part.order}
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">
                              {part.title}
                            </div>
                          </Link>
                          {session?.user?.role === 'ADMIN' && (
                            <div className="flex gap-2 ml-4">
                              <Link
                                href={`/novel/${id}/chapter/${chapter._id}/part/${part._id}/edit`}
                                className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="Edit Part"
                              >
                                <HiPencil className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeletePart(part._id)}
                                className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Delete Part"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {hasMoreParts && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setExpandedParts(prev => ({
                            ...prev,
                            [chapter._id]: !prev[chapter._id]
                          }))}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          {shouldShowAllParts ? (
                            <>
                              <HiChevronUp className="w-5 h-5" />
                              Hide
                            </>
                          ) : (
                            <>
                              <HiChevronDown className="w-5 h-5" />
                              View More ({visibleParts.length - INITIAL_PARTS_TO_SHOW} more)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Debug information before render
  console.log('Rendering NovelDetail with session:', {
    status,
    role: session?.user?.role,
    isAdmin: session?.user?.role === 'ADMIN',
    sessionUser: session?.user
  });

  if (loading || status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-4 bg-gray-50 dark:bg-gray-900">
        {error || 'Novel not found'}
      </div>
    );
  }

  // Helper function to check if user is admin
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            title="Back to Home"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          {isAdmin && (
            <>
              <Link
                href={`/novel/${novel._id}/edit`}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                title="Edit Novel"
              >
                <HiPencil className="w-5 h-5" />
              </Link>
              <button
                onClick={handleDeleteNovel}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                title="Delete Novel"
              >
                <HiTrash className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-64 md:h-96">
            {novel.coverImage && (
              <Image
                src={novel.coverImage}
                alt={novel.title}
                fill
                className="object-cover"
              />
            )}
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{novel.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 whitespace-pre-wrap">{novel.description}</p>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Main Story</h2>
                {novel.chapters.length > 0 ? (
                  renderChapterList(novel.chapters)
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No main chapters yet.</p>
                )}
                {isAdmin && (
                  <Link
                    href={`/novel/${id}/add-chapter?type=main`}
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <HiPlus className="w-5 h-5" /> Add Main Chapter
                  </Link>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Side Stories</h2>
                {novel.sideStories.length > 0 ? (
                  renderChapterList(novel.sideStories, false)
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No side stories yet.</p>
                )}
                {isAdmin && (
                  <Link
                    href={`/novel/${id}/add-chapter?type=side`}
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <HiPlus className="w-5 h-5" /> Add Side Story
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 