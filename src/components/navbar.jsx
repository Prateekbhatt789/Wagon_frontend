import { Logout } from '@mui/icons-material';



function Navbar() {
  return (
    <nav className="fixed h-[80px] top-0 left-0 w-full bg-[#0f2461] text-white shadow-lg z-50 flex items-center justify-between px-6 md:px-10">
      {/* Logo + System Name */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <img
          src="https://www.shutterstock.com/image-vector/trolley-coal-on-rails-solid-260nw-2636973107.jpg" // replace with your logo path
          alt="Wagon Railways Logo"
          className="h-12 w-12 object-contain"
        />
        {/* System Name */}
        <h1 className="text-lg md:text-3xl font-bold truncate">
          Wagon GPS Tracking System
        </h1>
      </div>

      {/* Right Side Links */}
      <div className="flex items-center gap-6">
        <a
          href="#"
          className="hover:text-yellow-300 font-medium transition-colors duration-200"
        ><Logout></Logout>

        </a>
        {/* Optional: add a profile icon or dropdown here */}
      </div>
    </nav>

  );
}

export default Navbar;
