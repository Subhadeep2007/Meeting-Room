import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "../layout/Navbar.jsx";
import api from "../services/api";

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

const [loadingMeetings, setLoadingMeetings] = useState(true);
const [search, setSearch] = useState("");


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

}, []);

const filteredMeetings = meetings.filter((meeting) =>
    meeting.title
        .toLowerCase()
        .includes(search.toLowerCase())
);


// ======================================
// Dashboard Statistics
// ======================================

const totalMeetings = meetings.length;

const activeMeetings = meetings.filter(
    (meeting) => meeting.isActive
).length;

const totalParticipants = meetings.reduce(
    (total, meeting) =>
        total + meeting.participants.length,
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

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white p-8 shadow-lg">

                <h1 className="text-4xl font-bold">

                    Welcome Back, Subha 👋

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

                            className="flex justify-between items-center border-b last:border-b-0 py-5"

                        >

                            {/* Left */}

                            <div>

                                <h3 className="text-xl font-semibold">

                                    {meeting.title}

                                </h3>

                                <p className="text-gray-500 mt-1">

                                    Meeting Code :

                                    <span className="font-semibold ml-2">

                                        {meeting.meetingCode}

                                    </span>

                                </p>

                                <p className="text-gray-500 mt-1">

                                    Participants :

                                    <span className="font-semibold ml-2">

                                        {meeting.participants.length}

                                    </span>

                                </p>

                                <p className="text-gray-500 mt-1">

                                    Status :

                                    {

                                        meeting.isActive ?

                                        <span className="text-green-600 font-semibold ml-2">

                                            Active

                                        </span>

                                        :

                                        <span className="text-red-600 font-semibold ml-2">

                                            Ended

                                        </span>

                                    }

                                </p>

                            </div>

                            {/* Right */}

                            <div className="flex gap-3">

                                <button

                                    onClick={() =>

                                        navigate(

                                            `/meeting/${meeting.meetingCode}`

                                        )

                                    }

                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"

                                >

                                    Join

                                </button>

                                <button

                                    onClick={() =>

                                        handleDeleteMeeting(

                                            meeting._id

                                        )

                                    }

                                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"

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