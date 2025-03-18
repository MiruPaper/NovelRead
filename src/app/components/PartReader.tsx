'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiHome, HiPencil, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useSession } from 'next-auth/react';

interface Part {
  _id: string;
  title: string;
  content: string;
  order: number;
  chapterId: string;
}

interface Chapter {
  _id: string;
  title: string;
  description: string;
  type: 'main' | 'side';
  order: number;
  hasParts: boolean;
  parts?: Part[];
}

interface PartReaderProps {
  chapterId: string;
  novelId: string;
  partId?: string;
}

export default function PartReader({ chapterId, novelId, partId }: PartReaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentPart, setCurrentPart] = useState<Part | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNav, setShowNav] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data with:', { chapterId, partId });
        
        // Fetch all chapters for navigation
        const novelResponse = await fetch(`http://localhost:5000/api/novels/${novelId}`);
        if (!novelResponse.ok) {
          throw new Error('Failed to fetch novel');
        }
        const novelData = await novelResponse.json();
        const chapters = [...novelData.chapters, ...novelData.sideStories]
          .sort((a, b) => a.order - b.order);
        setAllChapters(chapters);
        
        // Fetch chapter and its parts
        const chapterResponse = await fetch(`http://localhost:5000/api/chapters/${chapterId}`);
        if (!chapterResponse.ok) {
          throw new Error('Failed to fetch chapter');
        }
        const chapterData = await chapterResponse.json();
        console.log('Chapter data:', chapterData);
        setChapter(chapterData);

        // If no partId is provided and chapter has parts, redirect to first part
        if (!partId && chapterData.parts && chapterData.parts.length > 0) {
          router.push(`/novel/${novelId}/chapter/${chapterId}/part/${chapterData.parts[0]._id}`);
          return;
        }

        // If partId is provided, find the part in the chapter's parts array
        if (partId && chapterData.parts) {
          const part = chapterData.parts.find((p: Part) => p._id === partId);
          if (part) {
            console.log('Found part in chapter data:', part);
            setCurrentPart(part);
          } else {
            // If part not found in chapter data, fetch it directly
            console.log('Fetching part data for:', partId);
            const partResponse = await fetch(`http://localhost:5000/api/parts/${partId}`);
            if (!partResponse.ok) {
              throw new Error('Failed to fetch part');
            }
            const partData = await partResponse.json();
            console.log('Full part data:', partData);
            if (!partData.content) {
              console.error('Part data is missing content:', partData);
              throw new Error('Part content is missing');
            }
            setCurrentPart(partData);
          }
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Error loading content');
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      fetchData();
    }
  }, [chapterId, novelId, partId, router]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrollingUp(currentScrollY < lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only show nav when header is not visible AND scrolling up
        setShowNav(!entry.isIntersecting && isScrollingUp);
      },
      { threshold: 0 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, [isScrollingUp]);

  const handlePartChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPartId = event.target.value;
    if (selectedPartId && chapter) {
      router.push(`/novel/${novelId}/chapter/${chapter._id}/part/${selectedPartId}`);
    }
  };

  // Calculate chapter navigation
  const currentChapterIndex = allChapters.findIndex(ch => ch._id === chapterId);
  const prevChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;

  // Calculate part navigation
  const currentPartIndex = currentPart && chapter?.parts 
    ? chapter.parts.findIndex(p => p._id === currentPart._id)
    : -1;
  const prevPart = currentPartIndex > 0 && chapter?.parts 
    ? chapter.parts[currentPartIndex - 1] 
    : null;
  const nextPart = currentPartIndex >= 0 && chapter?.parts && currentPartIndex < chapter.parts.length - 1 
    ? chapter.parts[currentPartIndex + 1] 
    : null;

  const handleNavigation = (targetChapterId: string, targetPartId?: string) => {
    if (targetPartId) {
      router.push(`/novel/${novelId}/chapter/${targetChapterId}/part/${targetPartId}`);
    } else {
      router.push(`/novel/${novelId}/chapter/${targetChapterId}`);
    }
  };

  const countWords = (text: string): number => {
    // Remove HTML tags and decode HTML entities
    const div = document.createElement('div');
    div.innerHTML = text;
    const plainText = div.textContent || div.innerText || '';
    // Split by whitespace and filter out empty strings
    return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="text-center text-red-600 p-4">
        {error || 'Content not found'}
      </div>
    );
  }

  if (!currentPart && chapter.parts && chapter.parts.length > 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Fixed Navigation Bar (appears when scrolling up) */}
      <div className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300 ${
        showNav ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-b-lg shadow-lg">
            {/* Navigation bar content */}
            <div className="flex items-center">
              <Link
                href={`/novel/${novelId}`}
                className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Back to Novel"
              >
                <HiHome className="w-5 h-5 dark:text-gray-200" />
              </Link>
            </div>

            <div className="flex-1 flex justify-center items-center">
              {chapter.parts && chapter.parts.length > 0 &&
                <div className="flex items-center gap-4">
                  {(prevPart || (prevChapter && chapter.parts[0]?._id === currentPart?._id)) && (
                    <button
                      onClick={() => {
                        if (prevPart) {
                          handleNavigation(chapter._id, prevPart._id);
                        } else if (prevChapter) {
                          const lastPart = prevChapter.parts?.[prevChapter.parts.length - 1];
                          if (lastPart) {
                            handleNavigation(prevChapter._id, lastPart._id);
                          } else {
                            handleNavigation(prevChapter._id);
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title={prevPart ? "Previous Part" : "Previous Chapter"}
                    >
                      <HiChevronLeft className="w-5 h-5" />
                      <span className="text-base">{prevPart ? "Previous" : "Prev Chapter"}</span>
                    </button>
                  )}
                  <select
                    value={currentPart?._id || ''}
                    onChange={handlePartChange}
                    className="w-64 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 dark:text-gray-100"
                  >
                    {chapter.parts.map((part) => (
                      <option key={part._id} value={part._id}>
                        Part {part.order}: {part.title}
                      </option>
                    ))}
                  </select>
                  {(nextPart || (nextChapter && chapter.parts[chapter.parts.length - 1]?._id === currentPart?._id)) && (
                    <button
                      onClick={() => {
                        if (nextPart) {
                          handleNavigation(chapter._id, nextPart._id);
                        } else if (nextChapter) {
                          const firstPart = nextChapter.parts?.[0];
                          if (firstPart) {
                            handleNavigation(nextChapter._id, firstPart._id);
                          } else {
                            handleNavigation(nextChapter._id);
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title={nextPart ? "Next Part" : "Next Chapter"}
                    >
                      <span className="text-base">{nextPart ? "Next" : "Next Chapter"}</span>
                      <HiChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              }
            </div>

            <div className="flex items-center">
              {currentPart && session?.user?.role === 'ADMIN' && (
                <Link
                  href={`/novel/${novelId}/chapter/${chapter._id}/part/${currentPart._id}/edit`}
                  className="flex items-center p-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  title="Edit Part"
                >
                  <HiPencil className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Default Navigation Bar (always visible) */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          {/* Same navigation content as above */}
          <div className="flex items-center">
            <Link
              href={`/novel/${novelId}`}
              className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Back to Novel"
            >
              <HiHome className="w-5 h-5 dark:text-gray-200" />
            </Link>
          </div>

          <div className="flex-1 flex justify-center items-center">
            {chapter.parts && chapter.parts.length > 0 &&
              <div className="flex items-center gap-4">
                {(prevPart || (prevChapter && chapter.parts[0]?._id === currentPart?._id)) && (
                  <button
                    onClick={() => {
                      if (prevPart) {
                        handleNavigation(chapter._id, prevPart._id);
                      } else if (prevChapter) {
                        const lastPart = prevChapter.parts?.[prevChapter.parts.length - 1];
                        if (lastPart) {
                          handleNavigation(prevChapter._id, lastPart._id);
                        } else {
                          handleNavigation(prevChapter._id);
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title={prevPart ? "Previous Part" : "Previous Chapter"}
                  >
                    <HiChevronLeft className="w-5 h-5" />
                    <span className="text-base">{prevPart ? "Previous" : "Prev Chapter"}</span>
                  </button>
                )}
                <select
                  value={currentPart?._id || ''}
                  onChange={handlePartChange}
                  className="w-64 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 dark:text-gray-100"
                >
                  {chapter.parts.map((part) => (
                    <option key={part._id} value={part._id}>
                      Part {part.order}: {part.title}
                    </option>
                  ))}
                </select>
                {(nextPart || (nextChapter && chapter.parts[chapter.parts.length - 1]?._id === currentPart?._id)) && (
                  <button
                    onClick={() => {
                      if (nextPart) {
                        handleNavigation(chapter._id, nextPart._id);
                      } else if (nextChapter) {
                        const firstPart = nextChapter.parts?.[0];
                        if (firstPart) {
                          handleNavigation(nextChapter._id, firstPart._id);
                        } else {
                          handleNavigation(nextChapter._id);
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title={nextPart ? "Next Part" : "Next Chapter"}
                  >
                    <span className="text-base">{nextPart ? "Next" : "Next Chapter"}</span>
                    <HiChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            }
          </div>

          <div className="flex items-center">
            {currentPart && session?.user?.role === 'ADMIN' && (
              <Link
                href={`/novel/${novelId}/chapter/${chapter._id}/part/${currentPart._id}/edit`}
                className="flex items-center p-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                title="Edit Part"
              >
                <HiPencil className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {currentPart ? (
          <>
            <div ref={headerRef} className="mb-6">
              <h1 className="text-3xl font-bold mb-2 dark:text-white">{chapter.title}</h1>
              <h2 className="text-xl text-gray-600 dark:text-gray-300">Part {currentPart.order}: {currentPart.title}</h2>
            </div>
            <div 
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: currentPart.content }}
            />
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8 space-y-2">
              <div>Part {currentPart.order} of {chapter.parts?.length || 0}</div>
              <div>{countWords(currentPart.content)} words</div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>No content available</p>
          </div>
        )}
      </div>
    </div>
  );
} 