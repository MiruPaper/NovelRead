'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  params: {
    id: string;
    chapterId: string;
  };
}

export default function ChapterPage({ params }: Props) {
  const router = useRouter();

  useEffect(() => {
    const fetchChapterAndRedirect = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chapters/${params.chapterId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chapter');
        }
        const chapter = await response.json();
        
        if (chapter.parts && chapter.parts.length > 0) {
          router.replace(`/novel/${params.id}/chapter/${params.chapterId}/part/${chapter.parts[0]._id}`);
        } else {
          router.replace(`/novel/${params.id}`);
        }
      } catch (error) {
        console.error('Error:', error);
        router.replace(`/novel/${params.id}`);
      }
    };

    fetchChapterAndRedirect();
  }, [params.chapterId, params.id, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
} 