"use client";

import { userProfile, refreshUserToken } from "@/api/auth";
import { useEffect, useState } from "react";

export function useUser() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        let res = await userProfile();

        if (res.status === 401) {
          // 🔑 check if refresh token exists
          const cookiesArray = document.cookie.split("; ");
          const cookies = {};
          cookiesArray.forEach(cookie => {
            const [name, value] = cookie.split("=");
            cookies[name] = value;
          });

          if (cookies["refresh_token"]) {
            // try refresh once
            await refreshUserToken();

            // retry fetching profile
            res = await userProfile();
          }
        }

        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setUser(data);                      // React state
            localStorage.setItem("user", JSON.stringify(data)); // persist in localStorage
            const user = localStorage.getItem("user");
            const parsed = JSON.parse(user);
            const theme = parsed?.settings?.theme;
            localStorage.setItem("theme", theme);
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(theme);
            document.documentElement.style.colorScheme = theme;
          }
        } else {
          if (mounted) {
            setUser(null);
            localStorage.removeItem("user");     // clear if unauthorized
            localStorage.removeItem("theme");
          }
        }
      } catch {
        if (mounted) {
          setUser(null);
          localStorage.removeItem("user");     // clear if unauthorized
          localStorage.removeItem("theme");
        }
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  return { user, loadingUser };
}
