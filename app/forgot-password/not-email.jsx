import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function MissingEmail() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-gray-900 dark:to-black px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <AlertCircle className="mx-auto mb-2 h-10 w-10 text-destructive" />
              <CardTitle>Missing email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                We need your email to send a reset link.
              </p>
              <Link href="/login" passHref>
                <Button className="w-full">Back to login</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
}