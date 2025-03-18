import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN';
}

export const requireAdmin = (session: Session | null, router: ReturnType<typeof useRouter>) => {
  if (!session?.user || session.user.role !== 'ADMIN') {
    router.push('/auth/unauthorized');
    return false;
  }
  return true;
}; 