import AddChapterForm from '../../../components/AddChapterForm';

interface Props {
  params: {
    id: string;
  };
}

export default function AddChapterPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <AddChapterForm novelId={params.id} />
    </main>
  );
} 