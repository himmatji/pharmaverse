const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    userName: {
      type: String,
      default: "Anonymous",
      trim: true
    },

    userEmail: {
      type: String,
      default: "",
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    isAdmin: {
      type: Boolean,
      default: false
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true
  }
);

const doubtSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },

    userName: {
      type: String,
      default: "Anonymous",
      trim: true
    },

    userEmail: {
      type: String,
      default: "",
      trim: true
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },

    replies: {
      type: [replySchema],
      default: []
    }
  },
  {
    timestamps: true,
    collection: "doubts"
  }
);

module.exports =
  mongoose.models.Doubt ||
  mongoose.model("Doubt", doubtSchema);
