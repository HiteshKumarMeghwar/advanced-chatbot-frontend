import { Suspense } from "react";
import ClientForgotPassword from './client-forgot-password'

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ClientForgotPassword />
    </Suspense>
  );
}
