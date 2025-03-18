import express from 'express';
import {
  getChapter,
  createChapter,
  updateChapter,
  deleteChapter,
  getNovelChapters,
  getNextChapter,
  getPreviousChapter
} from '../controllers/chapterController';

const router = express.Router();

router.get('/novel/:novelId', getNovelChapters);
router.get('/next/:id', getNextChapter);
router.get('/previous/:id', getPreviousChapter);
router.get('/:id', getChapter);
router.post('/', createChapter);
router.put('/:id', updateChapter);
router.delete('/:id', deleteChapter);

export default router; 