"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import UserService from "@/services/UserService";

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    setSuccessMessage(""); // Reset message

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setLoading(false);
      return;
    }
    else{
      UserService.insertData([{email: data.email}])
    }

    setSuccessMessage("Signup successful! Check your email for confirmation."); 
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-1">
              <Input
                type="email"
                placeholder="Email"
                {...register("email")}
                className="w-full"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
                className="w-full"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Sign Up"}
            </Button>
          </form>

          {successMessage && (
            <p className="mt-4 text-green-600 text-center text-sm font-medium">
              {successMessage}
            </p>
          )}

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account? <a href="/login" className="text-blue-600">Log in</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
