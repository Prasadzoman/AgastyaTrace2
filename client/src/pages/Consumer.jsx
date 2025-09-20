import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

const Consumer = () => {
  const [scanning, setScanning] = useState(false);
  const [qrData, setQrData] = useState("");
  const [chainInfo, setChainInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = (result) => {
    if (result && result[0]?.rawValue) {
      const scannedValue = result[0].rawValue;
      setQrData(scannedValue);
      setScanning(false);
      fetchChainInfo(scannedValue);
    }
  };

  const fetchChainInfo = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/trace/lab/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setChainInfo(data);
      } else {
        alert(`Error: ${data.message || "Failed to fetch chain info"}`);
        setChainInfo(null);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error. Please try again.");
      setChainInfo(null);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Consumer: Scan QR to Track Product
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
              onScan={handleScan}
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

      {/* Display scanned QR */}
      {qrData && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Scanned QR ID</h3>
          <p className="text-gray-700">{qrData}</p>
        </div>
      )}

      {/* Loading */}
      {loading && <p className="text-gray-600">Loading chain information...</p>}

      {/* Product Chain Info */}
      {chainInfo && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-2">Product Chain Information</h3>

          {/* Collector */}
          {chainInfo.collector && (
            <div className="p-4 border rounded-md bg-gray-50">
              <h4 className="font-semibold">Collector Details</h4>
              <p>ID: {chainInfo.collector._id}</p>
              <p>Name: {chainInfo.collector.userId?.username || "N/A"}</p>
              <p>Species: {chainInfo.collector.species}</p>
              <p>Quantity Collected: {chainInfo.collector.quantity} kg</p>
              <p>Farming Type: {chainInfo.collector.farmingType}</p>
              <p>
                Location: Lat {chainInfo.collector.location?.lat}, Lng{" "}
                {chainInfo.collector.location?.lng}
              </p>
              <p>Timestamp: {new Date(chainInfo.collector.timestamp).toLocaleString()}</p>
            </div>
          )}

          {/* Transport */}
          {chainInfo.transport?.length > 0 && (
            <div className="p-4 border rounded-md bg-gray-50">
              <h4 className="font-semibold">Transport Details</h4>
              {chainInfo.transport.map((t, i) => (
                <div key={i} className="mb-2">
                  <p>Transporter Name: {t.transporter?.username || "N/A"}</p>
                  <p>Quantity: {t.quantityKg} kg</p>
                  <p>Destination: {t.destination}</p>
                  <p>
                    Location: Lat {t.location?.lat}, Lng {t.location?.lng}
                  </p>
                  <p>Timestamp: {new Date(t.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Processing */}
          {chainInfo.processing && (
            <div className="p-4 border rounded-md bg-gray-50">
              <h4 className="font-semibold">Processing Details</h4>
              <p>Processor Name: {chainInfo.processing.processor?.username || "N/A"}</p>
              <p>Received Quantity: {chainInfo.processing.receivedQuantityKg} kg</p>
              <p>Processed Quantity: {chainInfo.processing.processedQuantityKg} kg</p>
              <p>Processing Type: {chainInfo.processing.processingType}</p>
              <p>
                Location: Lat {chainInfo.processing.location?.lat}, Lng{" "}
                {chainInfo.processing.location?.lng}
              </p>
              <p>Timestamp: {new Date(chainInfo.processing.timestamp).toLocaleString()}</p>
            </div>
          )}

          {/* Lab Testing */}
          {chainInfo.lab && (
            <div className="p-4 border rounded-md bg-gray-50">
              <h4 className="font-semibold">Lab Testing Details</h4>
              <p>Lab Technician Name: {chainInfo.lab.labTechnician?.username || "N/A"}</p>
              <p>Tested Quantity: {chainInfo.lab.testedQuantityKg} kg</p>
              <p>Test Type: {chainInfo.lab.testType}</p>
              <p>Result: {chainInfo.lab.result}</p>
              <p>
                Certificates:{" "}
                {chainInfo.lab.certificateLinks?.length
                  ? chainInfo.lab.certificateLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline mr-2"
                      >
                        Link {idx + 1}
                      </a>
                    ))
                  : "N/A"}
              </p>
              <p>
                Location: Lat {chainInfo.lab.location?.lat}, Lng {chainInfo.lab.location?.lng}
              </p>
              <p>Timestamp: {new Date(chainInfo.lab.timestamp).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Consumer;
