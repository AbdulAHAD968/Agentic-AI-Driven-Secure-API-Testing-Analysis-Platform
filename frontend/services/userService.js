import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const API_URL = `${API_BASE_URL}/user`;

const api = axios.create({
  baseURL: API_URL,
  // [Secure Session Handling / CSRF] Relies on backend httpOnly SameSite cookies and server-side authorization.
  withCredentials: true,
});

export const updateProfile = async (formData) => {
  const response = await api.put("/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updatePassword = async (passwords) => {
  const response = await api.put("/password", passwords);
  return response.data;
};
