import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

const authService = {
  async register(name, email, password) {
    const res = await axios.post(`${API_URL}/register`, { name, email, password });

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('login_timestamp', Date.now().toString());
    }

    return res.data;
  },

  async login(email, password) {
    const res = await axios.post(`${API_URL}/login`, { email, password });

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('login_timestamp', Date.now().toString());
    }

    return res.data;
  },

  async sendMagicLink(email) {
    const res = await axios.post(`${API_URL}/magic-link`, {
      email,
      redirectUrl: `${window.location.origin}/auth/callback`,
    });
    return res.data;
  },

  async verifyMagicLink(token) {
    const res = await axios.post(`${API_URL}/verify-magic`, { token });

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('login_timestamp', Date.now().toString());
    }

    return res.data;
  },

  async logout() {
    const token = localStorage.getItem('token');

    // backend logout is optional; local logout must always happen
    try {
      await axios.post(
        `${API_URL}/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      // ignore backend failures — still clear local session
      console.warn('Logout request failed:', err?.response?.data || err.message);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('login_timestamp');
  },
};

export default authService;
