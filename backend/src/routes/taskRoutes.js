import express from 'express';
import { createTask, updateTask, moveTask, deleteTask, getTask } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.post('/', createTask);
router.route('/:id').get(getTask).patch(updateTask).delete(deleteTask);
router.post('/:id/move', moveTask);

export default router;
