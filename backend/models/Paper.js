const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: String, default: "" },   // B.Pharm, M.Pharm, Pharm.D, PhD ke liye
  year: { type: String, default: "" },       // D.Pharm ke liye
  difficulty: { type: String, default: "Medium" },
  questions: { type: String, default: "0" },
  thumbnail: { type: String, default: "" }, 
  fileName: { type: String, default: "" },
  fileType: { type: String, default: "" },
  fileSize: { type: String, default: "" },
  fileData: { type: String, default: "" },
  description: { type: String, default: "" },
  isPremium: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paper', paperSchema);