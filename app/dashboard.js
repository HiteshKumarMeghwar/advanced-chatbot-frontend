"use client";

// import { ModeToggle } from "@/components/ModeToggle";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsPage from "./settings/page"; // the file we built earlier
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { motion } from "framer-motion";

export default function Home() {
  /* 1.  client-only flag to avoid hydration mismatch */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* 2.  fake auth state – replace with real check */
  const [loggedIn, setLoggedIn] = useState(false);

  if (!mounted) {
    /* render empty skeleton on server + first client frame */
    return <div className="min-h-screen" />;
  }

  /* ----------  AUTH'D VIEW  ---------- */
  if (loggedIn) return <SettingsPage />;

  /* ----------  GUEST VIEW  ---------- */
  return (
    <>
    <Header />
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-gray-900 dark:to-black px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3">
          <Link href="/login" passHref>
            <Button className="w-full">
            <motion.p
              whileHover={{ scale: 1.25 }}
              transition={{
                scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                rotate: { duration: 0.2 },                             // plus→X speed
              }}>Login</motion.p></Button>
          </Link>
          <Link href="/register" passHref>
            <Button className="w-full">
              <motion.p
              whileHover={{ scale: 1.25 }}
              transition={{
                scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                rotate: { duration: 0.2 },                             // plus→X speed
              }}
              >Register
              </motion.p>
            </Button>
          </Link>
        </CardContent>

        <CardFooter className="justify-center">
          <motion.p 
          className="text-xs text-muted-foreground" 
          whileHover={{ scale: 1.25 }}
          transition={{
            scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
            rotate: { duration: 0.2 },                             // plus→X speed
          }}
          >© 2025 Your <span className="font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
            style={{ fontFamily: "Kalam, cursive" }}>MeghX</span> App</motion.p>
        </CardFooter>
      </Card>
    </div>
    <Footer />
    </>
  );
}