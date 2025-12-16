import { Suspense } from "react";
import SettingsPage from "./settings-client";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
