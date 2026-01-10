"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LogIn, UserPlus, Menu, X, Settings, UserCircle, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ModeToggle } from "../ModeToggle";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import TopLoader from "../top-loader";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { logout } from "@/api/auth";
import { Separator } from "../ui/separator";

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
          <Popover>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.25 }} transition={{ type: "spring", stiffness: 300, damping: 10 }}>
                <Button variant="ghost" size="icon" data-tooltip="Account">
                  {loggedIn ? (
                    <Avatar>
                      <AvatarImage src={user?.avatar_url || ""} alt={user?.name || "U"} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-200 to-purple-600 text-white text-xs font-semibold">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                </Button>
              </motion.div>
            </PopoverTrigger>

            <PopoverContent side="bottom" align="end" className="w-56 p-2 space-y-1">
              {loggedIn ? (
                <>
                  <Link href="/profile" passHref>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Profile</span>
                    </Button>
                  </Link>

                  <Link href="/settings" passHref>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Settings</span>
                    </Button>
                  </Link>

                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm">Theme</span>
                    <ModeToggle />
                  </div>

                  <Separator />

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Log out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" passHref>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <LogIn className="h-4 w-4" />
                      <span className="text-sm">Login</span>
                    </Button>
                  </Link>

                  <Link href="/register" passHref>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span className="text-sm">Register</span>
                    </Button>
                  </Link>

                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm">Theme</span>
                    <ModeToggle />
                  </div>
                </>
              )}
            </PopoverContent>
          </Popover>
        </nav>
      </div>
    </header>
  );
}


const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);