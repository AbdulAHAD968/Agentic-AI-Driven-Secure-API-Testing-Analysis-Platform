import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/user";

const api = axios.create({
  baseURL: API_URL,
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
