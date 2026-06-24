const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    course: {
      type: String,
      required: true,
    },

    videoUrl: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },
    isPremium: {
  type: Boolean,
  default: true,
},

    views: {              
      type: Number,
      default: 0,
    },
    
    // 🔥 YEH ADD KARO - VIDEO KO 'SAVE' YA 'DOWNLOAD' KARNE KE LIYE
    downloadCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Video || mongoose.model("Video", videoSchema);