import { useState } from 'react'


function Navbar() {
  return (
    <nav className="fixed h-[70px] top-0 left-0 w-full px-4 bg-green-600 text-white shadow-md z-50  flex items-center justify-between">
      <h1 className="text-lg md:text-xl font-semibold truncate">
        Wagon GPS Tracking System
      </h1>
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-yellow-300">
          User
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
