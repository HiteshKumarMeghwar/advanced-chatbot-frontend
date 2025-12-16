"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { ModeToggle } from "../ModeToggle";
import { Menu, X, Settings  } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import TopLoader from "../top-loader";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { logout } from "@/api/auth";

export default function Header({ sidebar = false, sidebarOpen, setSidebarOpen, protectedRoute = false }) {
  const [mounted, setMounted] = useState(false);
  const { user, loadingUser } = useUser();
  const router = useRouter();
  const clearUser = useUserStore((s) => s.clearUser);

  // ✅ All hooks FIRST, no early returns
  useEffect(() => setMounted(true), []);

  // ----- Protected route guard -----
  useEffect(()=> {
    if (protectedRoute && !loadingUser && !user) router.push("/login");
  }, [loadingUser, user, router, protectedRoute]);

  // ----- Public route guard (login/register) -----
  useEffect(() => {
    if (!loadingUser && user) {
      const publicRoutes = ["/login", "/register"];
      if (publicRoutes.includes(router.pathname)) {
        router.replace("/chat"); // redirect logged-in user away from login/register
      }
    }
  }, [loadingUser, user, router]);


  async function handleLogout() {
    try {
      const res = await logout();
      if(res.ok) {
        clearUser();
        localStorage.removeItem("user");
        localStorage.removeItem("theme");
        localStorage.clear();
        toast.success("LoggedOut successfully ...");
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      toast.error(err);
      console.error("Logout failed:", err);
    }
  }

  // ✅ Safe conditional rendering AFTER hooks
  if (!mounted || loadingUser) {
    return <TopLoader />;
  }

  const loggedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT: hamburger (mobile only) + logo */}
        <div className="flex items-center gap-2">
          {/* hamburger – visible only on small screens AND when sidebar is closed */}
          {sidebar ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.25 }}
                  transition={{
                    scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                    rotate: { duration: 0.2 },                             // plus→X speed
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen((v) => !v)}
                    aria-label="Toggle menu"
                  >
                    {sidebarOpen ? <Menu className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </motion.div>
                <div className="px-2"></div>
              </>
            ):(<></>)}
          <motion.div 
            whileHover={{ scale: 1.25 }}
            transition={{
              scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
              rotate: { duration: 0.2 },                             // plus→X speed
            }}
          >
          <Link
            href="/chat"
            className="text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
            style={{ fontFamily: "Kalam, cursive" }}
          >
            MeghX Chatbot
          </Link>
          </motion.div>
        </div>

        {/* RIGHT: mode-toggle + auth buttons */}
        <nav className="flex items-center gap-3">
          <ModeToggle />
          {loggedIn ? (
            <>
              <Link href="/settings" passHref>
              <motion.div
                whileHover={{ scale: 1.25 }}
                transition={{
                  scale: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                <Button variant="ghost" size="sm" title="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </motion.div>
              </Link>

              <motion.div
                whileHover={{ scale: 1.25 }}
                transition={{
                  scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                  rotate: { duration: 0.2 },                             // plus→X speed
                }}
              >
                <Link href="/profile" passHref>
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="user" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.25 }}
                transition={{
                  scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                  rotate: { duration: 0.2 },                             // plus→X speed
                }}
              >
                <Button variant="ghost" size="sm" onClick={() => {
                    handleLogout()
                  }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <motion.div
                  whileHover={{ scale: 1.25 }}
                  transition={{
                    scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                    rotate: { duration: 0.2 },                             // plus→X speed
                  }}
                >
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                </motion.div>
              </Link>

              <Link href="/register" passHref>
                <motion.div
                  whileHover={{ scale: 1.25 }}
                  transition={{
                    scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                    rotate: { duration: 0.2 },                             // plus→X speed
                  }}
                >
                <Button variant="ghost" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
                </motion.div>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}