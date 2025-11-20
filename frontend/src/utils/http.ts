import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true, // nhận cookie HttpOnly
});

// COMMENTED OUT: Auto-redirect to signin on 401
// api.interceptors.response.use(
//   (r) => r,
//   (err) => {
//     if (err?.response?.status === 401) {
//       window.location.href = "/signin"; // redirect về signin khi 401 / token hết hạn
//     }
//     return Promise.reject(err);
//   }
// );
