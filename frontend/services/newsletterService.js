import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const API_URL = `${API_BASE_URL}/newsletter`;

export const subscribeNewsletter = async (email) => {
  // [Input Validation] Client sends only email; server validates and rejects malformed input.
  const response = await axios.post(`${API_URL}/subscribe`, { email });
  return response.data;
};
