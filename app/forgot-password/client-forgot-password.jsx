"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ResetLoading from "./reset-loading";
import MissingEmail from "./not-email";
import { forgotPassword } from "@/api/auth";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  if (!email) {
    return <MissingEmail />
  }

  return <ForgotPasswordContent email={email} />;
}


function ForgotPasswordContent({ email }) {
  const router = useRouter();
  const sentRef = useRef(false);

  useEffect(() => {
    if (!email || sentRef.current) return;
    sentRef.current = true;

    const sendMail = async () => {
      try {
        const data = await forgotPassword(email)
        toast.success(
          data?.detail || "If the email exists, a reset link was sent."
        );

      } catch (err) {
        toast.error("Unable to send reset email");
      } finally {
        router.replace("/login");
      }
    };

    sendMail();
  }, [email, router]);

  return <ResetLoading />; // your animated envelope
}