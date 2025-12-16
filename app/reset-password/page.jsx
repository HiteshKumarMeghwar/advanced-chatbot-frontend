import { Suspense } from "react";
import ClientResetPassword from "./client-reset-password";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ClientResetPassword />
    </Suspense>
  );
}
