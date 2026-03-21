const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const Counter = require('../models/Counter');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function getNextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

async function generateInvoiceNumber() {
  const seq = await getNextSequence('invoiceId');
  const year = new Date().getFullYear();
  const paddedSeq = String(seq).padStart(5, '0');
  return `INV-${year}-${paddedSeq}`;
}

async function generateOrderReference() {
  const seq = await getNextSequence('orderId');
  const year = new Date().getFullYear();
  const paddedSeq = String(seq).padStart(5, '0');
  return `ORD-${year}-${paddedSeq}`;
}

function calculateTaxes(rentAmount, commissionAmount, advanceAmount) {
  const totalTaxable = rentAmount + commissionAmount;
  const taxableValue = totalTaxable / 1.18;
  const cgstAmount = taxableValue * 0.09;
  const sgstAmount = taxableValue * 0.09;
  const totalGst = cgstAmount + sgstAmount;
  const depositAmount = advanceAmount - rentAmount;
  const grandTotal = advanceAmount + commissionAmount;

  return {
    advanceAmount,
    commissionAmount,
    rentAmount,
    depositAmount,
    taxableValue: Number(taxableValue.toFixed(2)),
    cgstAmount: Number(cgstAmount.toFixed(2)),
    sgstAmount: Number(sgstAmount.toFixed(2)),
    totalGst: Number(totalGst.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}

async function createInvoicePDF(invoiceObj, title = 'TAX INVOICE') {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('People&Style', { align: 'left' });
      doc.fontSize(10).text('GSTIN: 29XXXXX0000X1Z5', { align: 'left' }); // placeholder GSTIN
      doc.moveDown();

      doc.fontSize(16).text(title, { align: 'right', lineGap: 5 });
      doc.fontSize(10).text(`Invoice Number: ${invoiceObj.invoiceNumber}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Customer Details
      doc.fontSize(12).text('Billed To:');
      doc.fontSize(10).text(`Name: ${invoiceObj.customerName}`);
      if (invoiceObj.customerPhone) doc.text(`Phone: ${invoiceObj.customerPhone}`);
      doc.text(`Email: ${invoiceObj.customerEmail}`);
      if (invoiceObj.customerAddress) doc.text(`Address: ${invoiceObj.customerAddress}`);
      doc.moveDown();

      // Product Details
      doc.fontSize(12).text('Order Details:');
      doc.fontSize(10).text(`Product: ${invoiceObj.productName}`);
      if (invoiceObj.rentalStartDate && invoiceObj.rentalEndDate) {
        doc.text(`Rental Period: ${new Date(invoiceObj.rentalStartDate).toLocaleDateString()} to ${new Date(invoiceObj.rentalEndDate).toLocaleDateString()}`);
      }
      doc.moveDown();

      // Pricing Table
      doc.fontSize(12).text('Payment Details:', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(10);
      const startX = 50;
      let currY = doc.y;

      const items = [
        { label: 'Taxable Value', value: invoiceObj.taxableValue.toFixed(2) },
        { label: 'CGST (9%)', value: invoiceObj.cgstAmount.toFixed(2) },
        { label: 'SGST (9%)', value: invoiceObj.sgstAmount.toFixed(2) },
        { label: 'Total GST Inclusive Amount (Rental Charge)', value: (invoiceObj.taxableValue + invoiceObj.cgstAmount + invoiceObj.sgstAmount).toFixed(2) },
        { label: 'Refundable Deposit (No GST)', value: invoiceObj.depositAmount.toFixed(2) },
      ];

      items.forEach((item) => {
        doc.text(item.label, startX, currY);
        doc.text(`Rs. ${item.value}`, 400, currY, { align: 'right' });
        currY += 20;
      });

      doc.moveDown();
      currY += 10;
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Grand Total', startX, currY);
      doc.text(`Rs. ${invoiceObj.grandTotal.toFixed(2)}`, 400, currY, { align: 'right' });
      doc.font('Helvetica').fontSize(10);
      doc.moveDown(2);

      // Payment Info
      if (invoiceObj.paymentMode) {
        doc.text(`Payment Mode: ${invoiceObj.paymentMode}`);
      }
      if (invoiceObj.paymentReference) {
        doc.text(`Transaction Reference: ${invoiceObj.paymentReference}`);
      }
      doc.moveDown();

      // Footer
      doc.fontSize(10).text('Note: The refundable deposit will be returned directly upon product return.', { align: 'center', style: 'italic' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function uploadToS3(pdfBuffer, fileName) {
  const bucketName = process.env.S3_BUCKET_NAME || 'people-and-style-assets';
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `invoices/${fileName}`,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
  });
  await s3Client.send(command);
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/invoices/${fileName}`;
}

async function sendEmailWithAttachment(to, subject, text, pdfBuffer, fileName) {
  const mailOptions = {
    from: `"People&Style" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
      },
    ],
  };
  await transporter.sendMail(mailOptions);
}

// Retries a function up to maxRetries times
async function withRetry(fn, maxRetries = 1) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) throw error;
      console.warn(`[InvoiceService] Retry attempt ${attempt} failed, retrying...`);
    }
  }
}

async function processOrderConfirmation(orderId) {
  try {
    const order = await Order.findById(orderId).populate('customer product store');
    if (!order) throw new Error('Order not found');

    if (order.invoiceId) {
      console.log(`[InvoiceService] Order ${orderId} already has an invoice.`);
      return;
    }

    const { rentPrice, commissionPrice, advanceAmount } = order;
    const taxes = calculateTaxes(rentPrice || 0, commissionPrice || 0, advanceAmount || 0);

    const invoiceNumber = await generateInvoiceNumber();
    
    // Only generate format if not already generated
    if (!order.orderReference) {
       order.orderReference = await generateOrderReference();
       await Order.findByIdAndUpdate(orderId, { orderReference: order.orderReference });
    }

    const invoiceObj = {
      invoiceNumber,
      orderId: order._id,
      customerName: order.customer?.name || 'Customer',
      customerPhone: order.customer?.phone || '',
      customerEmail: order.customer?.email || '',
      customerAddress: order.customer?.address || '',
      productName: order.product?.name || 'Product',
      rentalStartDate: order.startDate,
      rentalEndDate: order.endDate,
      ...taxes,
      paymentMode: order.paymentMethod,
      paymentReference: order.paymentId,
      type: 'Tax Invoice'
    };

    // 1. Save initial invoice to DB
    const newInvoice = await Invoice.create(invoiceObj);
    
    // 2. Link to Order
    await Order.findByIdAndUpdate(order._id, { invoiceId: newInvoice._id });

    // 3. Generate PDF
    let pdfBuffer;
    try {
      pdfBuffer = await withRetry(() => createInvoicePDF(newInvoice));
    } catch (pdfErr) {
      console.error('[InvoiceService] PDF generation failed after retries:', pdfErr);
      return; // Do not block order confirmation
    }

    const fileName = `${newInvoice.invoiceNumber}.pdf`;

    // 4. Upload to S3
    let s3Url;
    try {
      s3Url = await withRetry(() => uploadToS3(pdfBuffer, fileName));
      newInvoice.s3PdfUrl = s3Url;
      await newInvoice.save();
    } catch (s3Err) {
      console.error('[InvoiceService] S3 upload failed:', s3Err);
    }

    // 5. Send Email
    try {
      const emailSubject = `Order Confirmed: ${newInvoice.productName} - ${newInvoice.invoiceNumber}`;
      const emailBody = `Hi ${newInvoice.customerName},\n\nYour order has been confirmed!\nOrder Reference: ${order.orderReference}\nProduct: ${newInvoice.productName}\nRental Dates: ${new Date(newInvoice.rentalStartDate).toLocaleDateString()} to ${new Date(newInvoice.rentalEndDate).toLocaleDateString()}\nTotal Paid: Rs. ${newInvoice.grandTotal.toFixed(2)}\n\nPlease find your tax invoice attached. Note that your refundable deposit of Rs. ${newInvoice.depositAmount.toFixed(2)} will be returned directly upon product return.\n\nThank you for choosing People&Style!`;

      await withRetry(() => sendEmailWithAttachment(newInvoice.customerEmail, emailSubject, emailBody, pdfBuffer, fileName));
      newInvoice.emailedTo = newInvoice.customerEmail;
      newInvoice.emailedAt = new Date();
      await newInvoice.save();
    } catch (emailErr) {
      console.error('[InvoiceService] Email sending failed:', emailErr);
    }
    
    console.log(`[InvoiceService] Successfully processed invoice for order ${orderId}`);

  } catch (err) {
    console.error('[InvoiceService] Critical Error:', err);
  }
}

async function generateCreditNote(orderId) {
  try {
    const order = await Order.findById(orderId).populate('customer product');
    if (!order || !order.invoiceId) return; // Note: Cannot create credit note without invoice

    const originalInvoice = await Invoice.findById(order.invoiceId);
    if (!originalInvoice) return;

    // Check if Credit Note already exists
    const existingCN = await Invoice.findOne({ orderId: order._id, type: 'Credit Note' });
    if (existingCN) return;

    const creditNoteNumber = await generateInvoiceNumber(); // Assuming we use same sequence but mark as Credit Note
    
    const cnObj = {
      ...originalInvoice.toObject(),
      _id: undefined,
      invoiceNumber: creditNoteNumber,
      type: 'Credit Note',
      s3PdfUrl: null,
      emailedTo: null,
      emailedAt: null,
      // Reversing amounts
      taxableValue: -Math.abs(originalInvoice.taxableValue),
      cgstAmount: -Math.abs(originalInvoice.cgstAmount),
      sgstAmount: -Math.abs(originalInvoice.sgstAmount),
      totalGst: -Math.abs(originalInvoice.totalGst),
      grandTotal: -Math.abs(originalInvoice.grandTotal),
      depositAmount: -Math.abs(originalInvoice.depositAmount),
      rentAmount: -Math.abs(originalInvoice.rentAmount),
      commissionAmount: -Math.abs(originalInvoice.commissionAmount),
      advanceAmount: -Math.abs(originalInvoice.advanceAmount),
    };

    const newCreditNote = await Invoice.create(cnObj);

    let pdfBuffer;
    try {
      pdfBuffer = await withRetry(() => createInvoicePDF(newCreditNote, 'CREDIT NOTE'));
    } catch (pdfErr) {
      console.error('[InvoiceService] Credit Note PDF generation failed:', pdfErr);
      return;
    }

    const fileName = `${newCreditNote.invoiceNumber}.pdf`;

    let s3Url;
    try {
      s3Url = await withRetry(() => uploadToS3(pdfBuffer, fileName));
      newCreditNote.s3PdfUrl = s3Url;
      await newCreditNote.save();
    } catch (s3Err) {
      console.error('[InvoiceService] Credit Note S3 upload failed:', s3Err);
    }

    try {
      const emailSubject = `Order Cancelled - Credit Note: ${newCreditNote.productName} - ${newCreditNote.invoiceNumber}`;
      const emailBody = `Hi ${newCreditNote.customerName},\n\nYour order has been cancelled and a credit note has been generated.\nOrder Reference: ${order.orderReference}\nProduct: ${newCreditNote.productName}\n\nPlease find your credit note attached.\n\nThank you.`;

      await withRetry(() => sendEmailWithAttachment(newCreditNote.customerEmail, emailSubject, emailBody, pdfBuffer, fileName));
      newCreditNote.emailedTo = newCreditNote.customerEmail;
      newCreditNote.emailedAt = new Date();
      await newCreditNote.save();
    } catch (emailErr) {
      console.error('[InvoiceService] Credit Note Email sending failed:', emailErr);
    }

    console.log(`[InvoiceService] Successfully processed credit note for order ${orderId}`);
  } catch (err) {
    console.error('[InvoiceService] Credit Note Critical Error:', err);
  }
}

module.exports = {
  generateOrderReference,
  processOrderConfirmation,
  generateCreditNote
};
