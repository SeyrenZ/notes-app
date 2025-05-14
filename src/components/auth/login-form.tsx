"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../icon/logo";
import GoogleIcon from "../icon/google-icon";
import { useAuthStore } from "@/store/auth-store";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginForm() {
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Use the auth store
  const { isLoading, error, handleGoogleSignIn } = useAuthStore();

  // Combine store error with local error
  const displayError = error || localError;

  useEffect(() => {
    // Check if redirected from registration
    if (searchParams.get("registered") === "true") {
      setSuccess(
        "Registration successful! Please log in with your credentials."
      );
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLocalError(null);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setLocalError("Invalid email or password");
        return;
      }

      // Redirect to home page on successful login
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      setLocalError("An unexpected error occurred. Please try again.");
    }
  }

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full sm:bg-background bg-transparent sm:max-w-[540px] lg:p-12 sm:p-8 p-4 shadow-none sm:border border-0">
        <CardHeader className="flex flex-col items-center pb-4 px-0">
          <Logo className="w-[96px] h-[28px]]" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-center">
            Welcome to Note
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please log in to continue
          </p>
        </CardHeader>
        <CardContent className="px-0">
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="relative">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-xs text-muted-foreground hover:text-primary underline"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setShowPassword(!showPassword)}
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </Form>

          <div className="mt-2 text-center text-sm">
            <div className="text-muted-foreground flex items-center justify-center gap-2">
              <div className="w-full h-[1px] bg-border"></div>
              <span className="text-nowrap">Or</span>
              <div className="w-full h-[1px] bg-border"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-2 flex items-center justify-center space-x-2"
              onClick={() => handleGoogleSignIn("/")}
              disabled={isLoading}
            >
              <GoogleIcon className="w-10 h-10" />
              <span>Google</span>
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              No account yet?{" "}
              <Link
                href="/register"
                className="text-primary font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
