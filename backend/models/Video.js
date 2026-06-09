const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: { type: String, required: true },
    semester: { type: String, default: "" },    // ✅ ADD KARO
    year: { type: String, default: "" },        // ✅ ADD KARO
    videoUrl: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    description: { type: String, default: "" },
    isPremium: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Video || mongoose.model("Video", videoSchema);