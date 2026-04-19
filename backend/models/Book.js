import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Book category is required'],
    enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics', 'Management', 'Other']
  },
  type: {
    type: String,
    required: true,
    enum: ['Physical', 'E-Book'],
    default: 'Physical'
  },
  totalCopies: {
    type: Number,
    required: function() { return this.type === 'Physical'; },
    default: 1,
    min: [0, 'Total copies cannot be negative']
  },
  availableCopies: {
    type: Number,
    default: 1,
    min: [0, 'Available copies cannot be negative']
  },
  digitalUrl: {
    type: String,
    required: function() { return this.type === 'E-Book'; }
  },
  description: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String
  }
}, {
  timestamps: true
});

// Middleware to ensure available copies doesn't exceed total copies
bookSchema.pre('save', function(next) {
  if (this.type === 'Physical' && this.isModified('totalCopies') && this.isNew) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

export default mongoose.model('Book', bookSchema);
