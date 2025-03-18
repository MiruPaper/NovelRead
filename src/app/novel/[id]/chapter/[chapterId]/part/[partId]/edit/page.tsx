import EditPartForm from '@/app/components/EditPartForm';

interface Props {
  params: {
    id: string;
    chapterId: string;
    partId: string;
  };
}

export default function EditPartPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EditPartForm 
        novelId={params.id} 
        chapterId={params.chapterId} 
        partId={params.partId} 
      />
    </main>
  );
} 