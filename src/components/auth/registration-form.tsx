"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
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
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../icon/logo";
import GoogleIcon from "../icon/google-icon";
import { useAuthStore } from "@/store/auth-store";
import { signIn } from "next-auth/react";

const formSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Use the auth store
  const { isLoading, error, handleGoogleSignIn } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  // Combine store error with local error
  const displayError = error || localError;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLocalError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: values.username,
            email: values.email,
            password: values.password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Handle specific error cases
        if (response.status === 400) {
          if (errorData.detail === "Email already registered") {
            throw new Error(
              "This email is already registered. Please use a different email or try logging in."
            );
          } else if (errorData.detail === "Username already taken") {
            throw new Error(
              "This username is already taken. Please choose a different username."
            );
          } else {
            throw new Error(
              errorData.detail ||
                "Registration failed. Please check your input and try again."
            );
          }
        } else if (response.status === 422) {
          throw new Error("Please check your input and try again.");
        } else {
          throw new Error("Registration failed. Please try again later.");
        }
      }

      // Auto-login the user after successful registration
      try {
        const loginResult = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
          callbackUrl: "/",
        });

        if (loginResult?.error) {
          // If auto-login fails, redirect to login page
          router.push("/login?registered=true");
          return;
        }

        // Redirect to home page on successful auto-login
        window.location.href = "/";
      } catch (loginError) {
        // If auto-login throws an error, redirect to login page
        router.push("/login?registered=true");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setLocalError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-[540px] p-12 shadow-none">
        <CardHeader className="flex flex-col items-center pb-4">
          <Logo className="w-[96px] h-[28px]]" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-center">
            Create an account
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your information to get started
          </p>
        </CardHeader>
        <CardContent>
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                          >
                            {showConfirmPassword ? (
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
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
              onClick={() => handleGoogleSignIn("/register")}
              disabled={isLoading}
            >
              <GoogleIcon className="w-10 h-10" />
              <span>Google</span>
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
