import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const API_URL = `${API_BASE_URL}/notifications`;

const api = axios.create({
    baseURL: API_URL,
    // [API1:2023 - BOLA] Backend still enforces recipient ownership for every notification mutation.
    withCredentials: true
});

export const getNotifications = async () => {
    const response = await api.get("/");
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await api.put(`/${id}/read`, {});
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
};
