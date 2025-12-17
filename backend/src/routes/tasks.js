import express from 'express';
import { authJWT } from '../middleware/authJWT.js';
import taskController from '../controllers/taskController.js';

const router = express.Router();

// Get all tasks (with filters)
router.get('/', authJWT, taskController.getTasks);

// Get my tasks (assigned to me)
router.get('/my-tasks', authJWT, taskController.getMyTasks);

// Get task by ID
router.get('/:id', authJWT, taskController.getTaskById);

// Create new task (Admin/Gerente only)
router.post('/', authJWT, taskController.createTask);

// Update task
router.put('/:id', authJWT, taskController.updateTask);

// Delete task
router.delete('/:id', authJWT, taskController.deleteTask);

export default router;
