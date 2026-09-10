const mongoose = require("mongoose");

const InterviewMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: String,
      default: "",
    },

    fileData: {
      type: String,
      required: true,
    },

    downloadCount: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "interviewmaterials",
  }
);

InterviewMaterialSchema.methods.incrementDownloads = async function () {
  this.downloadCount = (this.downloadCount || 0) + 1;
  await this.save();
};

module.exports = mongoose.model(
  "InterviewMaterial",
  InterviewMaterialSchema
);