import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {

  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (

    <nav className="fixed top-0 left-0 w-full z-50
                    backdrop-blur-lg bg-white/10 border-b border-white/20 shadow-lg">

      {/* Container */}
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold text-2xl tracking-wide"
        >
          <span className="text-3xl"></span>
          <span className="bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent">
            Attendify
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-5">

          {role && (
            <span className="px-3 py-1 text-sm rounded-full
                             bg-white/20 text-white backdrop-blur-md
                             border border-white/30 capitalize">
              {role}
            </span>
          )}

          {role && (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg text-white font-medium
                         bg-gradient-to-r from-red-500 to-pink-500
                         hover:scale-105 transition duration-300 shadow-md"
            >
              Logout
            </button>
          )}

        </div>

      </div>

    </nav>

  );
};

export default Navbar;