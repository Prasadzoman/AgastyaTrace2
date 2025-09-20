// src/components/Navbar.jsx
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-500 text-white p-4 flex flex-wrap justify-between items-center">
      <div className="text-lg font-bold">
        <Link to="/">Ayur</Link>
      </div>
      <div className="flex gap-4 flex-wrap">
        <Link to="/collector" className="hover:bg-blue-600 px-3 py-1 rounded">Collector</Link>
        <Link to="/transport" className="hover:bg-blue-600 px-3 py-1 rounded">Transport</Link>
        <Link to="/processing" className="hover:bg-blue-600 px-3 py-1 rounded">Processing</Link>
        <Link to="/lab" className="hover:bg-blue-600 px-3 py-1 rounded">Lab</Link>
        <Link to="/consumer" className="hover:bg-blue-600 px-3 py-1 rounded">Consumer</Link>
        <Link to="/login" className="hover:bg-blue-600 px-3 py-1 rounded">Login</Link>
        <Link to="/signin" className="hover:bg-blue-600 px-3 py-1 rounded">Sign In</Link>
        <Link to="/profile" className="hover:bg-blue-600 px-3 py-1 rounded">Profile</Link>
      </div>
    </nav>
  );
};

export default Navbar;
