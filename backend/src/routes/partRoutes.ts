import express from 'express';
import {
  getParts,
  getPart,
  createPart,
  updatePart,
  deletePart
} from '../controllers/partController';

const router = express.Router();

router.get('/chapter/:chapterId', getParts);
router.get('/:id', getPart);
router.post('/', createPart);
router.put('/:id', updatePart);
router.delete('/:id', deletePart);

export default router; 