"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, CreditCard, Activity } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function SettingsPage() {
  return (
    <>
    <Header protectedRoute={true} />
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard data-tooltip="Total Revenue" value="$12,345" icon={CreditCard} />
              <MetricCard data-tooltip="Active Users" value="1,234" icon={User} />
              <MetricCard data-tooltip="Sales" value="+234" icon={Activity} />
              <MetricCard data-tooltip="Configurations" value="12" icon={Settings} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>You made 4 sales this week.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <ActivityRow label="New sale" amount="+$120" />
                  <ActivityRow label="New sale" amount="+$80" />
                  <ActivityRow label="Refund" amount="-$40" />
                  <ActivityRow label="New sale" amount="+$200" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Detailed metrics coming soon.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center rounded border border-dashed">
                  <span className="text-muted-foreground">Chart placeholder</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your profile and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" /> Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" /> Preferences
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
    <Footer />
    </>
  );
}

/* Re-usable small components */
function MetricCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ActivityRow({ label, amount }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span className="text-sm font-semibold">{amount}</span>
    </div>
  );
}