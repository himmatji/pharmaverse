const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  thumbnail: { type: String, default: "" },  
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: String, required: true },
  fileData: { type: String, required: true },
  description: { type: String, default: "" },
  views: { type: Number, default: 0 },
  // 🔥 YEH ADD KARO - DOWNLOAD COUNT
  downloadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);