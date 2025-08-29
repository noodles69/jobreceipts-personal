const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { createInvoice } = require("./createInvoice");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// Endpoint: save form data to JSON and return generated PDF
app.post("/generate-invoice", async (req, res) => {
  try {
    const invoice = req.body;

    // Validate required data
    if (!invoice.items || !Array.isArray(invoice.items)) {
      return res.status(400).json({ error: "Invoice items are required" });
    }

    // Generate invoice number if not provided
    function generateInvoiceNumber() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const randomNum = Math.floor(Math.random() * 9000) + 10;
      
      return `INV${month}${day}${year}-${randomNum}`;
    }

    // Ensure proper data structure with defaults
    const processedInvoice = {
      invoiceNumber: invoice.invoiceNumber || generateInvoiceNumber(),
      company: {
        cmpyname: invoice.company?.cmpyname || "Your Company Name",
        phone: invoice.company?.phone || "",
        email: invoice.company?.email || ""
      },
      customer: {
        name: invoice.customer?.name || "Customer Name",
        address: invoice.customer?.address || "",
        city: invoice.customer?.city || "",
        state: invoice.customer?.state || "",
        country: invoice.customer?.country || ""
      },
      items: invoice.items.map(item => ({
        item: item.item || "",
        description: item.description || "",
        unitCost: parseFloat(item.unitCost) || 0,
        quantity: parseInt(item.quantity) || 0
      })),
      paid: parseFloat(invoice.paid) || 0
    };

    // Save to invoiceData.json
    fs.writeFileSync("invoiceData.json", JSON.stringify(processedInvoice, null, 2));

    // Generate PDF
    const pdfPath = path.join(__dirname, "invoice.pdf");
    
    // Wait for PDF generation to complete
    await createInvoice(processedInvoice, pdfPath);

    // Check if file exists before sending
    if (fs.existsSync(pdfPath)) {
      res.download(pdfPath, "invoice.pdf", (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).json({ error: "Error downloading PDF" });
        }
      });
    } else {
      res.status(500).json({ error: "PDF generation failed" });
    }

  } catch (error) {
    console.error("Error processing invoice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});