import { Request, Response } from 'express';
import Chapter from '../models/Chapter';
import Novel from '../models/Novel';
import Part from '../models/Part';

// Get a single chapter
export const getChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      res.status(404).json({ message: 'Chapter not found' });
      return;
    }

    // If chapter has parts, fetch them
    if (chapter.hasParts) {
      const parts = await Part.find({ chapterId: chapter._id }).sort({ order: 1 });
      const chapterObj = chapter.toObject();
      chapterObj.parts = parts;
      res.json(chapterObj);
    } else {
      res.json(chapter);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chapter', error });
  }
};

// Get next chapter
export const getNextChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentChapter = await Chapter.findById(req.params.id);
    if (!currentChapter) {
      res.status(404).json({ message: 'Current chapter not found' });
      return;
    }

    // Find the next chapter with a higher order in the same type
    const nextChapter = await Chapter.findOne({
      novelId: currentChapter.novelId,
      type: currentChapter.type,
      order: { $gt: currentChapter.order }
    }).sort({ order: 1 });

    if (!nextChapter) {
      res.status(404).json({ message: 'No next chapter found' });
      return;
    }

    res.json(nextChapter);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching next chapter', error });
  }
};

// Get previous chapter
export const getPreviousChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentChapter = await Chapter.findById(req.params.id);
    if (!currentChapter) {
      res.status(404).json({ message: 'Current chapter not found' });
      return;
    }

    // Find the previous chapter with a lower order in the same type
    const previousChapter = await Chapter.findOne({
      novelId: currentChapter.novelId,
      type: currentChapter.type,
      order: { $lt: currentChapter.order }
    }).sort({ order: -1 });

    if (!previousChapter) {
      res.status(404).json({ message: 'No previous chapter found' });
      return;
    }

    res.json(previousChapter);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching previous chapter', error });
  }
};

// Get all chapters for a novel
export const getNovelChapters = async (req: Request, res: Response): Promise<void> => {
  try {
    const chapters = await Chapter.find({ 
      novelId: req.params.novelId 
    }).sort({ order: 1 });

    // Fetch parts for each chapter
    const chaptersWithParts = await Promise.all(
      chapters.map(async (chapter) => {
        if (chapter.hasParts) {
          const parts = await Part.find({ chapterId: chapter._id }).sort({ order: 1 });
          const chapterObj = chapter.toObject();
          chapterObj.parts = parts;
          return chapterObj;
        }
        return chapter;
      })
    );
    
    res.json(chaptersWithParts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chapters', error });
  }
};

// Create a new chapter
export const createChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { novelId, type, title, order } = req.body;

    if (!novelId) {
      res.status(400).json({ message: 'Novel ID is required' });
      return;
    }

    if (!title || !title.trim()) {
      res.status(400).json({ message: 'Chapter title is required' });
      return;
    }

    if (!type || !['main', 'side'].includes(type)) {
      res.status(400).json({ message: 'Invalid chapter type. Must be either "main" or "side"' });
      return;
    }

    if (!order || order < 1) {
      res.status(400).json({ message: 'Invalid chapter order. Must be a positive number' });
      return;
    }

    // Verify novel exists
    const novel = await Novel.findById(novelId);
    if (!novel) {
      res.status(404).json({ message: 'Novel not found' });
      return;
    }

    // Check if chapter order already exists for this novel
    const existingChapter = await Chapter.findOne({
      novelId,
      order,
      type
    });

    if (existingChapter) {
      res.status(400).json({ message: `A ${type} chapter with order ${order} already exists` });
      return;
    }

    // Create chapter
    const chapter = new Chapter(req.body);
    await chapter.save();

    // Update novel's chapters or sideStories array
    if (type === 'main') {
      novel.chapters.push(chapter._id);
    } else {
      novel.sideStories.push(chapter._id);
    }
    await novel.save();

    res.status(201).json(chapter);
  } catch (error) {
    console.error('Chapter creation error:', error);
    res.status(400).json({ 
      message: 'Error creating chapter', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a chapter
export const updateChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!chapter) {
      res.status(404).json({ message: 'Chapter not found' });
      return;
    }
    res.json(chapter);
  } catch (error) {
    res.status(400).json({ message: 'Error updating chapter', error });
  }
};

// Delete a chapter
export const deleteChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      res.status(404).json({ message: 'Chapter not found' });
      return;
    }

    // Remove chapter reference from novel
    const novel = await Novel.findById(chapter.novelId);
    if (novel) {
      if (chapter.type === 'main') {
        novel.chapters = novel.chapters.filter(id => id.toString() !== chapter._id.toString());
      } else {
        novel.sideStories = novel.sideStories.filter(id => id.toString() !== chapter._id.toString());
      }
      await novel.save();
    }

    // Delete all parts associated with this chapter
    await Part.deleteMany({ chapterId: chapter._id });

    // Delete the chapter
    await chapter.deleteOne();
    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chapter', error });
  }
}; 