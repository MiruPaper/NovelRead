import EditNovelForm from '../../../components/EditNovelForm';

interface Props {
  params: {
    id: string;
  };
}

export default function EditNovelPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <EditNovelForm novelId={params.id} />
    </main>
  );
} 