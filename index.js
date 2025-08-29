const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { createInvoice } = require("./createInvoice");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// Endpoint: save form data to JSON and return generated PDF
app.post("/generate-invoice", (req, res) => {
  const invoice = req.body;

  // Save to invoiceData.json
  fs.writeFileSync("invoiceData.json", JSON.stringify(invoice, null, 2));

  // Generate PDF
  const pdfPath = path.join(__dirname, "invoice.pdf");
  createInvoice(invoice, pdfPath);

  // Return file directly for download
  res.download(pdfPath, "invoice.pdf");
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
