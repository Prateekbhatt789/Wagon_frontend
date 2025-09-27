import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [open, setOpen] = useState(false); // 
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear token
    navigate("/");                     // redirect to "/"
  };

  return (
    <nav className="fixed h-[80px] top-0 left-0 w-full bg-[#0f2461] text-white shadow-lg z-50 flex items-center justify-between px-6 md:px-7.5">
      {/* Logo + System Name */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <img
          src="https://www.shutterstock.com/image-vector/trolley-coal-on-rails-solid-260nw-2636973107.jpg"
          alt="Wagon Railways Logo"
          className="h-12 w-12 object-contain"
        />
        {/* System Name */}
        <h1 className="text-lg md:text-3xl font-bold truncate">
          Wagon Tracking System
        </h1>
      </div>

      {/* Right Side Links */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setOpen(!open); }}
            className="hover:text-yellow-300 font-medium transition-colors duration-200"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/128/18978/18978741.png"   // <-- put your image path here
              alt="Admin"
              className="w-12 h-9 object-contain invert"
            />
          </a>
          {open && (
            <div className="absolute right-0 mt-2 w-24 bg-white shadow-lg rounded-md p-2 z-50">
              <button
                onClick={handleLogout}
                className="w-full px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
