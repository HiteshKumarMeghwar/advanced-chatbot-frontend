import { Suspense } from "react";
import LoginPage from "./login-client";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
