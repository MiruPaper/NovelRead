"use client";

import AddPartForm from '../../../components/AddPartForm';
import { useSearchParams } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
}

export default function AddPartPage({ params }: Props) {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapterId');

  if (!chapterId) {
    return (
      <div className="text-center text-red-600 p-4">
        Chapter ID is required
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <AddPartForm novelId={params.id} chapterId={chapterId} />
    </main>
  );
} 