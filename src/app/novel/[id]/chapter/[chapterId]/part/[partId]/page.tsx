import PartReader from '../../../../../../components/PartReader';

interface Props {
  params: {
    id: string;
    chapterId: string;
    partId: string;
  };
}

export default function PartPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PartReader 
        novelId={params.id} 
        chapterId={params.chapterId}
        partId={params.partId}
      />
    </main>
  );
} 