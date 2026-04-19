import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  addBook,
  getBooks,
  issueBook,
  returnBook,
  getMyLibrary,
  getAllTransactions
} from '../controllers/libraryController.js';

const router = express.Router();

// Required to be logged in for all library routes
router.use(protect);

// Student/General Routes
router.get('/', getBooks);
router.get('/my-books', authorize('student'), getMyLibrary);

// Admin / Librarian Roles
router.post('/add', authorize('admin', 'teacher'), addBook);
router.post('/issue', authorize('admin', 'teacher'), issueBook);
router.post('/return', authorize('admin', 'teacher'), returnBook);
router.get('/transactions', authorize('admin', 'teacher'), getAllTransactions);

export default router;
