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
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const coverImage = formData.get('coverImage') as File;
    const coverImageUrl = formData.get('coverImageUrl') as string;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    let finalCoverImageUrl = '';

    // Handle cover image if provided
    if (coverImage) {
      try {
        // Upload cover image to your storage service
        const imageUploadResponse = await uploadImage(coverImage);
        finalCoverImageUrl = imageUploadResponse.url;
      } catch (error) {
        console.error('Error uploading cover image:', error);
        return NextResponse.json(
          { error: 'Failed to upload cover image' },
          { status: 500 }
        );
      }
    } else if (coverImageUrl) {
      finalCoverImageUrl = coverImageUrl;
    }

    // Create novel in database
    const novel = await prisma.novel.create({
      data: {
        title,
        description,
        coverImage: finalCoverImageUrl
      }
    });

    return NextResponse.json(novel);
  } catch (error) {
    console.error('Novel upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload novel' },
      { status: 500 }
    );
  }
}

// Image upload function
async function uploadImage(_file: File): Promise<{ url: string }> {
  // TODO: Implement actual image upload to a storage service
  // For now, return a placeholder URL
  return { url: '/placeholder-image.jpg' };
} 