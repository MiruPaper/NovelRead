import AddPartForm from './AddPartForm';

interface Props {
  params: {
    id: string;
    chapterId: string;
  };
}

export default function AddPartPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <AddPartForm novelId={params.id} chapterId={params.chapterId} />
    </main>
  );
} 