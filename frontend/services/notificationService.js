import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/notifications";

export const getNotifications = async () => {
    const response = await axios.get(API_URL, {
        withCredentials: true
    });
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await axios.put(`${API_URL}/${id}/read`, {}, {
        withCredentials: true
    });
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true
    });
    return response.data;
};
