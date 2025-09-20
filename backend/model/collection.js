const mongoose = require("mongoose");

const CollectorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  species: { type: String, required: true },
  quantity: { type: Number, required: true },
  farmingType: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  sensors: {
    temperature: { type: String },
    humidity: { type: String },
    soilMoisture: { type: String },
    pH: { type: String },
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Collector", CollectorSchema);
