import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    // The student who owes the tuition
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // The specific degree program or cohort this fee applies to
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    // What is this charge for? (e.g., "Fall 2024 Tuition", "Lab Equipment Fee", "Library Fine")
    feeType: {
      type: String,
      enum: ["Tuition", "Lab Fee", "Library Fine", "Late Fee", "Other"],
      default: "Tuition"
    },
    // Which semester is this for?
    semester: {
      type: Number,
      required: true
    },
    // Financial Amounts
    totalAmount: {
      type: Number,
      required: true
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    // Deadlines
    dueDate: {
      type: Date,
      required: true
    },
    // Current Status of the Invoice
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending"
    },
    // Track every time the student makes an installment payment
    paymentHistory: [
      {
        amount: Number,
        date: {
          type: Date,
          default: Date.now
        },
        method: {
          type: String,
          enum: ["Credit Card", "Bank Transfer", "Cash", "Scholarship", "Financial Aid"],
          default: "Bank Transfer"
        },
        transactionId: String // e.g., Stripe or Razorpay receipt number
      }
    ],
    // If the student hasn't paid, we can block them from viewing grades
    academicHold: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Virtual to automatically calculate the remaining balance
feeSchema.virtual("balance").get(function () {
  return this.totalAmount - this.amountPaid;
});

// Auto-update the status and holds before saving
feeSchema.pre("save", function (next) {
  // 1. Update Payment Status
  if (this.amountPaid >= this.totalAmount) {
    this.status = "paid";
    this.academicHold = false; // Release hold if paid
  } else if (this.amountPaid > 0 && this.amountPaid < this.totalAmount) {
    // Check if it's past due
    if (new Date() > this.dueDate) {
      this.status = "overdue";
      this.academicHold = true; // Apply hold if overdue
    } else {
      this.status = "partial";
    }
  } else if (this.amountPaid === 0 && new Date() > this.dueDate) {
    this.status = "overdue";
    this.academicHold = true;
  } else {
    this.status = "pending";
  }

  next();
});

// Ensure virtuals are included when converting to JSON
feeSchema.set("toJSON", { virtuals: true });
feeSchema.set("toObject", { virtuals: true });

// Indexes for fast Bursar dashboard queries
feeSchema.index({ studentId: 1, status: 1 });
feeSchema.index({ classId: 1 });
feeSchema.index({ dueDate: 1 });

const Fee = mongoose.model("Fee", feeSchema);

export default Fee;