import { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const api = axios.create({
  baseURL: "https://studysprint-cpag.onrender.com",
  withCredentials: true, // important for cookies
});

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh token on app load
  const refreshAccessToken = async () => {
    try {
      const res = await api.post("/refresh");
      if (res.data.accessToken) setAccessToken(res.data.accessToken);
      else setAccessToken(null);
    } catch (err) {
      console.warn("Refresh token failed:", err.response?.data?.error);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAccessToken();
  }, []);

  // Attach access token to every request
  api.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: refresh token if 401
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await api.post("/refresh");
          if (res.data.accessToken) {
            setAccessToken(res.data.accessToken);
            originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
            return api(originalRequest); // retry original request
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );

  const saveTokens = (access) => setAccessToken(access);
  const logout = () => setAccessToken(null);

  const contextValue = useMemo(
    () => ({
      accessToken,
      saveTokens,
      logout,
      isAuthenticated: !!accessToken,
      isLoading,
    }),
    [accessToken, isLoading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
