import Book from '../models/Book.js';
import BookTransaction from '../models/BookTransaction.js';
import User from '../models/User.js';

// Add a New Book
export const addBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, count: 1, data: book });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'ISBN already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Books (Students & Admins)
export const getBooks = async (req, res) => {
  try {
    const reqQuery = { ...req.query };
    
    // Convert querying objects to operators
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Pagination & Search support
    let query = Book.find(JSON.parse(queryStr));
    
    if (req.query.search) {
       query = query.find({
           $or: [
               { title: { $regex: req.query.search, $options: 'i' } },
               { author: { $regex: req.query.search, $options: 'i' } },
               { isbn: { $regex: req.query.search, $options: 'i' } }
           ]
       });
    }

    const books = await query.sort('-createdAt');
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Issue Book to Student
export const issueBook = async (req, res) => {
  try {
    const { bookId, studentEmail, dueDate } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.type === 'E-Book') return res.status(400).json({ success: false, message: 'E-Books cannot be physically issued' });
    if (book.availableCopies < 1) return res.status(400).json({ success: false, message: 'No copies available' });

    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found with this email' });

    // Check if user already reached maximum limit of 3 books
    const activeIssues = await BookTransaction.countDocuments({ student: student._id, status: { $in: ['Issued', 'Overdue'] } });
    if (activeIssues >= 3) return res.status(400).json({ success: false, message: 'Student has reached max borrowing limit of 3 books' });

    const transaction = await BookTransaction.create({
      book: book._id,
      student: student._id,
      issuedBy: req.user._id, // Admin executing this
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default 14 days
    });

    // Reduce inventory
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Return a Book
export const returnBook = async (req, res) => {
  try {
    const { transactionId, externalFinePaid } = req.body;
    const transaction = await BookTransaction.findById(transactionId).populate('book');
    
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (transaction.status === 'Returned') return res.status(400).json({ success: false, message: 'Book already returned' });

    transaction.status = 'Returned';
    transaction.returnDate = Date.now();
    
    if (externalFinePaid) {
        transaction.fine = 0; // Cleared manually by Librarian overriding fine rules
    }

    await transaction.save();

    // Increase inventory
    const book = await Book.findById(transaction.book._id);
    book.availableCopies += 1;
    await book.save();

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get My Books (Student View)
export const getMyLibrary = async (req, res) => {
  try {
    const myTransactionHistory = await BookTransaction.find({ student: req.user._id })
      .populate('book', 'title author coverImage type digitalUrl category')
      .sort('-issueDate');
      
    res.status(200).json({ success: true, data: myTransactionHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Issue History Lookup
export const getAllTransactions = async (req, res) => {
    try {
      const transactions = await BookTransaction.find()
        .populate('book', 'title author')
        .populate('student', 'name email PRN')
        .populate('issuedBy', 'name');
        
      res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
