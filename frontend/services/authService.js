import axios from "axios";
import { ory } from "../lib/ory";

const API_URL = "http://localhost:5000/api/v1/auth";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// --- Ory Authentication ---

/**
 * Initiates a login flow.
 */
export const createLoginFlow = async () => {
  const { data } = await ory.createBrowserLoginFlow();
  return data;
};

/**
 * Initiates a registration flow.
 */
export const createRegistrationFlow = async () => {
  const { data } = await ory.createBrowserRegistrationFlow();
  return data;
};

/**
 * Submits a registration flow.
 */
export const submitRegistration = async (flowId, formData, csrfToken) => {
  const { data } = await ory.updateRegistrationFlow({
    flow: flowId,
    updateRegistrationFlowBody: {
      method: "password",
      password: formData.password,
      csrf_token: csrfToken,
      traits: {
        email: formData.email,
      },
    },
  });
  return data;
};

/**
 * Submits a login flow.
 */
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

/**
 * Checks if the user is authenticated.
 */
export const getSession = async () => {
  try {
    const { data } = await ory.toSession();
    return data;
  } catch (err) {
    return null;
  }
};

/**
 * Logs the user out of Ory. Best-effort: if the session is already gone or the
 * flow call errors, we still want the caller to proceed with local cleanup.
 */
export const logout = async () => {
  try {
    const { data } = await ory.createBrowserLogoutFlow();
    if (data?.logout_token) {
      await ory.updateLogoutFlow({ token: data.logout_token });
    }
  } catch (err) {
    // 401 here usually means "no active session", which is fine for logout.
    if (err.response?.status !== 401) {
      console.error("Ory logout error:", err.response?.data || err.message);
    }
  }
};

// --- Legacy / Backend specific (Can be removed later) ---

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

export const getMe = async () => {
  const response = await api.get("/me");
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

export const disable2FA = async (password) => {
  const response = await api.post("/disable-2fa", { password });
  return response.data;
};
