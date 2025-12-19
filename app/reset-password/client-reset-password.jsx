"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import GlobalLoading from "@/components/loader";
import { resetPassword } from "@/api/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const flag = searchParams.get("flag");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token || !flag) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-gray-900 dark:to-black px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>Invalid or expired link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The password-reset link is missing or expired.
            </p>
            <Link href="/login" passHref>
              <Button className="w-full">Request a new link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleReset() {
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password, flag);
      if (flag == "local"){
        toast.success("Congrats! Your password has been changed successfully.");
      } else {
        toast.success("Congrats! Your password has been created successfully.");
      }
      router.replace("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <Header />
    {loading ? (
      <GlobalLoading />
    ) : (
      <div className="min-h-[calc(89vh-4rem)] flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-gray-900 dark:to-black px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password"value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="••••••••" />
            </div>
            <Button className="w-full" onClick={handleReset} disabled={loading}>
                {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <motion.span
                    whileHover={{ scale: 1.25 }}
                    transition={{
                    scale: { type: "spring", stiffness: 300, damping: 10 },
                    }}
                >
                    Reset Password
                </motion.span>
                )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="mt-4 text-center text-xs text-muted-foreground">
                Back to{" "}
                <Link href="/login" className="underline">
                    Login
                </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    )}
    <Footer />
    </>
  );
}