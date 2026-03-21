const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true }, // INV-YYYY-XXXXX
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: null },
    customerEmail: { type: String, required: true },
    customerAddress: { type: String, default: null },
    productName: { type: String, required: true },
    rentalStartDate: { type: Date, default: null },
    rentalEndDate: { type: Date, default: null },
    
    // Pricing details
    advanceAmount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    rentAmount: { type: Number, required: true },
    depositAmount: { type: Number, required: true }, // advance - rent
    
    // Taxes
    taxableValue: { type: Number, required: true }, // (rent + commission) / 1.18
    cgstAmount: { type: Number, required: true }, // 9% of taxableValue
    sgstAmount: { type: Number, required: true }, // 9% of taxableValue
    totalGst: { type: Number, required: true }, // cgst + sgst
    
    grandTotal: { type: Number, required: true }, // advance + commission
    
    paymentMode: { type: String, default: null },
    paymentReference: { type: String, default: null },
    
    // Document and Email State
    s3PdfUrl: { type: String, default: null },
    type: { type: String, enum: ['Tax Invoice', 'Credit Note'], default: 'Tax Invoice' },
    emailedTo: { type: String, default: null },
    emailedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
