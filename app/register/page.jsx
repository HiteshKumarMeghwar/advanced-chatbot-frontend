import { Suspense } from "react";
import RegisterPage from "./register-client";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPage />
    </Suspense>
  );
}
