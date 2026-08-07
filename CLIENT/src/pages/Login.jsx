import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Video } from "lucide-react";
import { useState } from "react";

import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

const Login = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");   // ✅ Missing tha
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        if (!email || !password) {
            errorToast("Please fill all fields.");
            return;
        }

        try {

            setLoading(true);

            const { data } = await api.post("/auth/login", {
                email,
                password,
            });

            successToast(data.message);

            navigate("/dashboard");

        } catch (error) {

            errorToast(
                error.response?.data?.message ||
                "Login Failed"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8">

                {/* Logo */}

                <div className="flex justify-center">

                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">

                        <Video
                            size={32}
                            className="text-blue-600"
                        />

                    </div>

                </div>

                <h1 className="text-center text-3xl font-bold text-white mt-6">

                    Meeting Room

                </h1>

                <p className="text-center text-gray-200 mt-2">

                    Real Time Video Conference Platform

                </p>

                <form
                    onSubmit={handleLogin}
                    className="mt-8 space-y-5"
                >

                    {/* Email */}

                    <div>

                        <label className="text-white text-sm">

                            Email

                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full mt-2 px-4 py-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400"
                        />

                    </div>

                    {/* Password */}

                    <div>

                        <label className="text-white text-sm">

                            Password

                        </label>

                        <div className="relative mt-2">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-4 top-4 text-white"
                            >

                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}

                            </button>

                        </div>

                    </div>

                    {/* Forgot Password */}

                    <div className="flex justify-end">

                        <Link
                            to="/forgot-password"
                            className="text-sm text-blue-200 hover:text-white"
                        >

                            Forgot Password?

                        </Link>

                    </div>

                    {/* Login Button */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 transition py-3 rounded-xl text-white font-semibold"
                    >

                        {loading ? "Logging In..." : "Login"}

                    </button>

                </form>

                <div className="text-center mt-8 text-gray-200">

                    Don't have an account?

                    <Link
                        to="/register"
                        className="ml-2 text-white font-semibold hover:underline"
                    >

                        Register

                    </Link>

                </div>

            </div>

        </div>

    );

};

export default Login;