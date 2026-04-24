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
export const submitRegistration = async (flowId, formData) => {
  const { data } = await ory.updateRegistrationFlow({
    flow: flowId,
    updateRegistrationFlowBody: {
      method: "password",
      password: formData.password,
      traits: {
        email: formData.email,
        name: formData.name,
      },
    },
  });
  return data;
};

/**
 * Submits a login flow.
 */
export const submitLogin = async (flowId, formData) => {
  const { data } = await ory.updateLoginFlow({
    flow: flowId,
    updateLoginFlowBody: {
      method: "password",
      password: formData.password,
      identifier: formData.email,
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
 * Logs the user out.
 */
export const logout = async () => {
  const { data } = await ory.createBrowserLogoutFlow();
  await ory.updateLogoutFlow({ token: data.logout_token });
  window.location.href = "/login";
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
