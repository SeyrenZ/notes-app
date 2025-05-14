"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useUserStore } from "@/store/user-store";

const formSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ChangePasswordSetting = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const { isOAuthUser, fetchUserInfo } = useUserStore();

  useEffect(() => {
    if (session?.accessToken) {
      fetchUserInfo(session.accessToken);
    }
  }, [session, fetchUserInfo]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isOAuthUser) {
      toast.error(
        "Password change is not available for accounts using Google login"
      );
      return;
    }

    setIsLoading(true);
    setSuccess(false);
    setError("");

    try {
      const token = session?.accessToken;

      if (!token) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: values.oldPassword,
            new_password: values.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          setError(errorData.detail || "Incorrect current password");
          throw new Error(errorData.detail || "Incorrect current password");
        } else if (response.status === 400) {
          setError(errorData.detail || "Unable to change password");
          throw new Error(errorData.detail || "Unable to change password");
        } else {
          setError("Failed to change password. Please try again later.");
          throw new Error("Failed to change password. Please try again later.");
        }
      }

      await response.json();
      setSuccess(true);
      form.reset();
      toast.success("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Error changing password");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isOAuthUser) {
    return (
      <div className="w-full max-w-[625px] flex flex-col p-6 gap-6">
        <div className="space-y-1">
          <div className="text-[16px] leading-[120%] font-bold">
            Change Password
          </div>
          <div className="text-sm text-muted-foreground">
            Change your password to secure your account
          </div>
        </div>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            Password change is not available for accounts using Google login.
            Your password is managed by Google and cannot be changed here.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[625px] flex flex-col p-6 gap-6">
      <div className="space-y-1">
        <div className="text-[16px] leading-[120%] font-bold">
          Change Password
        </div>
        <div className="text-sm text-muted-foreground">
          Change your password to secure your account
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Old Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                      >
                        {showOldPassword ? (
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
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                      >
                        {showNewPassword ? (
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
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
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

          {error && (
            <Alert className="bg-red-50 border-red-200 mb-4">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <AlertDescription className="text-green-800">
                Password changed successfully!
              </AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChangePasswordSetting;
