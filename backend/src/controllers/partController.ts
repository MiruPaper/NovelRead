import { Request, Response } from 'express';
import Part from '../models/Part';
import Chapter from '../models/Chapter';

// Get all parts of a chapter
export const getParts = async (req: Request, res: Response): Promise<void> => {
  try {
    const parts = await Part.find({ 
      chapterId: req.params.chapterId 
    }).sort({ order: 1 });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parts', error });
  }
};

// Get a single part
export const getPart = async (req: Request, res: Response): Promise<void> => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      res.status(404).json({ message: 'Part not found' });
      return;
    }
    res.json(part);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching part', error });
  }
};

// Create a new part
export const createPart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chapterId, title, content, order } = req.body;

    if (!chapterId) {
      res.status(400).json({ message: 'Chapter ID is required' });
      return;
    }

    if (!title || !title.trim()) {
      res.status(400).json({ message: 'Part title is required' });
      return;
    }

    if (!content || !content.trim()) {
      res.status(400).json({ message: 'Part content is required' });
      return;
    }

    // Check if chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      res.status(404).json({ message: 'Chapter not found' });
      return;
    }

    // Get the highest order number for this chapter's parts
    const lastPart = await Part.findOne({ 
      chapterId 
    }).sort({ order: -1 });
    
    const newOrder = order || (lastPart ? lastPart.order + 1 : 1);

    const part = new Part({
      ...req.body,
      title: title.trim(),
      content: content.trim(),
      order: newOrder
    });
    await part.save();
    res.status(201).json(part);
  } catch (error) {
    console.error('Part creation error:', error);
    res.status(400).json({ 
      message: 'Error creating part', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a part
export const updatePart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, order } = req.body;
    const partId = req.params.id;

    // Find the existing part
    const existingPart = await Part.findById(partId);
    if (!existingPart) {
      res.status(404).json({ message: 'Part not found' });
      return;
    }

    // Validate required fields
    if (!title || !title.trim()) {
      res.status(400).json({ message: 'Part title is required' });
      return;
    }

    if (!content || !content.trim()) {
      res.status(400).json({ message: 'Part content is required' });
      return;
    }

    // If order is being changed, handle reordering
    if (order && order !== existingPart.order) {
      // Check if the new order already exists
      const existingPartWithOrder = await Part.findOne({
        chapterId: existingPart.chapterId,
        order,
        _id: { $ne: partId }
      });

      if (existingPartWithOrder) {
        // Reorder parts
        if (order > existingPart.order) {
          // Moving down - decrease order of parts in between
          await Part.updateMany(
            {
              chapterId: existingPart.chapterId,
              order: { $gt: existingPart.order, $lte: order },
              _id: { $ne: partId }
            },
            { $inc: { order: -1 } }
          );
        } else {
          // Moving up - increase order of parts in between
          await Part.updateMany(
            {
              chapterId: existingPart.chapterId,
              order: { $gte: order, $lt: existingPart.order },
              _id: { $ne: partId }
            },
            { $inc: { order: 1 } }
          );
        }
      }
    }

    // Update the part
    const updatedPart = await Part.findByIdAndUpdate(
      partId,
      {
        title: title.trim(),
        content: content.trim(),
        order: order || existingPart.order
      },
      { new: true }
    );

    res.json(updatedPart);
  } catch (error) {
    console.error('Part update error:', error);
    res.status(400).json({ 
      message: 'Error updating part', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a part
export const deletePart = async (req: Request, res: Response): Promise<void> => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      res.status(404).json({ message: 'Part not found' });
      return;
    }

    // Delete the part
    await part.deleteOne();

    // Reorder remaining parts
    const remainingParts = await Part.find({
      chapterId: part.chapterId,
      order: { $gt: part.order }
    });

    for (const remainingPart of remainingParts) {
      remainingPart.order -= 1;
      await remainingPart.save();
    }
    
    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting part', error });
  }
}; 