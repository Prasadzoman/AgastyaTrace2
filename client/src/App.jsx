// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Collector from "./pages/Collector";
import Transport from "./pages/Transport";
import Processing from "./pages/Processing";
import Lab from "./pages/Lab";
import Consumer from "./pages/Consumer";
import Login from "./pages/Login";
import Signin from "./pages/Signin";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Collector />} />
          <Route path="/collector" element={<Collector />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/consumer" element={<Consumer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
