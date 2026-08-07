import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Video } from "lucide-react";

import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

const Register = () => {

    const navigate = useNavigate();

    // ==========================================
    // Password Regex
    // ==========================================

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;

    // ==========================================
    // States
    // ==========================================

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({

        name: "",

        username: "",

        email: "",

        password: "",

        confirmPassword: "",

    });

    // ==========================================
    // Handle Change
    // ==========================================

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,

        });

    };

    // ==========================================
    // Handle Submit
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (

            !formData.name ||

            !formData.username ||

            !formData.email ||

            !formData.password ||

            !formData.confirmPassword

        ) {

            return errorToast("Please fill all fields.");

        }

        if (

            formData.password !==

            formData.confirmPassword

        ) {

            return errorToast("Passwords do not match.");

        }

        if (!passwordRegex.test(formData.password)) {

            return errorToast(

                "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."

            );

        }

        try {

            setLoading(true);

            const { data } = await api.post(

                "/auth/register",

                {

                    name: formData.name,

                    username: formData.username,

                    email: formData.email,

                    password: formData.password,

                }

            );

            successToast(data.message);

            navigate("/");

        }

        catch (error) {

            errorToast(

                error.response?.data?.message ||

                "Registration Failed"

            );

        }

        finally {

            setLoading(false);

        }

    };

    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-8">

                {/* Logo */}

                <div className="flex justify-center">

                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">

                        <Video
                            className="text-blue-600"
                            size={30}
                        />

                    </div>

                </div>

                {/* Heading */}

                <h1 className="text-center text-3xl font-bold text-white mt-6">

                    Create Account

                </h1>

                <p className="text-center text-gray-200 mt-2">

                    Join Meeting Room

                </p>

                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-4"
                >

                    {/* Name */}

                    <input

                        name="name"

                        placeholder="Full Name"

                        value={formData.name}

                        onChange={handleChange}

                        className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none"

                    />

                    {/* Username */}

                    <input

                        name="username"

                        placeholder="Username"

                        value={formData.username}

                        onChange={handleChange}

                        className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none"

                    />

                    {/* Email */}

                    <input

                        type="email"

                        name="email"

                        placeholder="Email"

                        value={formData.email}

                        onChange={handleChange}

                        className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none"

                    />

                    {/* Password */}

                    <div className="relative">

                        <input

                            type={showPassword ? "text" : "password"}

                            name="password"

                            placeholder="Password"

                            value={formData.password}

                            onChange={handleChange}

                            className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none"

                        />

                        <button

                            type="button"

                            className="absolute right-4 top-4 text-white"

                            onClick={() =>

                                setShowPassword(!showPassword)

                            }

                        >

                            {

                                showPassword

                                    ? <EyeOff size={20} />

                                    : <Eye size={20} />

                            }

                        </button>

                    </div>

                    <p className="text-xs text-gray-300">

                        Password must contain:
                        <br />
                        • Minimum 8 characters
                        <br />
                        • One Uppercase letter (A-Z)
                        <br />
                        • One Lowercase letter (a-z)
                        <br />
                        • One Number (0-9)
                        <br />
                        • One Special Character (@$!%*?&#)

                    </p>

                    {/* Confirm Password */}

                    <div className="relative">

                        <input

                            type={showConfirmPassword ? "text" : "password"}

                            name="confirmPassword"

                            placeholder="Confirm Password"

                            value={formData.confirmPassword}

                            onChange={handleChange}

                            className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none"

                        />

                        <button

                            type="button"

                            className="absolute right-4 top-4 text-white"

                            onClick={() =>

                                setShowConfirmPassword(!showConfirmPassword)

                            }

                        >

                            {

                                showConfirmPassword

                                    ? <EyeOff size={20} />

                                    : <Eye size={20} />

                            }

                        </button>

                    </div>

                    {/* Button */}

                    <button

                        type="submit"

                        disabled={loading}

                        className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold flex justify-center items-center gap-2 disabled:opacity-50"

                    >

                        <UserPlus size={20} />

                        {

                            loading

                                ? "Creating Account..."

                                : "Register"

                        }

                    </button>

                </form>

                {/* Footer */}

                <div className="text-center mt-6 text-gray-200">

                    Already have an account?

                    <Link

                        to="/"

                        className="ml-2 text-white font-semibold hover:underline"

                    >

                        Login

                    </Link>

                </div>

            </div>

        </div>

    );

};

export default Register;