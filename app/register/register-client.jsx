"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useState } from "react";
import { Chrome } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import GlobalLoading from "@/app/login/loader";
import { forgotPassword, googleAuth, register } from "@/api/auth"; 

export default function RegisterPage() {

  const [googleLoading, setGoogleLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.error("Name, Email and password are required");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      toast.success("Registerd Successfully Welcome!");
      router.push("/chat");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      toast.error("Google Client ID not configured");
      return;
    }

    setGoogleLoading(true);
    setLoading(true);

    window.google.accounts.id.initialize({
      client_id: clientId,
      ux_mode: "popup",
      use_fedcm_for_prompt: true,
      callback: async (response) => {
        try {
          if (!response.credential) {
            throw new Error("No Google credential received");
          }

          const res = await googleAuth(response.credential);
          if(res.msg) {
            const res = await forgotPassword(res.email, "google")
            if(res.access_token){
              toast.success("Welcome to MeghX 🚀");
              toast.success("Please create first your new password.");
              router.push(`/reset-password?token=${encodeURIComponent(res.access_token)}&flag=google`);
            }else{
              toast.success("Welcome to MeghX 🚀");
              toast.success("Please create first your new password.");
              router.push("/login")
            }
          }else{
            toast.info("Your gmail is already registered!");
            router.push("/login")
          }
        } catch (err) {
          toast.error(err?.message || "Google login failed");
        } finally {
          setGoogleLoading(false);
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.prompt();
  };


  return (
    <>
      <Header />
      {loading ? (
          <GlobalLoading />
        ) : (
          <div className="min-h-[calc(89vh-4rem)] flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-black px-4">
            <Card className="w-full max-w-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Create account</CardTitle>
                <CardDescription className="text-center">
                  Fill in the details below to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Ada Lovelace" value={name} onChange={(e)=>setName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <Button className="w-full" onClick={handleRegister} disabled={loading}>
                  <motion.p
                    whileHover={{ scale: 1.25 }}
                    transition={{
                      scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                      rotate: { duration: 0.2 },                             // plus→X speed
                    }}>
                    {loading ? "Creating..." : "Create account"}
                  </motion.p>
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Google OAuth button */}
          
                    <Button
                      variant="outline"
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      className="w-full"
                    >
                      {googleLoading ? (
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : (
                        <>
                          <motion.span
                            whileHover={{ scale: 1.25 }}
                            transition={{
                              scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                          }}>
                          <Chrome className="mr-2 h-4 w-4" />
                          </motion.span>
                        </>
                      )}
                      <span className=""></span>
                      <motion.span
                            whileHover={{ scale: 1.25 }}
                            transition={{
                              scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                          }}>
                        Continue with Google
                      </motion.span>
                    </Button>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <motion.div
                    whileHover={{ scale: 1.25 }}
                    transition={{
                      scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                      rotate: { duration: 0.2 },                             // plus→X speed
                    }}>

                  <Link href="/login" className="underline">
                    Sign in
                  </Link>
                    </motion.div>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      <Footer />
    </>
  );
}