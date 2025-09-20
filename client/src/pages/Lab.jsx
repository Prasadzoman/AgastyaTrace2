import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

const Lab = () => {
  const [collectorId, setCollectorId] = useState("");
  const [testedQuantity, setTestedQuantity] = useState("");
  const [testType, setTestType] = useState("");
  const [result, setResult] = useState("");
  const [certificateLinks, setCertificateLinks] = useState([""]);
  const [scanning, setScanning] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [qrCodeURL, setQrCodeURL] = useState(""); // 🔹 state to store QR

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

  const handleCertificateChange = (index, value) => {
    const newLinks = [...certificateLinks];
    newLinks[index] = value;
    setCertificateLinks(newLinks);
  };

  const addCertificateField = () => {
    setCertificateLinks([...certificateLinks, ""]);
  };

  const handleSubmit = async () => {
    if (!collectorId || !testedQuantity || !testType || !result) {
      alert("Please fill in all required fields");
      return;
    }

    const payload = {
      collectorId,
      labTechnician: "66f8a2b3c1234567890abcd3", // replace with logged-in user ID
      testedQuantityKg: parseFloat(testedQuantity),
      testType,
      result,
      certificateLinks: certificateLinks.filter((link) => link),
      location: {
        lat: location.lat,
        lng: location.lng,
      },
    };

    try {
      const res = await fetch("http://localhost:5000/labtesting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        alert("Lab test recorded successfully!");
        setCollectorId("");
        setTestedQuantity("");
        setTestType("");
        setResult("");
        setCertificateLinks([""]);
        setQrCodeURL(data.qrCodeURL); // 🔹 set QR code from backend
      } else {
        alert(`Error: ${data.message || "Failed to record lab test"}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Lab Testing Recording</h2>

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

      {/* Tested Quantity */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tested Quantity (kg)</label>
        <input
          type="number"
          placeholder="Enter tested quantity"
          value={testedQuantity}
          onChange={(e) => setTestedQuantity(e.target.value)}
          min="0"
          step="0.1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Test Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select test type</option>
          <option value="moisture">Moisture</option>
          <option value="contamination">Contamination</option>
          <option value="pH">pH</option>
          <option value="chemical">Chemical</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Result */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
        <input
          type="text"
          placeholder="Enter test result"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Certificate Links */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Links</label>
        {certificateLinks.map((link, index) => (
          <input
            key={index}
            type="text"
            placeholder="Paste certificate URL"
            value={link}
            onChange={(e) => handleCertificateChange(index, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
          />
        ))}
        <button
          type="button"
          onClick={addCertificateField}
          className="px-3 py-2 bg-gray-200 rounded-md"
        >
          + Add Another Certificate
        </button>
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
        disabled={!collectorId || !testedQuantity || !testType || !result || !location.lat}
        className={`w-full px-4 py-3 rounded-md font-medium focus:outline-none ${
          collectorId && testedQuantity && testType && result && location.lat
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        🧪 Record Lab Test
      </button>

      {/* 🔹 Display QR code */}
      {qrCodeURL && (
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium mb-2">Lab Test QR Code</h3>
          <img src={qrCodeURL} alt="Lab Test QR" className="mx-auto border p-2 rounded-md" />
        </div>
      )}
    </div>
  );
};

export default Lab;
