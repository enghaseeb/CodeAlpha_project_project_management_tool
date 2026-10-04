import express from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/:taskId/comments').get(getComments).post(addComment);
router.delete('/comments/:id', deleteComment);

export default router;
