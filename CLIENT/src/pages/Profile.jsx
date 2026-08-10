import { useEffect, useState } from "react";
import { Edit, Save, X,Camera, } from "lucide-react";

import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

const Profile = () => {

    // =====================================
    // User
    // =====================================

    const [user, setUser] = useState(null);

    // =====================================
    // Loading
    // =====================================

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    // =====================================
    // Edit Mode
    // =====================================

    const [editing, setEditing] = useState(false);

    // =====================================
    // Form
    // =====================================

    const [name, setName] = useState("");

    const [username, setUsername] = useState("");

    const [selectedImage, setSelectedImage] = useState(null);

const [imagePreview, setImagePreview] = useState("");

const [uploadingImage, setUploadingImage] = useState(false);

    // =====================================
    // Get Current User
    // =====================================

    const getCurrentUser = async () => {

        try {

            setLoading(true);

            const { data } = await api.get(
                "/auth/current-user"
            );

            setUser(data.user);

            setName(data.user.name || "");

            setUsername(
                data.user.username || ""
            );

        } catch (error) {

            console.error(
                "Get Current User Error:",
                error
            );

            errorToast(
                error.response?.data?.message ||
                "Failed to load profile"
            );

        } finally {

            setLoading(false);

        }

    };

    // =====================================
    // Load Profile
    // =====================================

    useEffect(() => {

        getCurrentUser();

    }, []);

    // =====================================
    // Start Editing
    // =====================================

    const handleEdit = () => {

        setName(user.name || "");

        setUsername(
            user.username || ""
        );

        setEditing(true);

    };

    // =====================================
// Select Profile Picture
// =====================================

const handleImageSelect = (e) => {

    const file = e.target.files?.[0];

    if (!file) {
        return;
    }

    // Only images
    if (!file.type.startsWith("image/")) {

        errorToast(
            "Please select a valid image"
        );

        return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {

        errorToast(
            "Image size must be less than 5MB"
        );

        return;
    }

    setSelectedImage(file);

    setImagePreview(
        URL.createObjectURL(file)
    );

};

// =====================================
// Upload Profile Picture
// =====================================

const handleUploadImage = async () => {

    if (!selectedImage) {

        errorToast(
            "Please select an image"
        );

        return;
    }

    try {

        setUploadingImage(true);

        const formData = new FormData();

        formData.append(
            "profilePicture",
            selectedImage
        );

        const { data } = await api.put(
            "/user/profile-picture",
            formData
        );

        // =================================
        // Update User
        // =================================

        setUser((prevUser) => ({
            ...prevUser,
            profilePicture: {
                ...prevUser.profilePicture,
                url: data.profilePicture,
            },
        }));

        setSelectedImage(null);

        setImagePreview("");

        successToast(
            data.message ||
            "Profile Picture Updated"
        );

    } catch (error) {

        console.error(
            "Upload Profile Picture Error:",
            error
        );

        errorToast(
            error.response?.data?.message ||
            "Failed to upload profile picture"
        );

    } finally {

        setUploadingImage(false);

    }

};

    // =====================================
    // Cancel Editing
    // =====================================

    const handleCancel = () => {

        setName(user.name || "");

        setUsername(
            user.username || ""
        );

        setEditing(false);

    };

    // =====================================
    // Save Profile
    // =====================================

    const handleSave = async (e) => {

        e.preventDefault();

        if (!name.trim() || !username.trim()) {

            errorToast(
                "Name and username are required"
            );

            return;

        }

        try {

            setSaving(true);

            const { data } = await api.put(
                "/user/profile",
                {
                    name: name.trim(),
                    username: username
                        .trim()
                        .toLowerCase(),
                }
            );

            // =================================
            // Update UI
            // =================================

            setUser(data.user);

            setName(data.user.name);

            setUsername(
                data.user.username
            );

            setEditing(false);

            successToast(
                data.message ||
                "Profile Updated Successfully"
            );

        } catch (error) {

            console.error(
                "Update Profile Error:",
                error
            );

            errorToast(
                error.response?.data?.message ||
                "Failed to update profile"
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

                    Loading Profile...

                </p>

            </div>

        );

    }

    // =====================================
    // No User
    // =====================================

    if (!user) {

        return (

            <div className="
                min-h-screen
                bg-gray-950
                flex
                items-center
                justify-center
            ">

                <p className="text-red-400">

                    Unable to load profile.

                </p>

            </div>

        );

    }

    // =====================================
    // Profile
    // =====================================

    return (

        <div className="
            min-h-screen
            bg-gray-950
            p-6
        ">

            <div className="
                max-w-2xl
                mx-auto
            ">

                {/* ==========================
                    Header
                ========================== */}

                <div className="
                    flex
                    items-center
                    justify-between
                    mb-6
                ">

                    <h1 className="
                        text-3xl
                        font-bold
                        text-white
                    ">

                        My Profile

                    </h1>

                    {!editing && (

                        <button
                            type="button"
                            onClick={handleEdit}
                            className="
                                flex
                                items-center
                                gap-2
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                px-4
                                py-2
                                rounded-lg
                            "
                        >

                            <Edit size={18} />

                            Edit Profile

                        </button>

                    )}

                </div>

                {/* ==========================
                    Profile Card
                ========================== */}

                <div className="
                    bg-gray-900
                    border
                    border-gray-800
                    rounded-2xl
                    p-6
                ">

                    {/* ======================
                        Profile Picture
                    ====================== */}

                    <div className="
                        flex
                        justify-center
                        mb-8
                    ">


                         {/* Image */}

    {imagePreview ? (

        <img
            src={imagePreview}
            alt="Preview"
            className="
                w-32
                h-32
                rounded-full
                object-cover
                border-4
                border-blue-500
            "
        />

    ) : user.profilePicture?.url ? (

        <img
            src={user.profilePicture.url}
            alt={user.username}
            className="
                w-32
                h-32
                rounded-full
                object-cover
                border-4
                border-gray-700
            "
        />

    ) : (

        <div className="
            w-32
            h-32
            rounded-full
            bg-blue-600
            flex
            items-center
            justify-center
        ">

            <span className="
                text-white
                text-4xl
                font-bold
            ">

                {user.username
                    ?.charAt(0)
                    ?.toUpperCase()}

            </span>

        </div>

    )}

    {/* Change Photo */}

    <label className="
        mt-4
        flex
        items-center
        gap-2
        bg-gray-800
        hover:bg-gray-700
        text-white
        px-4
        py-2
        rounded-lg
        cursor-pointer
    ">

        <Camera size={18} />

        Change Photo

        <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
        />

    </label>

    {/* Upload Button */}

    {selectedImage && (

        <div className="
            flex
            gap-3
            mt-3
        ">

            <button
                type="button"
                onClick={handleUploadImage}
                disabled={uploadingImage}
                className="
                    flex
                    items-center
                    gap-2
                    bg-green-600
                    hover:bg-green-700
                    disabled:opacity-50
                    text-white
                    px-4
                    py-2
                    rounded-lg
                "
            >

                <Save size={18} />

                {uploadingImage
                    ? "Uploading..."
                    : "Upload Photo"}

            </button>

            <button
                type="button"
                onClick={() => {

                    setSelectedImage(null);

                    setImagePreview("");

                }}
                disabled={uploadingImage}
                className="
                    flex
                    items-center
                    gap-2
                    bg-gray-700
                    hover:bg-gray-600
                    text-white
                    px-4
                    py-2
                    rounded-lg
                "
            >

                <X size={18} />

                Cancel

            </button>

        </div>

    )}

</div>


                    {/* ======================
                        Edit Form
                    ====================== */}

                    {editing ? (

                        <form
                            onSubmit={handleSave}
                            className="space-y-5"
                        >

                            {/* Name */}

                            <div>

                                <label className="
                                    block
                                    text-gray-400
                                    text-sm
                                    mb-2
                                ">

                                    Name

                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    className="
                                        w-full
                                        bg-gray-800
                                        border
                                        border-gray-700
                                        text-white
                                        rounded-lg
                                        px-4
                                        py-3
                                        outline-none
                                        focus:ring-2
                                        focus:ring-blue-500
                                    "
                                />

                            </div>

                            {/* Username */}

                            <div>

                                <label className="
                                    block
                                    text-gray-400
                                    text-sm
                                    mb-2
                                ">

                                    Username

                                </label>

                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(
                                            e.target.value
                                        )
                                    }
                                    className="
                                        w-full
                                        bg-gray-800
                                        border
                                        border-gray-700
                                        text-white
                                        rounded-lg
                                        px-4
                                        py-3
                                        outline-none
                                        focus:ring-2
                                        focus:ring-blue-500
                                    "
                                />

                            </div>

                            {/* Email */}

                            <div>

                                <label className="
                                    block
                                    text-gray-400
                                    text-sm
                                    mb-2
                                ">

                                    Email

                                </label>

                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="
                                        w-full
                                        bg-gray-800
                                        border
                                        border-gray-700
                                        text-gray-500
                                        rounded-lg
                                        px-4
                                        py-3
                                        cursor-not-allowed
                                    "
                                />

                            </div>

                            {/* Buttons */}

                            <div className="
                                flex
                                gap-3
                                pt-2
                            ">

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        bg-green-600
                                        hover:bg-green-700
                                        disabled:opacity-50
                                        text-white
                                        px-5
                                        py-2
                                        rounded-lg
                                    "
                                >

                                    <Save size={18} />

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        bg-gray-700
                                        hover:bg-gray-600
                                        text-white
                                        px-5
                                        py-2
                                        rounded-lg
                                    "
                                >

                                    <X size={18} />

                                    Cancel

                                </button>

                            </div>

                        </form>

                    ) : (

                        /* ======================
                           View Mode
                        ====================== */

                        <div className="space-y-5">

                            {/* Name */}

                            <div>

                                <p className="
                                    text-gray-400
                                    text-sm
                                ">

                                    Name

                                </p>

                                <p className="
                                    text-white
                                    text-lg
                                    mt-1
                                ">

                                    {user.name}

                                </p>

                            </div>

                            {/* Username */}

                            <div>

                                <p className="
                                    text-gray-400
                                    text-sm
                                ">

                                    Username

                                </p>

                                <p className="
                                    text-white
                                    text-lg
                                    mt-1
                                ">

                                    @{user.username}

                                </p>

                            </div>

                            {/* Email */}

                            <div>

                                <p className="
                                    text-gray-400
                                    text-sm
                                ">

                                    Email

                                </p>

                                <p className="
                                    text-white
                                    text-lg
                                    mt-1
                                ">

                                    {user.email}

                                </p>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

};

export default Profile;