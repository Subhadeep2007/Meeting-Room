import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "../layout/Navbar.jsx";
import api from "../services/api";
import socket from "../services/socket";

import {
    successToast,
    errorToast,
} from "../utils/toast";

import {
    Plus,
    Users,
    Video,
    Loader2,
} from "lucide-react";

const Dashboard = () => {

    // =====================================
    // Hooks
    // =====================================

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingCode, setMeetingCode] = useState("");
    const [meetings, setMeetings] = useState([]);
const [user, setUser] = useState(null);
const [loadingMeetings, setLoadingMeetings] = useState(true);
const [search, setSearch] = useState("");
const [liveParticipantCounts, setLiveParticipantCounts] = useState({});

    // =====================================
    // Create Meeting
    // =====================================

    const handleCreateMeeting = async () => {
         if (!meetingTitle.trim()) {

    return errorToast(

        "Please enter meeting title."

    );

}

        try {

            setLoading(true);
           

            const { data } = await api.post(
"/meeting/create",
{
title: meetingTitle,
}
)
            successToast(
                data.message || "Meeting Created Successfully"
            );

            navigate(
                `/meeting/${data.meeting.meetingCode}`
            );

        } catch (error) {

            errorToast(
                error.response?.data?.message ||
                "Unable to create meeting."
            );

        } finally {

            setLoading(false);

        }

    };
    // ======================================
// Join Meeting
// ======================================

const handleJoinMeeting = async () => {

    if (!meetingCode.trim()) {

        return errorToast(

            "Meeting Code Required"

        );

    }

    try {

        const { data } = await api.post(

            "/meeting/join",

            {

                meetingCode,

            }

        );

       if (data.waiting) {

    successToast(
        "Waiting for Host Approval"
    );

    navigate(
        `/meeting/${meetingCode}`
    );

    return;
}


if (data.rejoining) {

    successToast(
        "Rejoining Meeting..."
    );

    navigate(
        `/meeting/${meetingCode}`
    );

    return;
}
        successToast(

            data.message

        );

        navigate(

            `/meeting/${meetingCode}`

        );

    }
    

    catch (error) {

        errorToast(

            error.response?.data?.message ||

            "Unable to Join"

        );

    }

};
// ======================================
// Get My Meetings
// ======================================

const fetchMeetings = async () => {

    try {

        setLoadingMeetings(true);

        const { data } = await api.get(

            "/meeting/my-meetings"

        );

        setMeetings(data.meetings);

    }

    catch (error) {

        errorToast(

            error.response?.data?.message ||

            "Unable to fetch meetings."

        );

    }

    finally {

        setLoadingMeetings(false);

    }

};

// ======================================
// Delete Meeting
// ======================================

const handleDeleteMeeting = async(id)=>{

    try{

        await api.delete(

            `/meeting/${id}`

        );

        successToast(

            "Meeting Deleted"

        );

        fetchMeetings();

    }

    catch(error){

        errorToast(

            error.response?.data?.message ||

            "Unable to delete meeting."

        );

    }

};
useEffect(() => {

    fetchMeetings();

    const handleParticipantCount = ({
        meetingCode,
        count,
    }) => {

        setLiveParticipantCounts((prev) => ({

            ...prev,

            [meetingCode]: count,

        }));

    };

    socket.on(
        "meeting-participant-count",
        handleParticipantCount
    );

    return () => {

        socket.off(
            "meeting-participant-count",
            handleParticipantCount
        );

    };

}, []);

const filteredMeetings = meetings.filter((meeting) =>
    meeting.title
        .toLowerCase()
        .includes(search.toLowerCase())
);

// ======================================
// Get Current User
// ======================================

useEffect(() => {

    const getCurrentUser = async () => {

        try {

            const { data } = await api.get(
                "/auth/current-user"
            );

            setUser(data.user);

        } catch (error) {

            console.error(
                "Dashboard User Error:",
                error
            );

        }

    };

    getCurrentUser();

}, []);
// ======================================
// Dashboard Statistics
// ======================================

const totalMeetings = meetings.length;

const activeMeetings = meetings.filter(
    (meeting) => meeting.status === "live"
).length;

