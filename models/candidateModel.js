const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Please provide candidate name"],
  },
  assign: {
    type: String,
    required: [true, "Please assign user a role"],
  },
  designation: {
    type: String,
    required: [true, "Please provide candidate designation"],
  },
  contact: {
    type: String,
    required: [true, "Please provide candidate contact"],
  },
  qualification: {
    type: String,
    required: [true, "Please provide candidate qualification"],
  },
  date: {
    type: String,
    required: [true, "Please provide date"],
  },
  project: {
    type: String,
    required: [true, "Please provide project"],
  },
  network: {
    type: String,
    required: [true, "Please provide network"],
    enum: {
      values: ["Fix Network", "Mobile Network"],
      message: "Network can be either: Fix Network or Mobile Network",
    },
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
