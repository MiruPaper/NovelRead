import { Request, Response } from 'express';
import Novel from '../models/Novel';
import Chapter from '../models/Chapter';
import Part from '../models/Part';

// Get all novels
export const getNovels = async (_req: Request, res: Response): Promise<void> => {
  try {
    const novels = await Novel.find().sort({ createdAt: -1 });
    res.json(novels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching novels', error });
  }
};

// Get a single novel with its chapters
export const getNovel = async (req: Request, res: Response): Promise<void> => {
  try {
    const novel = await Novel.findById(req.params.id);
    if (!novel) {
      res.status(404).json({ message: 'Novel not found' });
      return;
    }

    // Fetch main chapters
    const mainChapters = await Chapter.find({ 
      novelId: novel._id,
      type: 'main'
    }).sort({ order: 1 });

    // Fetch side stories
    const sideStories = await Chapter.find({
      novelId: novel._id,
      type: 'side'
    }).sort({ order: 1 });

    // Fetch parts for all chapters
    const allChapters = [...mainChapters, ...sideStories];
    const chaptersWithParts = await Promise.all(
      allChapters.map(async (chapter) => {
        if (chapter.hasParts) {
          const parts = await Part.find({ chapterId: chapter._id }).sort({ order: 1 });
          const chapterObj = chapter.toObject();
          chapterObj.parts = parts;
          return chapterObj;
        }
        return chapter;
      })
    );

    // Separate back into main chapters and side stories
    const mainChaptersWithParts = chaptersWithParts.filter(ch => ch.type === 'main');
    const sideStoriesWithParts = chaptersWithParts.filter(ch => ch.type === 'side');

    res.json({
      ...novel.toObject(),
      chapters: mainChaptersWithParts,
      sideStories: sideStoriesWithParts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching novel', error });
  }
};

// Create a new novel
export const createNovel = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating novel with data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!req.body.title) {
      console.error('Missing title in request');
      res.status(400).json({ message: 'Title is required' });
      return;
    }
    
    // If description is missing, provide a default
    if (!req.body.description) {
      console.log('Adding default description');
      req.body.description = 'No description provided';
    }
    
    // Ensure coverImage has a default value if not provided
    if (!req.body.coverImage) {
      console.log('Adding default cover image');
      req.body.coverImage = '';
    }
    
    // Ensure chapters and sideStories are arrays
    if (!req.body.chapters || !Array.isArray(req.body.chapters)) {
      console.log('Initializing chapters array');
      req.body.chapters = [];
    }
    
    if (!req.body.sideStories || !Array.isArray(req.body.sideStories)) {
      console.log('Initializing sideStories array');
      req.body.sideStories = [];
    }
    
    console.log('Creating novel with processed data:', {
      title: req.body.title,
      description: req.body.description,
      coverImage: req.body.coverImage ? 'provided' : 'empty',
      chapters: req.body.chapters.length,
      sideStories: req.body.sideStories.length
    });
    
    const novel = new Novel(req.body);
    console.log('Novel model created:', novel);
    
    try {
      const savedNovel = await novel.save();
      console.log('Novel saved successfully:', savedNovel);
      res.status(201).json(savedNovel);
    } catch (saveError) {
      console.error('Error saving novel to MongoDB:', saveError);
      if (saveError instanceof Error) {
        console.error('Error message:', saveError.message);
        console.error('Error name:', saveError.name);
        if (saveError.name === 'ValidationError') {
          // Handle validation errors
          res.status(400).json({ 
            message: 'Validation error', 
            error: saveError.message,
            details: saveError
          });
        } else {
          res.status(500).json({ 
            message: 'Error saving novel to database', 
            error: saveError.message
          });
        }
      } else {
        res.status(500).json({ 
          message: 'Unknown error saving novel to database'
        });
      }
    }
  } catch (error) {
    console.error('Error creating novel:', error);
    if (error instanceof Error) {
      res.status(400).json({ 
        message: 'Error creating novel', 
        error: error.message 
      });
    } else {
      res.status(400).json({ 
        message: 'Unknown error creating novel'
      });
    }
  }
};

// Update a novel
export const updateNovel = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Updating novel with ID:', req.params.id);
    console.log('Update data:', req.body);
    const novel = await Novel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!novel) {
      console.log('Novel not found with ID:', req.params.id);
      res.status(404).json({ message: 'Novel not found' });
      return;
    }
    console.log('Novel updated successfully:', novel);
    res.json(novel);
  } catch (error) {
    console.error('Error updating novel:', error);
    res.status(400).json({ message: 'Error updating novel', error });
  }
};

// Delete a novel
export const deleteNovel = async (req: Request, res: Response): Promise<void> => {
  try {
    const novel = await Novel.findById(req.params.id);
    if (!novel) {
      res.status(404).json({ message: 'Novel not found' });
      return;
    }

    // Delete all chapters associated with this novel
    await Chapter.deleteMany({ novelId: novel._id });
    
    // Delete the novel
    await novel.deleteOne();
    
    res.json({ message: 'Novel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting novel', error });
  }
}; 