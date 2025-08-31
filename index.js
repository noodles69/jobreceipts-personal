const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { createInvoice } = require("./createInvoice");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/generate-invoice", async (req, res) => {
  try {
    const invoice = req.body;


    if (!invoice.items || !Array.isArray(invoice.items)) {
      return res.status(400).json({ error: "Invoice items are required" });
    }

    function generateInvoiceNumber() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      if (invoice.invoiceNumber) {
        endNumbers = invoice.invoiceNumber
      } else endNumbers = Math.floor(Math.random() * 90) + 10;
      
      return `INV${month}${day}${year}-${endNumbers}`;
    }
    let INVNum = generateInvoiceNumber()

    const processedInvoice = {
      invoiceNumber: INVNum,
      company: {
        cmpyname: invoice.company?.cmpyname || "Your Company Name",
        phone: invoice.company?.phone || "(555)123-4567",
        email: invoice.company?.email || "name@example.com"
      },
      customer: {
        name: invoice.customer?.name || "John Doe",
        address: invoice.customer?.address || "123 Elmo Street",
        city: invoice.customer?.city || "Royse City",
        state: invoice.customer?.state || "TX",
        zip: invoice.customer?.zip || "75189"
      },
      items: invoice.items.map(item => ({
        item: item.item || "",
        description: item.description || "",
        unitCost: parseFloat(item.unitCost) || 0,
        quantity: parseInt(item.quantity) || 0
      })),
      paid: parseFloat(invoice.paid) || 0,
      noteadd: invoice.noteadd || "Payment is due upon job completion. Thank you for your business."
    };
    // Save to invoiceData.json
    fs.writeFileSync("invoiceData.json", JSON.stringify(processedInvoice, null, 2));

    //Trying to name the file be the invoicenumber
    // Generate PDF
    const pdfPath = path.join(__dirname, "invoice.pdf");
    
    await createInvoice(processedInvoice, pdfPath);

    if (fs.existsSync(pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${INVNum}"`)
      res.sendFile(pdfPath, (err) => {
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