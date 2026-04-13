import Fee from "../models/Fee.js";
import User from "../models/User.js";
import Class from "../models/Class.js";

/* =======================================
      ADMIN/BURSAR: BULK INVOICE GENERATION
======================================= */
export const generateClassFees = async (req, res) => {
  try {
    const { classId, feeType, semester, totalAmount, dueDate } = req.body;

    if (!classId || !semester || !totalAmount || !dueDate) {
      return res.status(400).json({ message: "Please provide all required fee details." });
    }

    // Find all active students in this cohort
    const students = await User.find({ classId, role: "student", isApproved: true });
    
    if (students.length === 0) {
      return res.status(404).json({ message: "No active students found in this cohort." });
    }

    // Create an invoice for every student
    const feeInvoices = students.map((student) => ({
      studentId: student._id,
      classId,
      feeType: feeType || "Tuition",
      semester,
      totalAmount,
      dueDate
    }));

    // Bulk insert into the database
    await Fee.insertMany(feeInvoices);

    res.status(201).json({
      message: `Successfully generated ${feeInvoices.length} invoices for the cohort.`,
    });
  } catch (err) {
    console.error("GENERATE FEES ERROR:", err);
    res.status(500).json({ message: "Failed to generate bulk fees." });
  }
};

/* =======================================
      ADMIN/BURSAR: VIEW ALL COHORT FEES
======================================= */
export const getClassFees = async (req, res) => {
  try {
    const { classId } = req.params;
    const { semester } = req.query; // Optional filter

    let query = { classId };
    if (semester) query.semester = semester;

    const fees = await Fee.find(query)
      .populate("studentId", "name email roll")
      .sort({ dueDate: 1 });

    res.json({ fees });
  } catch (err) {
    console.error("GET CLASS FEES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch cohort financials." });
  }
};

/* =======================================
      STUDENT: GET MY FINANCIALS
======================================= */
export const getMyFees = async (req, res) => {
  try {
    const studentId = req.user._id;

    const fees = await Fee.find({ studentId })
      .populate("classId", "name")
      .sort({ dueDate: 1 });

    res.json({ fees });
  } catch (err) {
    console.error("GET MY FEES ERROR:", err);
    res.status(500).json({ message: "Failed to load your financial account." });
  }
};

/* =======================================
      STUDENT/BURSAR: PROCESS PAYMENT
======================================= */
export const processPayment = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { amount, method, transactionId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount." });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ message: "Invoice not found." });

    if (fee.status === "paid") {
      return res.status(400).json({ message: "This invoice is already fully paid." });
    }

    // Check if they are trying to overpay
    if (amount > fee.balance) {
      return res.status(400).json({ 
        message: `Payment exceeds remaining balance. You only owe ${fee.balance}.` 
      });
    }

    // 1. Add to amount paid
    fee.amountPaid += Number(amount);

    // 2. Log the transaction in the ledger
    fee.paymentHistory.push({
      amount: Number(amount),
      method: method || "Bank Transfer",
      transactionId: transactionId || `TXN-${Math.floor(Math.random() * 1000000)}`
    });

    // 3. Save (This automatically triggers the .pre('save') hook in Fee.js to update status and academic holds!)
    await fee.save();

    res.json({ 
      message: `Payment of ${amount} processed successfully.`,
      status: fee.status,
      balanceRemaining: fee.balance
    });
  } catch (err) {
    console.error("PROCESS PAYMENT ERROR:", err);
    res.status(500).json({ message: "Failed to process payment transaction." });
  }
};