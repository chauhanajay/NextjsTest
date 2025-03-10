"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const authSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthForm({ type }: { type: "login" | "signup" }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({ resolver: zodResolver(authSchema) });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);

    const { email, password } = data;

    const { error } =
      type === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>{type === "login" ? "Login" : "Sign Up"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("email")} placeholder="Email" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          <Input {...register("password")} type="password" placeholder="Password" />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          {error && <p className="text-red-500">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Processing..." : type === "login" ? "Login" : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
