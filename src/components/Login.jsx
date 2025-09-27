// Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // const apiURL = 'http://192.168.1.13:6633';
    const apiURL = 'https://mlinfomap.org/weatherapi';


    const handleLogin = async () => {
        const params = {
            username: username,
            userpassword: password,
        };
        setLoading(true);

        try {
            const response = await fetch(`${apiURL}/userLogin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            });

            const res = await response.json();
            console.log("Login Response:", res);

            if (response.status === 200) {
                // Store user and token in sessionStorage
                sessionStorage.setItem("user", JSON.stringify(res.resultUser));
                sessionStorage.setItem("token", res.token);
                navigate('/dashboard')
                // Redirect or update state here if needed
            } else {
                alert(res?.message || "Invalid login response");
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            alert(error || "Login failed. Please try again.");
        }
    }

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-xl p-6 w-80">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Login
                </h2>

                {loading ? (
                    <>
                        {/* ---------------- Loader Code Start ---------------- */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                            <p className="text-gray-700">Logging in...</p>
                        </div>
                        {/* ---------------- Loader Code End ---------------- */}
                    </>
                ) : (
                    <>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleLogin();
                                    }
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>

                        <div className="mb-6">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleLogin();
                                    }
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleLogin}
                            className="w-full bg-[#2b48a1] text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                        >
                            Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Login;
