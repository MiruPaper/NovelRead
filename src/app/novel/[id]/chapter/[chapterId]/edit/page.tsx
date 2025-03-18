import EditChapterForm from '../../../../../components/EditChapterForm';

interface Props {
  params: {
    id: string;
    chapterId: string;
  };
}

export default function EditChapterPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EditChapterForm 
        novelId={params.id} 
        chapterId={params.chapterId}
      />
    </main>
  );
} 