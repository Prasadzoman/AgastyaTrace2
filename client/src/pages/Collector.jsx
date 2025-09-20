import React, { useState } from "react";
import QRCode from "qrcode";

const Collector = () => {
  const [form, setForm] = useState({
    species: "",
    quantity: "",
    farmingType: "",
  });
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [qrCodeURL, setQrCodeURL] = useState(""); // store generated QR code

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("Location access denied:", err);
        }
      );
    } else {
      alert("Geolocation not supported by this browser.");
    }
  };

  const generateSensorData = () => ({
    temperature: (20 + Math.random() * 10).toFixed(1),
    humidity: (40 + Math.random() * 40).toFixed(1),
    soilMoisture: (10 + Math.random() * 20).toFixed(1),
    pH: (5 + Math.random() * 2).toFixed(2),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sensorData = generateSensorData();

    const payload = {
      ...form,
      location,
      sensors: sensorData,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:5000/collector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      alert("Data submitted successfully!");
      console.log("Server response:", data);

      // Generate QR code from collector record ID
      if (data.collector?._id) {
        const qrData = data.collector._id; // use ID as QR content
        const qrURL = await QRCode.toDataURL(qrData);
        setQrCodeURL(qrURL);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-200 to-green-400 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
          🌿 Ayurvedic Herb Collector Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Species Name</label>
            <input
              type="text"
              name="species"
              value={form.species}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Tulsi"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Quantity (kg)</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. 25"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Farming Type</label>
            <select
              name="farmingType"
              value={form.farmingType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select</option>
              <option value="Organic">Organic</option>
              <option value="Conventional">Conventional</option>
              <option value="Wild">Wild Collected</option>
            </select>
          </div>

          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={getLocation}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
            >
              📍 Get Current Location
            </button>
            {location.lat && (
              <p className="text-sm text-gray-600 mt-2">
                Lat: <span className="font-semibold">{location.lat}</span>, Lng:{" "}
                <span className="font-semibold">{location.lng}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition"
          >
            ✅ Submit
          </button>
        </form>

        {qrCodeURL && (
          <div className="mt-6 text-center">
            <h3 className="font-semibold mb-2">Scan this QR for Transporter</h3>
            <img src={qrCodeURL} alt="Collector QR" className="mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Collector;
