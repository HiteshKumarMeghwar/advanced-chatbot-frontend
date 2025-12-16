"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Cpu,
  Wrench,
  Pencil,
  Check, X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/header";
import Sidebar from "@/components/chat/sidebar";
import TopLoader from "@/components/top-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserStore } from "@/store/useUserStore";

export default function ProfilePage() {
  const [edit, setEdit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  // hydrate store once
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored && !user) {
      setUser(JSON.parse(stored));
    }
  }, [user, setUser]);

  if (!user) {
    return <TopLoader />;
  }

  const tools = user.tools ?? {};
  const settings = user.settings ?? {};


  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} /> */}

      <div className="flex flex-1 flex-col m-2">
        <Header
          // sidebar
          // sidebarOpen={sidebarOpen}
          // setSidebarOpen={setSidebarOpen}
          protectedRoute={true}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          {/* Avatar + basics */}
          <Card className="mb-6 mt-6">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white text-2xl font-bold">
                  {user.name?.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {format(new Date(user.created_at), "MMM d, yyyy")}
                  </p>
                </div>

                <Button size="sm" className="ml-auto" onClick={() => setEdit(!edit)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Preferences */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Model</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.preferred_model ?? "Default"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {settings.theme ?? "system"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Active Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 pr-4">
                  {/* ----------  ACTIVE  ---------- */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">Active</p>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {(tools || [])
                          .filter((t) => t.status === "active")
                          .map((t) => (
                            <motion.div
                              key={t.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Badge variant="default" className="gap-1 pl-2 pr-3">
                                <Check className="h-3 w-3" />
                                {t.name.replace(/_/g, " ")}
                              </Badge>
                            </motion.div>
                          ))}
                      </AnimatePresence>
                      {(tools || []).filter((t) => t.status === "active").length === 0 && (
                        <span className="text-sm text-muted-foreground">none</span>
                      )}
                    </div>
                  </div>

                  {/* ----------  INACTIVE  ---------- */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Inactive</p>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {(tools || [])
                          .filter((t) => t.status === "inactive")
                          .map((t) => (
                            <motion.div
                              key={t.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Badge variant="secondary" className="gap-1 pl-2 pr-3">
                                <X className="h-3 w-3" />
                                {t.name.replace(/_/g, " ")}
                              </Badge>
                            </motion.div>
                          ))}
                      </AnimatePresence>
                      {(tools || []).filter((t) => t.status === "inactive").length === 0 && (
                        <span className="text-sm text-muted-foreground">none</span>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
