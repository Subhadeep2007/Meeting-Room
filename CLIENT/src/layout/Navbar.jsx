import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    Bell,
    Video,
    User,
    Settings,
    LogOut,
    LayoutDashboard,
    Menu,
    X,
} from "lucide-react";

import NotificationBell from "../components/NotificationBell";
import NotificationPanel from "../components/NotificationPanel";
import useNotification from "../hooks/useNotification";

const Navbar = () => {

    const navigate = useNavigate();

    // =====================================
    // Mobile Menu
    // =====================================

    const [mobileMenu, setMobileMenu] = useState(false);

    // =====================================
    // Notification Panel
    // =====================================

    const [showNotifications, setShowNotifications] = useState(false);

    // =====================================
    // Profile Dropdown
    // =====================================

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // =====================================
    // Dummy User
    // Later Backend API se ayega
    // =====================================

    const user = {

        name: "Subha",

        email: "subha@gmail.com",

        profilePicture: "",

    };

    // =====================================
    // Notification Hook
    // =====================================

    const {

        notifications,

        unreadCount,

        markAllRead,

        clearNotifications,

    } = useNotification();

    // =====================================
    // Logout
    // =====================================

    const handleLogout = () => {

        localStorage.clear();

        navigate("/");

    };

    return (

        <nav className="bg-white shadow-md sticky top-0 z-50">

            <div className="max-w-7xl mx-auto px-6">

                <div className="h-16 flex items-center justify-between">

                    {/* ===================================== */}
                    {/* Logo */}
                    {/* ===================================== */}

                    <Link

                        to="/dashboard"

                        className="flex items-center gap-3"

                    >

                        <div className="bg-blue-600 rounded-full p-2">

                            <Video

                                className="text-white"

                                size={24}

                            />

                        </div>

                        <h1 className="text-2xl font-bold text-blue-600">

                            Meeting Room

                        </h1>

                    </Link>

                    {/* ===================================== */}
                    {/* Desktop Menu */}
                    {/* ===================================== */}

                    <div className="hidden md:flex items-center gap-6">

                        <Link

                            to="/dashboard"

                            className="flex items-center gap-2 hover:text-blue-600"

                        >

                            <LayoutDashboard size={18} />

                            Dashboard

                        </Link>

                    </div>

                    {/* ===================================== */}
                    {/* Right Side */}
                    {/* ===================================== */}

                    <div className="flex items-center gap-4">

                        {/* Notification */}

                        <div className="relative">

                            <NotificationBell

                                unreadCount={unreadCount}

                                onClick={() => {

                                    setShowNotifications(

                                        !showNotifications

                                    );

                                    markAllRead();

                                }}

                            />

                            {

                                showNotifications && (

                                    <NotificationPanel

                                        notifications={notifications}

                                        markAllRead={markAllRead}

                                        clearNotifications={clearNotifications}

                                    />

                                )

                            }

                        </div>

                        {/* Profile */}

                        <div className="relative">

                            <button

                                onClick={() =>

                                    setShowProfileMenu(

                                        !showProfileMenu

                                    )

                                }

                                className="flex items-center gap-2"

                            >

                                {

                                    user.profilePicture ?

                                        (

                                            <img

                                                src={user.profilePicture}

                                                alt="profile"

                                                className="w-10 h-10 rounded-full"

                                            />

                                        )

                                        :

                                        (

                                            <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center">

                                                <User size={20} />

                                            </div>

                                        )

                                }

                                <span className="hidden md:block">

                                    {user.name}

                                </span>

                            </button>

                            {

                                showProfileMenu && (

                                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border">

                                        <Link

                                            to="/profile"

                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"

                                        >

                                            <User size={18} />

                                            Profile

                                        </Link>

                                        <Link

                                            to="/settings"

                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"

                                        >

                                            <Settings size={18} />

                                            Settings

                                        </Link>

                                        <button

                                            onClick={handleLogout}

                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-100 text-red-600"

                                        >

                                            <LogOut size={18} />

                                            Logout

                                        </button>

                                    </div>

                                )

                            }

                        </div>

                        {/* Mobile Menu */}

                        <button

                            className="md:hidden"

                            onClick={() =>

                                setMobileMenu(

                                    !mobileMenu

                                )

                            }

                        >

                            {

                                mobileMenu ?

                                    <X />

                                    :

                                    <Menu />

                            }

                        </button>

                    </div>

                </div>

            </div>

            {/* ===================================== */}
            {/* Mobile Navigation */}
            {/* ===================================== */}

            {

                mobileMenu && (

                    <div className="md:hidden border-t">

                        <Link

                            to="/dashboard"

                            className="block px-6 py-4 hover:bg-gray-100"

                        >

                            Dashboard

                        </Link>

                        <Link

                            to="/profile"

                            className="block px-6 py-4 hover:bg-gray-100"

                        >

                            Profile

                        </Link>

                        <Link

                            to="/settings"

                            className="block px-6 py-4 hover:bg-gray-100"

                        >

                            Settings

                        </Link>

                        <button

                            onClick={handleLogout}

                            className="w-full text-left px-6 py-4 text-red-600 hover:bg-red-50"

                        >

                            Logout

                        </button>

                    </div>

                )

            }

        </nav>

    );

};

export default Navbar;