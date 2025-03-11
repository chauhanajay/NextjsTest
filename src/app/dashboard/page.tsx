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
      </header>

      <main className="flex-1 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        <Card>
          <CardHeader className="flex items-center space-x-3">
            <User className="h-10 w-10 text-gray-700" />
            <CardTitle className="text-lg">Welcome, {user?.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage your profile and settings here.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
