const fs = require("fs");
const PDFDocument = require("pdfkit");

function createInvoice(invoice, path) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc, invoice);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc, invoice);

  doc.end();
  
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(path);
    doc.pipe(stream);
    
    stream.on('finish', () => {
      resolve();
    });
    
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

function generateHeader(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(14)
    .text(invoice.company?.cmpyname || "", 50, 50, { align: "center", width: 500 })
    .fontSize(10)
    .text(invoice.company?.phone || "", 50, 70, { align: "center", width: 500 })
    .text(invoice.company?.email || "", 50, 85, { align: "center", width: 500 })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  const customerInformationTop = 180;

  const subtotal = calculateSubtotal(invoice.items || []);
  const amountPaid = invoice.paid || 0;
  const balanceDue = subtotal - amountPaid;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.invoiceNumber, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(
      formatCurrency(balanceDue),
      150,
      customerInformationTop + 30
    )

    .font("Helvetica-Bold")
    .text(invoice.customer?.name || "", 400, customerInformationTop)
    .font("Helvetica")
    .text(invoice.customer?.address || "", 400, customerInformationTop + 15)
    .text(
      (invoice.customer?.city || "") +
        (invoice.customer?.state ? ", " + invoice.customer.state : "") +
        (invoice.customer?.zip ? ", " + invoice.customer.zip : ""),
      400,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 232);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 310;
  const items = invoice.items || [];

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Description",
    "Unit Cost",
    "Quantity",
    "Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < items.length; i++) {
    const item = items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    const unitCost = parseFloat(item.unitCost) || 0;
    const quantity = parseInt(item.quantity) || 0;
    const lineTotal = unitCost * quantity;
    
    generateTableRow(
      doc,
      position,
      item.item || "",
      item.description || "",
      formatCurrency(unitCost),
      quantity.toString(),
      formatCurrency(lineTotal)
    );

    generateHr(doc, position + 20);
  }

  // Calculate and display totals
  const subtotal = calculateSubtotal(items);
  const amountPaid = parseFloat(invoice.paid) || 0;
  const balanceDue = subtotal - amountPaid;

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  const paidPosition = subtotalPosition + 20;
  const duePosition = paidPosition + 20;

  doc.font("Helvetica-Bold");
  
  // Subtotal
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal:",
    "",
    formatCurrency(subtotal)
  );

  // Amount Paid
  if (amountPaid > 0) {
    doc.font("Helvetica");
    generateTableRow(
      doc,
      paidPosition,
      "",
      "",
      "Amount Paid:",
      "",
      formatCurrency(amountPaid)
    );
    doc.font("Helvetica-Bold");
  }

  // Balance Due
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Balance Due:",
    "",
    formatCurrency(balanceDue)
  );
  
  doc.font("Helvetica");
}

function generateFooter(doc, invoice) {
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      invoice.noteadd,
      50,
      740,
      { align: "center", width: 500 }
    );
}
function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function calculateSubtotal(items) {
  return items.reduce((total, item) => {
    const unitCost = parseFloat(item.unitCost) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return total + (unitCost * quantity);
  }, 0);
}

function formatCurrency(dollars) {
  return "$" + parseFloat(dollars).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = {
  createInvoice
};