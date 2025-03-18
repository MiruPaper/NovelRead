import express from 'express';
import {
  getNovels,
  getNovel,
  createNovel,
  updateNovel,
  deleteNovel
} from '../controllers/novelController';

const router = express.Router();

router.get('/', getNovels);
router.get('/:id', getNovel);
router.post('/', createNovel);
router.put('/:id', updateNovel);
router.delete('/:id', deleteNovel);

export default router; 