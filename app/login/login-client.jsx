"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/api/auth"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/chat");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />
      <div className="flex items-center justify-center pt-16 pb-20 bg-background from-sky-50 to-indigo-100 dark:from-gray-900 dark:to-black px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome To Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} placeholder="you@example.com" onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required placeholder="••••••••"/>
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              <motion.p
                whileHover={{ scale: 1.25 }}
                transition={{
                  scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                  rotate: { duration: 0.2 },                             // plus→X speed
                }}>

                {loading ? "Signing in..." : "Sign in"}
              </motion.p>
            </Button>

            {/* Forgot password link */}
            <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
            <Button className="w-full" variant="outline">
              <motion.p
                whileHover={{ scale: 1.25 }}
                transition={{ scale: { type: "spring", stiffness: 300, damping: 10 } }}
              >
                <Link href={`/forgot-password?email=${encodeURIComponent(email)}&flag=local`} className="text-xs">
                  Forgot password
                </Link>
              </motion.p>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <motion.div
                whileHover={{ scale: 1.25 }}
                transition={{
                  scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                  rotate: { duration: 0.2 },                             // plus→X speed
                }}>

              <Link href="/register" className="underline">
                Sign up
              </Link></motion.div>
            </div>
          </CardFooter>
        </Card>
      </div>
    <Footer />
    </>
  );
}