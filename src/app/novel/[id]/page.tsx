import NovelDetail from '../../components/NovelDetail';

interface Props {
  params: {
    id: string;
  };
}

export default function NovelPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-gray-50">
      <NovelDetail id={params.id} />
    </main>
  );
} 