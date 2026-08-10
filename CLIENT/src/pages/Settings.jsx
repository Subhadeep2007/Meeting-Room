import { useEffect, useState } from "react";

import {
    Camera,
    Mic,
    Bell,
    MessageSquare,
    Moon,
    CircleUserRound,
    Save,
} from "lucide-react";

import api from "../services/api";
import {
    successToast,
    errorToast,
} from "../utils/toast";

const Settings = () => {

    // =====================================
    // Settings
    // =====================================

    const [settings, setSettings] = useState({

        cameraEnabled: true,

        microphoneEnabled: true,

        meetingNotifications: true,

        chatNotifications: true,

        darkMode: false,

        showOnlineStatus: true,

    });

    // =====================================
    // Loading
    // =====================================

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);


    // =====================================
    // Get Settings
    // =====================================

    const getSettings = async () => {

        try {

            setLoading(true);

            const { data } = await api.get(
                "/user/settings"
            );

            setSettings(data.settings);

        } catch (error) {

            console.error(
                "Get Settings Error:",
                error
            );

            errorToast(
                error.response?.data?.message ||
                "Failed to load settings"
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // Load Settings
    // =====================================

    useEffect(() => {

        getSettings();

    }, []);


    // =====================================
    // Change Setting
    // =====================================

    const handleChange = (key) => {

        setSettings((prev) => ({

            ...prev,

            [key]: !prev[key],

        }));

    };


    // =====================================
    // Save Settings
    // =====================================

    const handleSave = async () => {

        try {

            setSaving(true);

            const { data } = await api.put(
                "/user/settings",
                settings
            );

            setSettings(data.settings);

            successToast(
                data.message ||
                "Settings Updated Successfully"
            );

        } catch (error) {

            console.error(
                "Update Settings Error:",
                error
            );

            errorToast(
                error.response?.data?.message ||
                "Failed to update settings"
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================
    // Loading
    // =====================================

    if (loading) {

        return (

            <div className="
                min-h-screen
                bg-gray-950
                flex
                items-center
                justify-center
            ">

                <p className="text-white text-lg">

                    Loading Settings...

                </p>

            </div>

        );

    }


    // =====================================
    // Setting Item
    // =====================================

    const SettingItem = ({
        icon,
        title,
        description,
        settingKey,
    }) => {

        return (

            <div className="
                flex
                items-center
                justify-between
                gap-4
                p-4
                rounded-xl
                bg-gray-800
                border
                border-gray-700
            ">

                <div className="
                    flex
                    items-center
                    gap-4
                ">

                    <div className="
                        w-10
                        h-10
                        rounded-lg
                        bg-gray-700
                        flex
                        items-center
                        justify-center
                        text-blue-400
                    ">

                        {icon}

                    </div>

                    <div>

                        <h3 className="
                            text-white
                            font-semibold
                        ">

                            {title}

                        </h3>

                        <p className="
                            text-gray-400
                            text-sm
                            mt-1
                        ">

                            {description}

                        </p>

                    </div>

                </div>


                {/* Toggle */}

                <button
                    type="button"
                    onClick={() =>
                        handleChange(settingKey)
                    }
                    className={`
                        relative
                        w-12
                        h-6
                        rounded-full
                        transition
                        ${
                            settings[settingKey]
                                ? "bg-blue-600"
                                : "bg-gray-600"
                        }
                    `}
                >

                    <span
                        className={`
                            absolute
                            top-1
                            w-4
                            h-4
                            bg-white
                            rounded-full
                            transition
                            ${
                                settings[settingKey]
                                    ? "left-7"
                                    : "left-1"
                            }
                        `}
                    />

                </button>

            </div>

        );

    };


    // =====================================
    // UI
    // =====================================

    return (

        <div className="
            min-h-screen
            bg-gray-950
            p-6
        ">

            <div className="
                max-w-3xl
                mx-auto
            ">

                {/* ==========================
                    Header
                ========================== */}

                <div className="mb-8">

                    <h1 className="
                        text-3xl
                        font-bold
                        text-white
                    ">

                        Settings

                    </h1>

                    <p className="
                        text-gray-400
                        mt-2
                    ">

                        Manage your meeting preferences

                    </p>

                </div>


                {/* ==========================
                    Meeting Settings
                ========================== */}

                <div className="mb-8">

                    <h2 className="
                        text-xl
                        font-semibold
                        text-white
                        mb-4
                    ">

                        Meeting Preferences

                    </h2>

                    <div className="space-y-3">

                        <SettingItem
                            icon={<Camera size={20} />}
                            title="Camera"
                            description="Turn your camera on by default when joining a meeting."
                            settingKey="cameraEnabled"
                        />

                        <SettingItem
                            icon={<Mic size={20} />}
                            title="Microphone"
                            description="Turn your microphone on by default when joining a meeting."
                            settingKey="microphoneEnabled"
                        />

                    </div>

                </div>


                {/* ==========================
                    Notification Settings
                ========================== */}

                <div className="mb-8">

                    <h2 className="
                        text-xl
                        font-semibold
                        text-white
                        mb-4
                    ">

                        Notifications

                    </h2>

                    <div className="space-y-3">

                        <SettingItem
                            icon={<Bell size={20} />}
                            title="Meeting Notifications"
                            description="Receive notifications about meetings and meeting activity."
                            settingKey="meetingNotifications"
                        />

                        <SettingItem
                            icon={
                                <MessageSquare
                                    size={20}
                                />
                            }
                            title="Chat Notifications"
                            description="Receive notifications when you get new messages."
                            settingKey="chatNotifications"
                        />

                    </div>

                </div>


                {/* ==========================
                    Appearance
                ========================== */}

                <div className="mb-8">

                    <h2 className="
                        text-xl
                        font-semibold
                        text-white
                        mb-4
                    ">

                        Appearance

                    </h2>

                    <div className="space-y-3">

                        <SettingItem
                            icon={<Moon size={20} />}
                            title="Dark Mode"
                            description="Use dark appearance throughout the application."
                            settingKey="darkMode"
                        />

                    </div>

                </div>


                {/* ==========================
                    Privacy
                ========================== */}

                <div className="mb-8">

                    <h2 className="
                        text-xl
                        font-semibold
                        text-white
                        mb-4
                    ">

                        Privacy

                    </h2>

                    <div className="space-y-3">

                        <SettingItem
                            icon={
                                <CircleUserRound
                                    size={20}
                                />
                            }
                            title="Show Online Status"
                            description="Allow other users to see when you are online."
                            settingKey="showOnlineStatus"
                        />

                    </div>

                </div>


                {/* ==========================
                    Save Button
                ========================== */}

                <div className="
                    flex
                    justify-end
                ">

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="
                            flex
                            items-center
                            gap-2
                            bg-blue-600
                            hover:bg-blue-700
                            disabled:opacity-50
                            text-white
                            font-semibold
                            px-6
                            py-3
                            rounded-xl
                            transition
                        "
                    >

                        <Save size={19} />

                        {saving
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </div>

            </div>

        </div>

    );

};

export default Settings;