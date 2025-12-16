import { Suspense } from "react";
import ProfilePage from "./profile-client";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ProfilePage />
    </Suspense>
  );
}
