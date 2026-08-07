import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MeetingRoom from "./pages/MeetingRoom.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

function App() {

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
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />
                <Route

                  path="/reset-password/:token"

                 element={<ResetPassword/>}

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