import express from 'express';
import { createList, updateList, deleteList, reorderLists } from '../controllers/listController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.post('/', createList);
router.post('/reorder', reorderLists);
router.route('/:id').patch(updateList).delete(deleteList);

export default router;
