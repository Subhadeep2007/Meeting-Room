import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Lock, Video } from "lucide-react";

import api2 from "../services/api2";
import {
    successToast,
    errorToast,
} from "../utils/toast";

const ResetPassword = () => {

    const navigate = useNavigate();

    const { token } = useParams();

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!password || !confirmPassword) {

            return errorToast("Please fill all fields.");

        }

        if (password !== confirmPassword) {

            return errorToast("Passwords do not match.");

        }

        try {

            setLoading(true);

            const { data } = await api2.put(

                `/auth/reset-password/${token}`,

                {

                    password,

                }

            );

            successToast(data.message);

            navigate("/");

        }

        catch (error) {

            errorToast(

                error.response?.data?.message ||

                "Reset Password Failed"

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

                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">

                        <Video
                            className="text-blue-600"
                            size={30}
                        />

                    </div>

                </div>

                <h1 className="text-center text-3xl font-bold text-white mt-6">

                    Reset Password

                </h1>

                <p className="text-center text-gray-200 mt-2">

                    Create a new password for your account.

                </p>

                <form

                    onSubmit={handleSubmit}

                    className="mt-8 space-y-5"

                >

                    {/* Password */}

                    <div>

                        <label className="text-white">

                            New Password

                        </label>

                        <div className="relative mt-2">

                            <Lock

                                className="absolute left-4 top-4 text-white"

                                size={18}

                            />

                            <input

                                type={

                                    showPassword

                                        ?

                                        "text"

                                        :

                                        "password"

                                }

                                value={password}

                                onChange={(e)=>

                                    setPassword(

                                        e.target.value

                                    )

                                }

                                placeholder="New Password"

                                className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300"

                            />

                            <button

                                type="button"

                                className="absolute right-4 top-4 text-white"

                                onClick={()=>

                                    setShowPassword(

                                        !showPassword

                                    )

                                }

                            >

                                {

                                    showPassword

                                        ?

                                        <EyeOff size={20}/>

                                        :

                                        <Eye size={20}/>

                                }

                            </button>

                        </div>

                    </div>

                    {/* Confirm Password */}

                    <div>

                        <label className="text-white">

                            Confirm Password

                        </label>

                        <div className="relative mt-2">

                            <Lock

                                className="absolute left-4 top-4 text-white"

                                size={18}

                            />

                            <input

                                type={

                                    showConfirmPassword

                                        ?

                                        "text"

                                        :

                                        "password"

                                }

                                value={confirmPassword}

                                onChange={(e)=>

                                    setConfirmPassword(

                                        e.target.value

                                    )

                                }

                                placeholder="Confirm Password"

                                className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder-gray-300"

                            />

                            <button

                                type="button"

                                className="absolute right-4 top-4 text-white"

                                onClick={()=>

                                    setShowConfirmPassword(

                                        !showConfirmPassword

                                    )

                                }

                            >

                                {

                                    showConfirmPassword

                                        ?

                                        <EyeOff size={20}/>

                                        :

                                        <Eye size={20}/>

                                }

                            </button>

                        </div>

                    </div>

                    <button

                        type="submit"

                        disabled={loading}

                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"

                    >

                        {

                            loading

                                ?

                                "Updating..."

                                :

                                "Reset Password"

                        }

                    </button>

                </form>

            </div>

        </div>

    );

};

export default ResetPassword;