require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: (process.env.SMTP_APP_PASSWORD || "").replace(/\s/g, "")
  }
});

transporter.verify()
  .then(() => console.log("SUCCESS: Gmail SMTP working"))
  .catch((err) => console.error("SMTP ERROR:", err.message));
