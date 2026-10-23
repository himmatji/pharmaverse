require("dotenv").config();

console.log("Email configured:", !!process.env.SMTP_EMAIL);
console.log("App password configured:", !!process.env.SMTP_APP_PASSWORD);
