import axios from "axios";
import { ory } from "../lib/ory";

const API_URL = "http://localhost:5000/api/v1/admin";
const AUTH_URL = "http://localhost:5000/api/v1/auth";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const authApi = axios.create({
  baseURL: AUTH_URL,
  withCredentials: true,
});

// --- Ory Authentication ---

export const createLoginFlow = async () => {
  const { data } = await ory.createBrowserLoginFlow();
  return data;
};

export const submitLogin = async (flowId, formData, csrfToken) => {
  const { data } = await ory.updateLoginFlow({
    flow: flowId,
    updateLoginFlowBody: {
      method: "password",
      password: formData.password,
      identifier: formData.email,
      csrf_token: csrfToken,
    },
  });
  return data;
};

export const getSession = async () => {
  try {
    const { data } = await ory.toSession();
    return data;
  } catch (err) {
    return null;
  }
};

// Best-effort Ory logout. A 401 here just means "no active session", which is
// fine — the caller still wants local state cleared and navigation to happen.
export const logout = async () => {
  try {
    const { data } = await ory.createBrowserLogoutFlow();
    if (data?.logout_token) {
      await ory.updateLogoutFlow({ token: data.logout_token });
    }
  } catch (err) {
    if (err.response?.status !== 401) {
      console.error("Ory logout error:", err.response?.data || err.message);
    }
  }
};

// --- Legacy / Backend specific ---

export const adminLogin = async (credentials) => {
  const response = await authApi.post("/login", credentials);
  return response.data;
};

export const adminVerify2FA = async (userId, token) => {
  const response = await authApi.post("/login/2fa", { userId, token });
  return response.data;
};

export const getMe = async () => {
  const response = await authApi.get("/me");
  return response.data;
};



export const updateProfile = async (formData) => {
  const response = await axios.put("http://localhost:5000/api/v1/user/profile", formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const updatePassword = async (passData) => {
  const response = await axios.put("http://localhost:5000/api/v1/user/password", passData, {
    withCredentials: true
  });
  return response.data;
};


export const setup2FA = async () => {
    const response = await axios.post("http://localhost:5000/api/v1/auth/setup-2fa", {}, {
        withCredentials: true
    });
    return response.data;
};

export const activate2FA = async (token) => {
    const response = await axios.post("http://localhost:5000/api/v1/auth/activate-2fa", { token }, {
        withCredentials: true
    });
    return response.data;
};

export const disable2FA = async (password) => {
    const response = await axios.post("http://localhost:5000/api/v1/auth/disable-2fa", { password }, {
        withCredentials: true
    });
    return response.data;
};


export const getStats = async () => {
  const response = await api.get("/stats");
  return response.data;
};

export const getAuditStats = async () => {
  const customApi = axios.create({
    baseURL: "http://localhost:5000/api/v1/audit",
    withCredentials: true,
  });
  const response = await customApi.get("/stats");
  return response.data;
};


export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getAllAdminProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};

export const getAllAdminVulnerabilities = async () => {
  const response = await api.get("/vulnerabilities");
  return response.data;
};


export const getAdminAuditLogs = async () => {
  const response = await api.get("/logs");
  return response.data;
};

export const getSubscribers = async () => {
  const response = await api.get("/newsletter");
  return response.data;
};

export const sendNewsletter = async (newsletterData) => {
  const response = await api.post("/newsletter/send", newsletterData);
  return response.data;
};


export const getInquiries = async () => {
  const response = await api.get("/contacts");
  return response.data;
};

export const updateInquiry = async (id, status) => {
  const response = await api.put(`/contacts/${id}`, { status });
  return response.data;
};

export const deleteInquiry = async (id) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};


export const getAdminNotifications = async () => {
    const response = await api.get("/notifications");
    return response.data;
};

export const createNotification = async (notifData) => {
    const response = await api.post("/notifications", notifData);
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
};

export const purgeNotifications = async (days) => {
    const response = await api.delete(`/notifications/purge?days=${days}`);
    return response.data;
};

export const replyToInquiry = async (id, message) => {
  const response = await api.post(`/contacts/${id}/reply`, { message });
  return response.data;
};
