import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/contact";

export const submitContact = async (details) => {
  const response = await axios.post(API_URL, details);
  return response.data;
};
