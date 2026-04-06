"use client";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FaBars,
  FaHome,
  FaBox,
  FaUsers,
  FaClipboardList,
  FaSignOutAlt,
  FaTruck,
} from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile and adjust sidebar state accordingly
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <div
      className={`bg-gray-900 text-white p-5 shadow-lg border-r border-green-400 flex flex-col h-screen ${
        isOpen ? "w-72" : "w-20"
      } transition-all duration-300 overflow-y-auto`}
    >
      <div className="flex items-center justify-between p-3">
        <h1 className={`text-lg font-bold ${!isOpen && "hidden"}`}>
          <div>
            <span className="ml-2 text-xl font-bold text-white flex items-center gap-1">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
              Market<span className="text-emerald-400">Wise</span>
            </span>
          </div>
        </h1>
        <button aria-label="Toggle sidebar" onClick={() => setIsOpen(!isOpen)}>
          <FaBars />
        </button>
      </div>
      <nav className="mt-4">
          <Link className="mb-3 p-3 rounded-lg hover:bg-green-700 transition-all flex items-center" href="/admin">
              <FaHome className="mr-2" /> {isOpen && 'Dashboard'}
            </Link>
          <Link className="mb-3 p-3 rounded-lg hover:bg-green-700 transition-all flex items-center" href="/inventory">
              <FaBox className="mr-2" /> {isOpen && 'Inventory'}
            </Link>
            <Link className="mb-3 p-3 rounded-lg hover:bg-green-700 transition-all flex items-center" href="/admin/user">
              <FaUsers className="mr-2" /> {isOpen && 'Users'}
            </Link>
          <Link className="mb-3 p-3 rounded-lg hover:bg-green-700 transition-all flex items-center" href="/admin/delivery">
              <FaClipboardList className="mr-2" /> {isOpen && 'Price Submissions'}
            </Link>
          <Link className="mb-3 p-3 rounded-lg hover:bg-green-700 transition-all flex items-center" href="/profile">
              <FaTruck className="mr-2" /> {isOpen && 'Settings'}
            </Link>
          
          <Link className="p-3 hover:bg-red-700 mt-auto flex items-center" href="/signout">
            <button className="flex items-center w-full">
              <div className="mr-2">
                <FaSignOutAlt size={18} />
              </div>{" "}
              {isOpen && "Logout"}
            </button>
          </Link>
        </nav>
      </div>
  );
};

export default Sidebar;
