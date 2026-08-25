

import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import { useEffect, useState } from "react";

import api from "./services/api";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MeetingRoom from "./pages/MeetingRoom.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";


function App() {

    const [darkMode, setDarkMode] = useState(false);


    // =====================================
    // Get User Settings
    // =====================================

   useEffect(() => {

    const getSettings = async () => {

        try {

            const { data } = await api.get(
                "/user/settings"
            );

            setDarkMode(
                data.settings?.darkMode || false
            );

        } catch (error) {

            // User is not logged in yet.
            // Do not show an unnecessary console error.
            if (error.response?.status !== 401) {

                console.error(
                    "App Settings Error:",
                    error
                );

            }

        }

    };

    getSettings();

}, []);


    // =====================================
    // Apply Dark Mode
    // =====================================

    useEffect(() => {

        if (darkMode) {

            document.documentElement.classList.add(
                "dark"
            );

        } else {

            document.documentElement.classList.remove(
                "dark"
            );

        }

    }, [darkMode]);


    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/verify-email"
                    element={<VerifyEmail />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/meeting/:meetingCode"
                    element={<MeetingRoom />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                <Route
                    path="/settings"
                    element={<Settings />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;