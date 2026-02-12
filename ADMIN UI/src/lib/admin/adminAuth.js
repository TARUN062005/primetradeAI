import { ADMIN_API } from "./adminApi";

export const adminAuth = {
  async login(email, password) {
    const res = await ADMIN_API.post("/api/admin/login", { email, password });
    return res.data;
  },

  async me() {
    const res = await ADMIN_API.get("/api/admin/me");
    return res.data;
  },

  logout() {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  },
};
