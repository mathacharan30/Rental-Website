const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const Counter = require('../models/Counter');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Store = require('../models/Store');

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
      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const PW = 595.28; // A4 width in points
      const PH = 841.89; // A4 height
      const M  = 30;     // outer margin
      const CW = PW - M * 2; // content width

      // ─── Helper: horizontal rule ─────────────────────────────────────────
      const hline = (y, x1 = M, x2 = PW - M, w = 0.5, color = '#CCCCCC') => {
        doc.save().strokeColor(color).lineWidth(w).moveTo(x1, y).lineTo(x2, y).stroke().restore();
      };
      const rect = (x, y, w, h, fillColor = null, strokeColor = '#CCCCCC', sw = 0.5) => {
        doc.save();
        if (fillColor) doc.rect(x, y, w, h).fillAndStroke(fillColor, strokeColor);
        else doc.rect(x, y, w, h).lineWidth(sw).stroke(strokeColor);
        doc.restore();
      };

      // ─── 1. TOP HEADER BAR ───────────────────────────────────────────────
      rect(0, 0, PW, 6, '#1A1A2E', '#1A1A2E');

      // Company name (top-left)
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#1A1A2E');
      doc.text('People & Style', M, 18, { width: 200 });
      doc.font('Helvetica').fontSize(8).fillColor('#555555');
      doc.text('Fashion Rental Services', M, 37, { width: 200 });

      // Invoice title (top-center)
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#1A1A2E');
      doc.text(title, 0, 20, { width: PW, align: 'center' });

      // Invoice meta (top-right)
      const metaX = PW - M - 170;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#1A1A2E');
      doc.text('INVOICE NO:', metaX, 18, { width: 80, align: 'left' });
      doc.font('Helvetica').fontSize(8).fillColor('#333333');
      doc.text(invoiceObj.invoiceNumber, metaX + 75, 18, { width: 95, align: 'left' });

      doc.font('Helvetica-Bold').fontSize(8).fillColor('#1A1A2E');
      doc.text('DATE:', metaX, 32, { width: 80, align: 'left' });
      doc.font('Helvetica').fontSize(8).fillColor('#333333');
      doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), metaX + 75, 32, { width: 95 });

      let Y = 60;
      hline(Y, M, PW - M, 1, '#1A1A2E');
      Y += 8;

      // ─── 2. SELLER + BUYER SECTION ───────────────────────────────────────
      const leftColW  = CW * 0.5 - 5;
      const rightColX = M + leftColW + 10;
      const rightColW = CW * 0.5 - 5;

      // Seller box
      rect(M, Y, leftColW, 100, '#F5F7FF', '#DDDDDD');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#888888');
      doc.text('SUPPLIER (SELLER)', M + 8, Y + 7, { width: leftColW - 16 });
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#1A1A2E');
      doc.text('People & Style', M + 8, Y + 19, { width: leftColW - 16 });
      doc.font('Helvetica').fontSize(8).fillColor('#444444');
      doc.text('#64 Matha, Bogadi, Mysuru, Karnataka - 570026', M + 8, Y + 33, { width: leftColW - 16 });
      doc.text('GSTIN: 29XXXXX0000X1Z5', M + 8, Y + 53, { width: leftColW - 16 });
      doc.text('Phone: +91 84319 04754', M + 8, Y + 65, { width: leftColW - 16 });
      doc.text('Email: hello@peopleandstyle.in', M + 8, Y + 77, { width: leftColW - 16 });

      // Buyer box
      rect(rightColX, Y, rightColW, 100, '#F5F7FF', '#DDDDDD');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#888888');
      doc.text('BILL TO (CUSTOMER)', rightColX + 8, Y + 7, { width: rightColW - 16 });
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#1A1A2E');
      doc.text(invoiceObj.customerName || 'Customer', rightColX + 8, Y + 19, { width: rightColW - 16 });
      doc.font('Helvetica').fontSize(8).fillColor('#444444');
      if (invoiceObj.customerPhone) doc.text(`Phone: ${invoiceObj.customerPhone}`, rightColX + 8, Y + 33, { width: rightColW - 16 });
      if (invoiceObj.customerEmail) doc.text(`Email: ${invoiceObj.customerEmail}`, rightColX + 8, Y + 45, { width: rightColW - 16 });
      if (invoiceObj.customerAddress) doc.text(`Address: ${invoiceObj.customerAddress}`, rightColX + 8, Y + 57, { width: rightColW - 16 });

      Y += 110;

      // ─── 3. METADATA ROW ─────────────────────────────────────────────────
      rect(M, Y, CW, 30, '#1A1A2E', '#1A1A2E');
      const metaCols = [
        { label: 'PLACE OF SUPPLY', value: 'Karnataka - 29' },
        { label: 'REVERSE CHARGE', value: 'No' },
        { label: 'PAYMENT MODE', value: invoiceObj.paymentMode || 'PhonePe' },
        { label: 'TXN REFERENCE', value: (invoiceObj.paymentReference || 'N/A').toString().slice(0, 22) },
      ];
      const metaColW = CW / metaCols.length;
      metaCols.forEach((col, i) => {
        const cx = M + i * metaColW;
        doc.font('Helvetica-Bold').fontSize(7).fillColor('#AAAAAA');
        doc.text(col.label, cx + 6, Y + 5, { width: metaColW - 12 });
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
        doc.text(col.value, cx + 6, Y + 16, { width: metaColW - 12 });
        if (i < metaCols.length - 1) {
          doc.save().strokeColor('#444466').lineWidth(0.5).moveTo(cx + metaColW, Y + 4).lineTo(cx + metaColW, Y + 26).stroke().restore();
        }
      });
      Y += 38;

      // ─── 4. ITEMS TABLE ──────────────────────────────────────────────────
      const tHeaders = ['Sr.', 'Description of Goods / Services', 'HSN/SAC', 'Qty', 'Rate (₹)', 'Taxable Value (₹)'];
      const tColW    = [25, 170, 55, 30, 65, 90];
      const tRowH    = 22;

      // Draw header row
      rect(M, Y, CW, tRowH, '#1A1A2E', '#1A1A2E');
      let colX = M;
      tHeaders.forEach((h, i) => {
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        const align = i >= 3 ? 'right' : 'left';
        doc.text(h, colX + 5, Y + 7, { width: tColW[i] - 10, align });
        colX += tColW[i];
      });
      Y += tRowH;

      // Draw data row
      const taxableValue = invoiceObj.taxableValue;
      const rowData = [
        '1',
        `${invoiceObj.productName} (Rental Service)`,
        'SAC: 9973',
        '1',
        `${taxableValue.toFixed(2)}`,
        `${taxableValue.toFixed(2)}`,
      ];
      rect(M, Y, CW, tRowH + 4, '#FAFAFA', '#DDDDDD');
      colX = M;
      rowData.forEach((d, i) => {
        doc.font('Helvetica').fontSize(8).fillColor('#222222');
        const align = i >= 3 ? 'right' : 'left';
        doc.text(d, colX + 5, Y + 8, { width: tColW[i] - 10, align });
        colX += tColW[i];
      });

      // Column separators for data row
      colX = M;
      tColW.forEach((w, i) => {
        if (i < tColW.length - 1) {
          doc.save().strokeColor('#DDDDDD').lineWidth(0.5)
            .moveTo(colX + w, Y).lineTo(colX + w, Y + tRowH + 4).stroke().restore();
        }
        colX += w;
      });
      Y += tRowH + 4;
      hline(Y, M, PW - M, 1, '#CCCCCC');
      Y += 14;

      // ─── 5. TAX SUMMARY (right-aligned) ──────────────────────────────────
      const summaryX = PW - M - 220;
      const summaryLabelW = 140;
      const summaryValW   = 75;

      const summaryRows = [
        { label: 'Taxable Value',         value: `₹ ${invoiceObj.taxableValue.toFixed(2)}`,   bold: false },
        { label: 'CGST @ 9%',             value: `₹ ${invoiceObj.cgstAmount.toFixed(2)}`,     bold: false },
        { label: 'SGST @ 9%',             value: `₹ ${invoiceObj.sgstAmount.toFixed(2)}`,     bold: false },
        { label: 'Total GST',             value: `₹ ${invoiceObj.totalGst.toFixed(2)}`,       bold: false },
        { label: 'Rental Charge (Incl. GST)', value: `₹ ${(invoiceObj.taxableValue + invoiceObj.cgstAmount + invoiceObj.sgstAmount).toFixed(2)}`, bold: true, bg: '#EEF1FF' },
        { label: 'Refundable Deposit (No GST)', value: `₹ ${invoiceObj.depositAmount.toFixed(2)}`, bold: false, note: true },
      ];

      summaryRows.forEach((row) => {
        if (row.bg) rect(summaryX, Y - 2, summaryLabelW + summaryValW + 10, 18, row.bg, '#CCDDFF');
        doc.font(row.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5).fillColor(row.note ? '#666666' : '#222222');
        doc.text(row.label, summaryX + 4, Y, { width: summaryLabelW, align: 'left' });
        doc.font(row.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5).fillColor(row.note ? '#666666' : '#222222');
        doc.text(row.value, summaryX + summaryLabelW, Y, { width: summaryValW, align: 'right' });
        Y += 18;
      });

      Y += 6;
      hline(Y, summaryX, PW - M, 1.5, '#1A1A2E');
      Y += 8;

      // ─── 6. GRAND TOTAL ──────────────────────────────────────────────────
      rect(summaryX, Y - 2, summaryLabelW + summaryValW + 10, 24, '#1A1A2E', '#1A1A2E');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF');
      doc.text('GRAND TOTAL', summaryX + 4, Y + 5, { width: summaryLabelW, align: 'left' });
      doc.text(`₹ ${invoiceObj.grandTotal.toFixed(2)}`, summaryX + summaryLabelW, Y + 5, { width: summaryValW, align: 'right' });
      Y += 34;

      // Amount in words helper
      const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
      const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
      function numToWords(n) {
        n = Math.round(n);
        if (n === 0) return 'Zero';
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' ' + ones[n%10] : '');
        if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + numToWords(n%100) : '');
        if (n < 100000) return numToWords(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + numToWords(n%1000) : '');
        return numToWords(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + numToWords(n%100000) : '');
      }
      const amtWords = numToWords(Math.round(invoiceObj.grandTotal)) + ' Rupees Only';
      doc.font('Helvetica').fontSize(8).fillColor('#555555');
      doc.text(`Amount in Words: ${amtWords}`, M, Y, { width: CW * 0.65 });
      Y += 20;

      // ─── 7. NOTES ────────────────────────────────────────────────────────
      hline(Y, M, PW - M, 0.5);
      Y += 8;
      rect(M, Y, CW, 46, '#FFFDF0', '#FDECC8');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#555500');
      doc.text('Notes & Terms:', M + 8, Y + 7, { width: CW - 16 });
      doc.font('Helvetica').fontSize(7.5).fillColor('#444400');
      doc.text('1. The refundable deposit of ₹ ' + invoiceObj.depositAmount.toFixed(2) + ' will be returned directly upon safe return of the product.', M + 8, Y + 19, { width: CW - 16 });
      doc.text('2. Late return charges may apply as per the rental agreement. GST as applicable will be charged on any additional charges.', M + 8, Y + 31, { width: CW - 16 });
      Y += 56;

      // ─── 8. FOOTER ───────────────────────────────────────────────────────
      const footerY = PH - 30;
      rect(0, footerY - 4, PW, 6, '#1A1A2E', '#1A1A2E');
      doc.font('Helvetica').fontSize(7.5).fillColor('#888888');
      doc.text('This is a system-generated invoice. No signature required.', M, footerY + 8, { width: CW, align: 'center' });

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
      const emailBody = `Hi ${newInvoice.customerName},\n\nYour order has been confirmed!\nOrder Reference: ${order.orderReference}\nProduct: ${newInvoice.productName}\nTotal Paid: Rs. ${newInvoice.grandTotal.toFixed(2)}\n\nPlease find your tax invoice attached. Note that your refundable deposit of Rs. ${newInvoice.depositAmount.toFixed(2)} will be returned directly upon product return.\n\nThank you for choosing People&Style!`;

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
