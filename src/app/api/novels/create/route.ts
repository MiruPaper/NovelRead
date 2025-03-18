import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 401 }
    );
  }

  try {
    const contentType = request.headers.get('content-type');
    let title = '';
    let description = '';
    let coverImage = '';

    // Handle JSON data
    if (contentType?.includes('application/json')) {
      const jsonData = await request.json();
      title = jsonData.title || '';
      description = jsonData.description || '';
      coverImage = jsonData.coverImage || '';
    }
    // Handle form data
    else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = formData.get('title') as string || '';
      description = formData.get('description') as string || '';
      coverImage = formData.get('coverImage') as string || '';
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create novel in database
    const novel = await prisma.novel.create({
      data: {
        title,
        description: description || 'No description provided',
        coverImage: coverImage || '',
        chapters: {
          create: []
        }
      }
    });

    return NextResponse.json(novel);
  } catch (error) {
    console.error('Novel creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create novel' },
      { status: 500 }
    );
  }
} 