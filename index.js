const { createInvoice } = require("./createInvoice.js");

const invoice = {
  shipping: {
    name: "John Doe",
    address: "1234 Main Street",
    city: "San Francisco",
    state: "CA",
    country: "US",
    postal_code: 94111
  },
  items: [
    {
      item: "Item 1",
      description: "Whatever you want",
      quantity: 1,
      amount: 100
    },
    {
      item: "Item 2",
      description: "Whatever you want",
      quantity: 1,
      amount: 100
    }
  ],
  subtotal: 200,
  paid: 0,
  invoice_nr: 1234
};

createInvoice(invoice, "invoice.pdf");
