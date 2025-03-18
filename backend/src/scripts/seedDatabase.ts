import { connectDB } from '../config/db';
import Novel from '../models/Novel';
import Chapter from '../models/Chapter';

const sampleNovel = {
  title: 'The Mystic Journey',
  description: 'An epic tale of adventure and discovery in a magical world.',
  coverImage: 'https://picsum.photos/800/1200', // Placeholder image
};

const sampleChapters = [
  {
    title: 'The Beginning',
    content: `<p>In the heart of the mystical forest, where ancient trees whispered secrets of forgotten times, a young adventurer named Aria found herself standing at the crossroads of destiny. The air was thick with magic, and the leaves danced with an otherworldly glow.</p>
    <p>She had always known she was different, but today would reveal just how special she truly was. As she traced the mysterious symbols carved into an ancient stone, her fingers began to tingle with an unfamiliar energy.</p>
    <p>"The time has come," a voice echoed through the trees, though no speaker could be seen. Aria's heart raced as she realized her journey was about to begin.</p>`,
    type: 'main',
    order: 1
  },
  {
    title: 'The Discovery',
    content: `<p>The ancient library held more secrets than Aria could have imagined. Dusty tomes lined shelves that stretched to the ceiling, each one containing knowledge that had been lost to time.</p>
    <p>As she ran her fingers along the spines of the books, one particular volume seemed to call to her. It glowed with a faint blue light, and when she pulled it from the shelf, the pages began to turn on their own.</p>
    <p>"The Prophecy of the Seven Stars," she read aloud, and the words seemed to float off the page.</p>`,
    type: 'main',
    order: 2
  },
  {
    title: 'The Hidden Path',
    content: `<p>Deep beneath the library, Aria discovered a hidden passage. The walls were adorned with crystals that emitted a soft, pulsing light, guiding her way deeper into the unknown.</p>
    <p>Each step revealed new wonders, and with each discovery, she felt herself growing stronger, more confident in her abilities. The magic that had always been a part of her was finally beginning to awaken.</p>
    <p>But with this newfound power came responsibility, and she knew the choices she made from here would shape not only her destiny but the fate of the entire realm.</p>`,
    type: 'main',
    order: 3
  },
  {
    title: 'Tales of the Ancient Forest',
    content: `<p>Before the age of mankind, the Ancient Forest was home to beings of pure magic. This is their story, passed down through generations of forest guardians.</p>
    <p>The trees remember a time when dragons soared through crystal-clear skies, and unicorns drank from streams of liquid starlight. It was an age of wonder, when the boundary between reality and magic was as thin as morning mist.</p>`,
    type: 'side',
    order: 1
  }
];

async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await Novel.deleteMany({});
    await Chapter.deleteMany({});

    // Create novel
    const novel = await Novel.create(sampleNovel);

    // Create chapters
    const chaptersWithNovelId = sampleChapters.map(chapter => ({
      ...chapter,
      novelId: novel._id
    }));

    const createdChapters = await Chapter.create(chaptersWithNovelId);

    // Update novel with chapter references
    novel.chapters = createdChapters
      .filter(chapter => chapter.type === 'main')
      .map(chapter => chapter._id);
    novel.sideStories = createdChapters
      .filter(chapter => chapter.type === 'side')
      .map(chapter => chapter._id);
    await novel.save();

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 