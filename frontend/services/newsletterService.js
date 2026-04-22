import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/newsletter";

export const subscribeNewsletter = async (email) => {
  const response = await axios.post(`${API_URL}/subscribe`, { email });
  return response.data;
};
