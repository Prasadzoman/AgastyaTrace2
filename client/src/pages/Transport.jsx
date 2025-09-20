import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

const Transport = () => {
  const [collectorId, setCollectorId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [scanning, setScanning] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Fetch current geolocation
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoadingLocation(false);
      },
      (err) => {
        console.error("Error getting location:", err);
        setLoadingLocation(false);
      }
    );
  };

  // Auto-fetch location when component mounts
  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async () => {
  if (!collectorId || !quantity) {
    alert("Please provide both Collector ID and Quantity");
    return;
  }

  const payload = {
    collectorId,
    transporter: "66f8a2b3c1234567890abcd1", // 🔹 replace with logged-in user ID
    quantityKg: parseFloat(quantity),
    location: {
      lat: location.lat,
      lng: location.lng,
    },
    destination: "Processing Plant A", // can make dynamic later
  };

  try {
    const res = await fetch("http://localhost:5000/transport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
      alert("Transport recorded successfully!");
      setCollectorId("");
      setQuantity("");
    } else {
      alert(`Error: ${data.message || "Failed to record transport"}`);
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("Network error. Please try again.");
  }
};


  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Transport Recording
      </h2>

      {/* QR Scanner */}
      <div className="mb-6">
        {!scanning ? (
          <button
            onClick={() => setScanning(true)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            📱 Start QR Scanner
          </button>
        ) : (
          <div className="relative w-full h-64 rounded-md overflow-hidden">
            <Scanner
              onScan={(result) => {
                if (result && result[0]?.rawValue) {
                  setCollectorId(result[0].rawValue);
                  setScanning(false); // stop scanning after detection
                }
              }}
              onError={(err) => console.error("QR Scanner error:", err)}
              constraints={{ facingMode: "environment" }}
              styles={{ container: { width: "100%", height: "100%" } }}
            />
            <button
              onClick={() => setScanning(false)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md"
            >
              ✖ Stop
            </button>
          </div>
        )}
      </div>

      {/* Manual Collector ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Collector ID
        </label>
        <input
          type="text"
          placeholder="Enter Collector ID"
          value={collectorId}
          onChange={(e) => setCollectorId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Quantity Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity (kg)
        </label>
        <input
          type="number"
          placeholder="Enter quantity in kg"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0"
          step="0.1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Location Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Location
        </label>
        {location.lat && location.lng ? (
          <p className="text-green-600">
            Latitude: {location.lat}, Longitude: {location.lng}
          </p>
        ) : (
          <p className="text-red-500">Location not available</p>
        )}
        <button
          type="button"
          onClick={getLocation}
          className="mt-2 px-4 py-2 bg-gray-200 rounded-md"
          disabled={loadingLocation}
        >
          {loadingLocation ? "Fetching..." : "Update Location"}
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!collectorId || !quantity || !location.lat}
        className={`w-full px-4 py-3 rounded-md font-medium focus:outline-none ${
          collectorId && quantity && location.lat
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        🚚 Record Transport
      </button>
    </div>
  );
};

export default Transport;
