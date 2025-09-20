import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

const Processing = () => {
  const [collectorId, setCollectorId] = useState("");
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [processedQuantity, setProcessedQuantity] = useState("");
  const [processingType, setProcessingType] = useState("");
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

  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async () => {
    if (!collectorId || !receivedQuantity || !processedQuantity || !processingType) {
      alert("Please fill in all required fields");
      return;
    }

    const payload = {
      collectorId,
      processor: "66f8a2b3c1234567890abcd2", // 🔹 replace with logged-in user ID
      receivedQuantityKg: parseFloat(receivedQuantity),
      processedQuantityKg: parseFloat(processedQuantity),
      processingType,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
    };

    try {
      const res = await fetch("http://localhost:5000/processing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        alert("Processing recorded successfully!");
        setCollectorId("");
        setReceivedQuantity("");
        setProcessedQuantity("");
        setProcessingType("");
      } else {
        alert(`Error: ${data.message || "Failed to record processing"}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Processing Recording</h2>

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
                  setScanning(false);
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Collector ID</label>
        <input
          type="text"
          placeholder="Enter Collector ID"
          value={collectorId}
          onChange={(e) => setCollectorId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Received Quantity */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Received Quantity (kg)</label>
        <input
          type="number"
          placeholder="Enter received quantity"
          value={receivedQuantity}
          onChange={(e) => setReceivedQuantity(e.target.value)}
          min="0"
          step="0.1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Processed Quantity */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Processed Quantity (kg)</label>
        <input
          type="number"
          placeholder="Enter processed quantity"
          value={processedQuantity}
          onChange={(e) => setProcessedQuantity(e.target.value)}
          min="0"
          step="0.1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Processing Type */}
      {/* Processing Type */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Processing Type
  </label>
  <select
    value={processingType}
    onChange={(e) => setProcessingType(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  >
    <option value="">Select processing type</option>
    <option value="sorting">Sorting</option>
    <option value="grading">Grading</option>
    <option value="drying">Drying</option>
    <option value="packing">Packing</option>
    <option value="other">Other</option>
  </select>
</div>


      {/* Location Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
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
        disabled={
          !collectorId || !receivedQuantity || !processedQuantity || !processingType || !location.lat
        }
        className={`w-full px-4 py-3 rounded-md font-medium focus:outline-none ${
          collectorId && receivedQuantity && processedQuantity && processingType && location.lat
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        🏭 Record Processing
      </button>
    </div>
  );
};

export default Processing;
