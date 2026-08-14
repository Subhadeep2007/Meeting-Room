import axios from "axios";

const api2 = axios.create({

    baseURL:` ${import.meta.env.VITE_BACKEND_URL2}/api`,

});

export default api2;