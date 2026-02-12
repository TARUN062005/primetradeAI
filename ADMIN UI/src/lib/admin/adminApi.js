import axios from "axios";

export const ADMIN_API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  withCredentials: true,
});

// ✅ Attach admin token
ADMIN_API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Auto logout admin if token invalid
ADMIN_API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    // If unauthorized → clear token and redirect
    if (status === 401 || status === 403) {
      localStorage.removeItem("admin_token");

      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(err);
  }
);
