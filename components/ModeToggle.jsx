"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserStore } from "@/store/useUserStore";
import { updateThemeDB } from "@/api/status_update";

export function ModeToggle() {
  const { setTheme } = useTheme()
  const updateTheme = useUserStore((s) => s.updateTheme);

  const changeTheme = async (theme) => {
    setTheme(theme);    // 1️⃣ Optimistic UI
    updateTheme(theme); // 🔥 instant UI sync

    try {
      await updateThemeDB(theme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
      toast.success("Theme Updated Successfully");
    } catch (err) {
      console.log(err)
      toast.success("Theme Updated Successfully");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.25 }}
          transition={{
            scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
            rotate: { duration: 0.2 },                             // plus→X speed
          }}
        >
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
