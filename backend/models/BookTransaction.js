import mongoose from 'mongoose';

const bookTransactionSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Librarian/Admin ID who issued the book is required']
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Overdue'],
    default: 'Issued'
  },
  fine: {
    type: Number,
    default: 0,
    min: [0, 'Fine cannot be negative']
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Auto-update status to Overdue if due date passed
bookTransactionSchema.pre('save', function(next) {
  if (this.status === 'Issued' && Date.now() > this.dueDate) {
    this.status = 'Overdue';
    
    // Automatically calculate fine (10 rupees per day config)
    const daysOverdue = Math.floor((Date.now() - this.dueDate) / (1000 * 60 * 60 * 24));
    if (daysOverdue > 0) {
       this.fine = daysOverdue * 10; // Rs. 10/day
    }
  }
  next();
});

export default mongoose.model('BookTransaction', bookTransactionSchema);
