import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";

import api from "../services/api";
import {
    successToast,
    errorToast,
} from "../utils/toast";

const VerifyEmail = () => {

    const navigate = useNavigate();

    const location = useLocation();

    const email =
        location.state?.email || "";

    const [otp, setOtp] = useState("");

    const [loading, setLoading] =
        useState(false);

        const [resending, setResending] = useState(false);

    // ==========================================
    // Handle OTP Change
    // ==========================================

    const handleOtpChange = (e) => {

        const value =
            e.target.value
                .replace(/\D/g, "")
                .slice(0, 6);

        setOtp(value);

    };

    // ==========================================
    // Handle Submit
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!email) {

            return errorToast(
                "Email information is missing."
            );

        }

        if (otp.length !== 6) {

            return errorToast(
                "Please enter a valid 6-digit OTP."
            );

        }

        try {

            setLoading(true);

            const { data } =
                await api.post(
                    "/auth/verify-email",
                    {
                        email,
                        otp,
                    }
                );

            successToast(
                data.message
            );

            navigate("/");

        } catch (error) {

            errorToast(

                error.response?.data?.message ||

                "OTP verification failed"

            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
// Resend OTP
// ==========================================

const handleResendOTP = async () => {

    if (!email) {

        return errorToast(
            "Email information is missing."
        );

    }

    try {

        setResending(true);

        const { data } = await api.post(
            "/auth/resend-otp",
            {
                email,
            }
        );

        successToast(data.message);

    } catch (error) {

        errorToast(

            error.response?.data?.message ||

            "Failed to resend OTP"

        );

    } finally {

        setResending(false);

    }

};

    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="
            min-h-screen
            bg-linear-to-br
            from-blue-700
            via-indigo-700
            to-purple-800
            flex
            items-center
            justify-center
            px-4
        ">

            <div className="
                w-full
                max-w-md
                bg-white/10
                backdrop-blur-lg
                rounded-3xl
                border
                border-white/20
                shadow-2xl
                p-8
            ">

                {/* Logo */}

                <div className="flex justify-center">

                    <div className="
                        w-16
                        h-16
                        bg-white
                        rounded-full
                        flex
                        items-center
                        justify-center
                    ">

                        <MailCheck
                            className="text-blue-600"
                            size={30}
                        />

                    </div>

                </div>

                {/* Heading */}

                <h1 className="
                    text-center
                    text-3xl
                    font-bold
                    text-white
                    mt-6
                ">

                    Verify Your Email

                </h1>

                <p className="
                    text-center
                    text-gray-200
                    mt-2
                ">

                    Enter the 6-digit OTP sent to

                </p>

                <p className="
                    text-center
                    text-white
                    font-semibold
                    mt-1
                    break-all
                ">

                    {email}

                </p>


                {/* Resend OTP */}

<button
    type="button"
    onClick={handleResendOTP}
    disabled={resending}
    className="
        w-full
        border
        border-white/30
        text-white
        py-3
        rounded-xl
        font-semibold
        hover:bg-white/10
        disabled:opacity-50
    "
>
    {
        resending
            ? "Sending..."
            : "Resend OTP"
    }
</button>

                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                >

                    {/* OTP */}

                    <input

                        type="text"

                        inputMode="numeric"

                        autoComplete="one-time-code"

                        placeholder="Enter 6-digit OTP"

                        value={otp}

                        onChange={handleOtpChange}

                        maxLength={6}

                        className="
                            w-full
                            p-4
                            rounded-xl
                            bg-white/20
                            border
                            border-white/20
                            text-white
                            placeholder-gray-300
                            outline-none
                            text-center
                            text-2xl
                            tracking-[0.5em]
                        "

                    />

                    {/* Verify Button */}

                    <button

                        type="submit"

                        disabled={
                            loading ||
                            otp.length !== 6
                        }

                        className="
                            w-full
                            bg-blue-600
                            hover:bg-blue-700
                            py-3
                            rounded-xl
                            text-white
                            font-semibold
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "

                    >

                        {

                            loading

                                ? "Verifying..."

                                : "Verify Email"

                        }

                    </button>

                </form>

                {/* Back */}

                <div className="
                    text-center
                    mt-6
                    text-gray-200
                ">

                    Wrong email?

                    <button

                        type="button"

                        onClick={() =>
                            navigate("/register")
                        }

                        className="
                            ml-2
                            text-white
                            font-semibold
                            hover:underline
                        "

                    >

                        Register Again

                    </button>

                </div>

            </div>

        </div>

    );

};

export default VerifyEmail;