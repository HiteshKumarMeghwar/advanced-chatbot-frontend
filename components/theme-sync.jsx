"use client";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function ThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return;

      const theme = JSON.parse(user)?.settings?.theme;
      if (theme === "dark" || theme === "light") {
        setTheme(theme);
      }
    } catch {}
  }, [setTheme]);

  return null;
}
