// Logout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login"); // redirect without page reload
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center p-2 rounded-full hover:bg-gray-200"
            >
                <i className="fa-solid fa-user-shield text-2xl text-gray-700"></i>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-xl p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Admin</p>
                    <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Logout;
