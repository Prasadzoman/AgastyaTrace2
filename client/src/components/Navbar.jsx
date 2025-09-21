// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // to highlight active link

  const navLinks = [
    { name: "Collector", path: "/collector" },
    { name: "Transport", path: "/transport" },
    { name: "Processing", path: "/processing" },
    { name: "Lab", path: "/lab" },
    { name: "Consumer", path: "/consumer" },
    { name: "Login", path: "/login" },
    { name: "Sign In", path: "/signin" },
    { name: "Profile", path: "/profile" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Manufcturer", path: "/manufacturer" },
  ];

  return (
    <nav className="bg-blue-500 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap">
        {/* Logo */}
        <div className="text-lg font-bold">
          <Link to="/">Agastya Trace</Link>
        </div>

        {/* Hamburger for Mobile */}
        <button
          className="md:hidden block text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Links */}
        <div
          className={`w-full md:flex md:items-center md:w-auto ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex flex-col md:flex-row md:gap-4 mt-4 md:mt-0">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-1 rounded transition-colors ${
                  location.pathname === link.path
                    ? "bg-blue-700"
                    : "hover:bg-blue-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
