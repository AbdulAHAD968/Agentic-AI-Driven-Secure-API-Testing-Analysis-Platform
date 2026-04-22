import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/auth";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const register = async (userData) => {
  const response = await api.post("/register", userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post("/login", userData);
  return response.data;
};

export const verifyLogin2FA = async (userId, token) => {
  const response = await api.post("/login/2fa", { userId, token });
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.post("/verify-email", { token });
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await api.post("/resend-verification", { email });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post("/reset-password", { token, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const logout = async () => {
  const response = await api.get("/logout");
  return response.data;
};

export const setup2FA = async () => {
  const response = await api.post("/setup-2fa");
  return response.data;
};

export const activate2FA = async (token) => {
  const response = await api.post("/activate-2fa", { token });
  return response.data;
};
