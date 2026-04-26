import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const API_URL = `${API_BASE_URL}/contact`;

export const submitContact = async (details) => {
  // [Reliance on Untrusted Inputs] Contact details are untrusted; backend sanitizes and validates before email/storage.
  const response = await axios.post(API_URL, details);
  return response.data;
};
