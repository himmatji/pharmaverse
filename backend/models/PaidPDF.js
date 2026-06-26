const mongoose = require("mongoose");

const paidPDFSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },

  // B.Pharm / M.Pharm / Pharm.D / PhD
  semester: {
    type: String,
    default: "",
  },

  // D.Pharm
  year: {
    type: String,
    default: "",
  },

  // D.Pharm
  language: {
    type: String,
    default: "",
  },

  thumbnail: { type: String, default: "" },

  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: String, required: true },
  fileData: { type: String, required: true },

  description: { type: String, default: "" },

  price: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("PaidPDF", paidPDFSchema);

