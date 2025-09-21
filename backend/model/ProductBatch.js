const mongoose = require("mongoose");

const productBatchSchema = new mongoose.Schema({
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  weightPerProduct: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
  },
  labTests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTesting", // <-- Use the correct model name
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("ProductBatch", productBatchSchema);
