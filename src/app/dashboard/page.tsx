"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, User } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-5 w-5" /> Logout
        </Button>
      </header>

      <main className="flex-1 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex items-center space-x-3">
            <User className="h-10 w-10 text-gray-700" />
            <CardTitle className="text-lg">Welcome, {user?.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage your profile and settings here.</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,245</p>
            <p className="text-sm">New signups this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">More Features</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Add charts, tables, and more...</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
