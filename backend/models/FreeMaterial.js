const mongoose = require('mongoose');

const freeMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  course: { type: String, required: true, enum: ['B.Pharm', 'D.Pharm', 'M.Pharm'] },
  semester: { type: String, default: "" },
  
  // File information
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: String, required: true },
  fileData: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  
  // For videos
  videoUrl: { type: String, default: "" },
  
  // Material type for icon
  materialType: { 
    type: String, 
    enum: ['note', 'video', 'pdf', 'presentation', 'doc', 'zip', 'other'],
    default: 'note'
  },
  
  icon: { type: String, default: "📄" },
  
  // 🔥 YEH ADD KARO - DOWNLOAD COUNT
  downloadCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FreeMaterial', freeMaterialSchema);