const totalParticipants = meetings.reduce(
    (total, meeting) => {

        const count =
            liveParticipantCounts[meeting.meetingCode]
            ?? meeting.participants.length;

        return total + count;

    },
    0
);

   return (

    <div className="min-h-screen bg-gray-100">

        {/* ===========================
            Navbar
        =========================== */}

        <Navbar />

        <div className="max-w-7xl mx-auto p-8">

            {/* ===========================
                Welcome Card
            =========================== */}

            <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl text-white p-8 shadow-lg">

                <h1 className="text-4xl font-bold">

    Welcome Back, {user?.name || "User"} 👋

</h1>

                <p className="mt-3 text-lg">

                    Ready to start your meeting today?

                </p>

            </div>

            {/* ===========================
                Statistics
            =========================== */}

            <div className="grid md:grid-cols-3 gap-6 mt-8">

                <div className="bg-white rounded-2xl shadow-lg p-6">

                    <h3 className="text-gray-500">

                        Total Meetings

                    </h3>

                    <h1 className="text-4xl font-bold text-blue-600 mt-2">

                        {totalMeetings}

                    </h1>

                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">

                    <h3 className="text-gray-500">

                        Active Meetings

                    </h3>

                    <h1 className="text-4xl font-bold text-green-600 mt-2">

                        {activeMeetings}

                    </h1>

                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">

                    <h3 className="text-gray-500">

                        Participants

                    </h3>

                    <h1 className="text-4xl font-bold text-purple-600 mt-2">

                        {totalParticipants}

                    </h1>

                </div>

            </div>

            {/* ===========================
                Create + Join Cards
            =========================== */}

            <div className="grid md:grid-cols-2 gap-8 mt-8">

                {/* ===========================
                    Create Meeting
                =========================== */}

                <div className="bg-white rounded-3xl shadow-lg p-8">

                    <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center">

                        <Plus className="text-blue-600"/>

                    </div>

                    <h2 className="text-2xl font-bold mt-6">

                        Create Meeting

                    </h2>

                    <p className="text-gray-500 mt-2">

                        Start a new instant meeting.

                    </p>

                    <input

                        type="text"

                        placeholder="Enter Meeting Title"

                        value={meetingTitle}

                        onChange={(e)=>

                            setMeetingTitle(e.target.value)

                        }

                        className="w-full mt-6 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"

                    />

                    <button

                        onClick={handleCreateMeeting}

                        disabled={loading}

                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex justify-center items-center gap-2"

                    >

                        {

                            loading ?

                            <>

                                <Loader2

                                    size={18}

                                    className="animate-spin"

                                />

                                Creating...

                            </>

                            :

                            "Create Meeting"

                        }

                    </button>

                </div>

                {/* ===========================
                    Join Meeting
                =========================== */}

                <div className="bg-white rounded-3xl shadow-lg p-8">

                    <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center">

                        <Users className="text-green-600"/>

                    </div>

                    <h2 className="text-2xl font-bold mt-6">

                        Join Meeting

                    </h2>

                    <p className="text-gray-500 mt-2">

                        Enter your meeting code.

                    </p>

                    <input

                        type="text"

                        placeholder="Meeting Code"

                        value={meetingCode}

                        onChange={(e)=>

                            setMeetingCode(e.target.value)

                        }

                        className="w-full mt-6 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"

                    />

                    <button

                        onClick={handleJoinMeeting}

                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"

                    >

                        Join Meeting

                    </button>

                </div>

            </div>

            {/* ===========================
                Search
            =========================== */}

            <input

                type="text"

                placeholder="Search Meeting..."

                value={search}

                onChange={(e)=>

                    setSearch(e.target.value)

                }

                className="w-full mt-10 mb-6 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"

            />

            {/* ===========================
                My Meetings
            =========================== */}

            <div className="bg-white rounded-3xl shadow-lg p-8">

                <h2 className="text-2xl font-bold mb-6">

                    My Meetings

                </h2>                {

                    loadingMeetings ?

                    (

                        <div className="text-center py-10">

                            Loading Meetings...

                        </div>

                    )

                    :

                    filteredMeetings.length === 0 ?

                    (

                        <div className="text-center py-10 text-gray-500">

                            No Meetings Found

                        </div>

                    )

                    :

                    filteredMeetings.map((meeting) => (

                        <div
                            key={meeting._id}
                            className="
                                border-b last:border-b-0
                                py-5
                                flex flex-col
                                lg:flex-row
                                lg:justify-between
                                lg:items-center
                                gap-5
                            "
                        >

                            {/* ==============================
                                Meeting Information
                            ============================== */}

                            <div className="flex-1 min-w-0">

                                <h3 className="text-xl font-semibold text-gray-900 truncate">
                                    {meeting.title}
                                </h3>

                                <div className="flex flex-wrap items-center gap-2 mt-3">

                                    <div className="bg-gray-100 rounded-lg px-3 py-1.5">
                                        <span className="text-xs text-gray-500">
                                            Code
                                        </span>
                                        <span className="ml-1 font-semibold text-gray-800 text-sm">
                                            {meeting.meetingCode}
                                        </span>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg px-3 py-1.5">
                                        <span className="text-xs text-blue-500">
                                            Participants
                                        </span>
                                        <span className="ml-1 font-semibold text-blue-700 text-sm">
                                            {
                                                liveParticipantCounts[meeting.meetingCode]
                                                ?? meeting.participants.length
                                            }
                                        </span>
                                    </div>

                                    {meeting.status === "live" ? (
                                        <span
                                            className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                bg-green-50
                                                text-green-600
                                                px-3
                                                py-1.5
                                                rounded-lg
                                                text-sm
                                                font-semibold
                                            "
                                        >
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            Live
                                        </span>
                                    ) : (
                                        <span
                                            className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                bg-red-50
                                                text-red-600
                                                px-3
                                                py-1.5
                                                rounded-lg
                                                text-sm
                                                font-semibold
                                            "
                                        >
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            Ended
                                        </span>
                                    )}

                                </div>

                                {/* ==============================
                                    Host
                                ============================== */}

                                <div className="mt-5">

                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                        Host
                                    </p>

                                    {meeting.host && (

                                        <div className="flex items-center gap-3">

                                            {meeting.host.profilePicture?.url ? (

                                                <img
                                                    src={meeting.host.profilePicture.url}
                                                    alt={meeting.host.username || "Host"}
                                                    className="
                                                        w-10
                                                        h-10
                                                        rounded-full
                                                        object-cover
                                                        border
                                                        border-gray-200
                                                    "
                                                />

                                            ) : (

                                                <div
                                                    className="
                                                        w-10
                                                        h-10
                                                        rounded-full
                                                        bg-blue-600
                                                        text-white
                                                        flex
                                                        items-center
                                                        justify-center
                                                        font-semibold
                                                    "
                                                >
                                                    {meeting.host.username
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "U"}
                                                </div>

                                            )}

                                            <div className="min-w-0">

                                                <p className="font-semibold text-gray-800 truncate">
                                                    {meeting.host.username || meeting.host.name}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    Host
                                                </p>

                                            </div>

                                        </div>

                                    )}

                                </div>

                                {/* ==============================
                                    Participants
                                ============================== */}

                                <div className="mt-5">

                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                        Participants
                                    </p>

                                    {meeting.participants?.length > 0 ? (

                                        <div className="flex flex-wrap gap-2">

                                            {meeting.participants.map((participant) => (

                                                <div
                                                    key={participant._id}
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        bg-gray-100
                                                        rounded-full
                                                        px-2
                                                        py-1.5
                                                        max-w-[160px]
                                                    "
                                                >

                                                    {participant.profilePicture?.url ? (

                                                        <img
                                                            src={participant.profilePicture.url}
                                                            alt={
                                                                participant.username ||
                                                                "Participant"
                                                            }
                                                            className="
                                                                w-8
                                                                h-8
                                                                rounded-full
                                                                object-cover
                                                                flex-shrink-0
                                                            "
                                                        />

                                                    ) : (

                                                        <div
                                                            className="
                                                                w-8
                                                                h-8
                                                                rounded-full
                                                                bg-purple-600
                                                                text-white
                                                                flex
                                                                items-center
                                                                justify-center
                                                                text-xs
                                                                font-semibold
                                                                flex-shrink-0
                                                            "
                                                        >
                                                            {participant.username
                                                                ?.charAt(0)
                                                                ?.toUpperCase() || "U"}
                                                        </div>

                                                    )}

                                                    <span
                                                        className="
                                                            text-sm
                                                            font-medium
                                                            text-gray-700
                                                            truncate
                                                        "
                                                    >
                                                        {participant.username ||
                                                            participant.name}
                                                    </span>

                                                </div>

                                            ))}

                                        </div>

                                    ) : (

                                        <p className="text-sm text-gray-400">
                                            No participants yet
                                        </p>

                                    )}

                                </div>

                            </div>

                            {/* ==============================
                                Action Buttons
                            ============================== */}

                            <div
                                className="
                                    flex
                                    gap-3
                                    w-full
                                    lg:w-auto
                                    lg:flex-shrink-0
                                "
                            >

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/meeting/${meeting.meetingCode}`
                                        )
                                    }
                                    className="
                                        flex-1
                                        lg:flex-none
                                        bg-blue-600
                                        hover:bg-blue-700
                                        active:scale-95
                                        transition
                                        text-white
                                        px-5
                                        py-2.5
                                        rounded-xl
                                        font-medium
                                    "
                                >
                                    Join
                                </button>

                                <button
                                    onClick={() =>
                                        handleDeleteMeeting(
                                            meeting._id
                                        )
                                    }
                                    className="
                                        flex-1
                                        lg:flex-none
                                        bg-red-600
                                        hover:bg-red-700
                                        active:scale-95
                                        transition
                                        text-white
                                        px-5
                                        py-2.5
                                        rounded-xl
                                        font-medium
                                    "
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    </div>

);
};

export default Dashboard;