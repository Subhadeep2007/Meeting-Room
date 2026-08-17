import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, Video } from "lucide-react";

import api2 from "../services/api2";
import {
    successToast,
    errorToast,
} from "../utils/toast";

const ForgotPassword = () => {

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!email) {

            return errorToast("Please enter your email.");

        }

        try {

            setLoading(true);

            const { data } = await api2.post(

                "/auth/forgot-password",

                {

                    email,

                }

            );

            successToast(data.message);

            setEmail("");

        }

        catch (error) {

            errorToast(

                error.response?.data?.message ||

                "Failed to send reset link."

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">

                {/* Logo */}

                <div className="flex justify-center">

                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">

                        <Video
                            className="text-blue-600"
                            size={30}
                        />

                    </div>

                </div>

                <h1 className="text-3xl font-bold text-center text-white mt-6">

                    Forgot Password

                </h1>

                <p className="text-center text-gray-200 mt-2">

                    Enter your registered email.

                    We'll send you a password reset link.

                </p>

                <form

                    onSubmit={handleSubmit}

                    className="mt-8 space-y-5"

                >

                    <div>

                        <label className="text-white text-sm">

                            Email

                        </label>

                        <div className="relative mt-2">

                            <Mail

                                size={20}

                                className="absolute left-4 top-4 text-white"

                            />

                            <input

                                type="email"

                                value={email}

                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }

                                placeholder="Enter your email"

                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400"

                            />

                        </div>

                    </div>

                    <button

                        type="submit"

                        disabled={loading}

                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold flex justify-center items-center gap-2"

                    >

                        <Send size={18} />

                        {

                            loading

                                ?

                                "Sending..."

                                :

                                "Send Reset Link"

                        }

                    </button>

                </form>

                <div className="text-center mt-8">

                    <Link

                        to="/"

                        className="inline-flex items-center gap-2 text-white hover:text-blue-200"

                    >

                        <ArrowLeft size={18} />

                        Back To Login

                    </Link>

                </div>

            </div>

        </div>

    );

};

export default ForgotPassword;