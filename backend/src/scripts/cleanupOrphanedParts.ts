import mongoose from 'mongoose';
import Part from '../models/Part';
import Chapter from '../models/Chapter';

const cleanupOrphanedParts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/novel-reader');
    console.log('Connected to MongoDB');

    // Find all parts
    const allParts = await Part.find({});
    console.log(`Found ${allParts.length} total parts`);

    // Keep track of orphaned parts
    const orphanedParts = [];

    // Check each part
    for (const part of allParts) {
      const chapter = await Chapter.findById(part.chapterId);
      if (!chapter) {
        orphanedParts.push(part);
      }
    }

    console.log(`Found ${orphanedParts.length} orphaned parts`);

    // Delete orphaned parts
    if (orphanedParts.length > 0) {
      for (const part of orphanedParts) {
        console.log(`Deleting orphaned part: ${part._id} (${part.title})`);
        await Part.deleteOne({ _id: part._id });
      }
      console.log('All orphaned parts have been deleted');
    } else {
      console.log('No orphaned parts found');
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the cleanup
cleanupOrphanedParts(); 