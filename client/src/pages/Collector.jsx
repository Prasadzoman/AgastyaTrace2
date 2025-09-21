import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const Collector = () => {
  const [form, setForm] = useState({
    species: "",
    quantity: "",
    farmingType: "",
  });
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [qrCodeURL, setQrCodeURL] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [sensorData, setSensorData] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Automatically get location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationLoading(false);
        },
        (err) => {
          console.error("Location access denied:", err);
          setLocationError("Unable to access your location. Please enable location services.");
          setLocationLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
    }
  }, []);

  const generateSensorData = () => ({
    temperature: (20 + Math.random() * 10).toFixed(1),
    humidity: (40 + Math.random() * 40).toFixed(1),
    soilMoisture: (10 + Math.random() * 20).toFixed(1),
    pH: (5 + Math.random() * 2).toFixed(2),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const sensors = generateSensorData();
    setSensorData(sensors);

    const payload = { 
      ...form, 
      location, 
      sensors, 
      timestamp: new Date().toISOString() 
    };

    try {
      const res = await fetch("http://localhost:5000/collector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      
      if (res.ok) {
        if (data.collector?._id) {
          const qrData = data.collector._id;
          const qrURL = await QRCode.toDataURL(qrData);
          setQrCodeURL(qrURL);
        }
        
        // Show success notification
        setTimeout(() => {
          alert("Collection data submitted successfully!");
        }, 100);
      } else {
        alert(`Error: ${data.message || "Failed to submit data"}`);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryLocation = () => {
    setLocationLoading(true);
    setLocationError("");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationLoading(false);
        },
        (err) => {
          console.error("Location access denied:", err);
          setLocationError("Unable to access your location. Please enable location services.");
          setLocationLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ayurvedic Herb Collection</h1>
            <p className="text-gray-600">Record your herb collection data for supply chain tracking</p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Collection Details</h2>
              <p className="text-sm text-gray-500 mt-1">Fill in the information about your herb collection</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Species Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Species Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="species"
                  value={form.species}
                  onChange={handleChange}
                  placeholder="e.g., Ashwagandha, Turmeric, Neem"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-400"
                />
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity (kg)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity in kilograms"
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-400"
                />
              </div>

              {/* Farming Type Select */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Farming Type
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="farmingType"
                  value={form.farmingType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                >
                  <option value="">Choose farming method</option>
                  <option value="Organic">Organic</option>
                  <option value="Conventional">Conventional</option>
                  <option value="Wild">Wild Collected</option>
                </select>
              </div>

              {/* Environmental Conditions Preview */}
              {sensorData && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">Environmental Conditions (Auto-generated)</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Temperature:</span>
                      <span className="font-medium text-blue-900">{sensorData.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Humidity:</span>
                      <span className="font-medium text-blue-900">{sensorData.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Soil Moisture:</span>
                      <span className="font-medium text-blue-900">{sensorData.soilMoisture}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">pH Level:</span>
                      <span className="font-medium text-blue-900">{sensorData.pH}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Collection Location
                </label>
                
                {locationLoading && (
                  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
                      <span>Getting your location...</span>
                    </div>
                  </div>
                )}

                {locationError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center space-x-2 text-red-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-sm font-medium">Location Error</span>
                        <p className="text-sm mt-1">{locationError}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={retryLocation}
                      className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {location.lat && location.lng && (
                  <>
                    <div className="h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <MapContainer 
                        center={[location.lat, location.lng]} 
                        zoom={13} 
                        style={{ height: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[location.lat, location.lng]}>
                          <Popup>Your Current Location</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Latitude:</span>
                          <span className="ml-2 font-medium text-gray-900">{location.lat.toFixed(6)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Longitude:</span>
                          <span className="ml-2 font-medium text-gray-900">{location.lng.toFixed(6)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Location accuracy: High precision GPS coordinates
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !location.lat}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                  isSubmitting || !location.lat
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Submitting Collection Data...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Submit Collection Data</span>
                  </div>
                )}
              </button>
              
              {!location.lat && !locationLoading && (
                <p className="text-xs text-red-500 text-center">
                  Location is required to submit collection data
                </p>
              )}
            </form>
          </div>

          {/* QR Code Display */}
          {qrCodeURL && (
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01m0 0h3.99" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Collection QR Code Generated</h3>
                <p className="text-gray-600 mb-6">Share this QR code with the transporter to continue the supply chain</p>
                <div className="inline-block p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <img src={qrCodeURL} alt="Collection QR Code" className="mx-auto" />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  This QR code contains your unique collection ID and will be used to track this batch throughout the supply chain.
                </p>
              </div>

              {/* Collection Summary */}
              <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="text-sm font-medium text-green-900 mb-3">Collection Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <span className="block text-green-700">Species</span>
                    <span className="font-medium text-green-900">{form.species}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-green-700">Quantity</span>
                    <span className="font-medium text-green-900">{form.quantity} kg</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-green-700">Method</span>
                    <span className="font-medium text-green-900">{form.farmingType}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setQrCodeURL("");
                  setForm({ species: "", quantity: "", farmingType: "" });
                  setSensorData(null);
                }}
                className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Record Another Collection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collector;