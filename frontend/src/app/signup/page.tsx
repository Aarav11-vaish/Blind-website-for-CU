"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/ui/otp-input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { requestOTP, verifyOTP } from "@/lib/api";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOTP = async () => {
    if (!email) {
      toast({
        title: "Missing Email",
        description: "Please enter your email.",
        variant: "error",
      });
      return;
    }
    setLoading(true);
    try {
      await requestOTP(email);
      toast({
        title: "OTP Sent",
        description: `An OTP has been sent to ${email}. Please check your inbox (and spam folder).`,
        variant: "success",
      });
      setStep("otp");
    } catch (err) {
      toast({
        title: "Failed to send OTP",
        description: err instanceof Error ? err.message : "Failed to send OTP",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Incomplete OTP",
        description: "Please enter the complete 6-digit OTP.",
        variant: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await verifyOTP(email, otp);
      toast({
        title: "Signup Successful!",
        description: "Redirecting to home...",
        variant: "success",
      });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      toast({
        title: "Failed to verify OTP",
        description:
          err instanceof Error ? err.message : "Failed to verify OTP",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-primary to-secondary text-primary-foreground dark:text-white p-8">
        <div className="max-w-xs text-center space-y-6">
          <div className="text-4xl font-extrabold tracking-tight">Blind CU</div>
          <div className="text-lg opacity-80">
            Create your account and join the community.
          </div>
          <div className="text-xs opacity-60">Chandigarh University</div>
        </div>
      </div>
      {/* Right panel (form) */}
      <div className="flex flex-1 items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/60">
        <Card
          className="w-full max-w-md shadow-2xl bg-white/60 dark:bg-black/40 backdrop-blur-lg border border-border/60 rounded-2xl"
          style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)" }}
        >
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <CardDescription>
              {step === "email"
                ? "Enter your college email to receive an OTP"
                : "Enter the 6-digit OTP sent to your email"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "email" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@cuchd.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendOTP();
                      }
                    }}
                    className="bg-white/80 dark:bg-black/30 border border-border/40 focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-sm text-muted-foreground">
                    Please use your college email (@cuchd.in)
                  </p>
                </div>
                <Button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full rounded-xl font-semibold shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    length={6}
                    disabled={loading}
                    className="bg-white/80 dark:bg-black/30 border border-border/40"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Check your email for the 6-digit code
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="flex-1 rounded-xl font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 text-sm">
              <Link
                href="/signin"
                className="underline text-primary font-medium hover:opacity-80"
              >
                Already have an account? Sign In
              </Link>
              <Link
                href="/"
                className="underline text-muted-foreground hover:text-primary font-medium"
              >
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
