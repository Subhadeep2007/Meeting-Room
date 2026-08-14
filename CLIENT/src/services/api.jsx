import axios from "axios";

const api = axios.create({

    baseURL: "https://meeting-room-ovql.onrender.com",

    withCredentials: true,

});

export default api;