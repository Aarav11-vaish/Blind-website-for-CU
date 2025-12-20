"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { OTPInput } from "@/components/ui/otp-input";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { requestOTP, verifyOTP } from "@/lib/api";

export default function SigninPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);

  const [poster, setPoster] = useState("/poster-light.jpg");

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setPoster(theme === "dark" ? "/poster-dark.jpg" : "/poster-light.jpg");
  }, []);

  useEffect(() => {
    const handler = () => {
      const theme = localStorage.getItem("theme");
      setPoster(theme === "dark" ? "/poster-dark.jpg" : "/poster-light.jpg");
    };

    window.addEventListener("theme-change", handler);
    return () => window.removeEventListener("theme-change", handler);
  }, []);

  const handleSendOTP = async () => {
    if (!email) {
      toast({
        title: "Email required",
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
        description: `An OTP has been sent to ${email}.`,
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
        title: "Invalid OTP",
        description: "Please enter the full 6-digit OTP.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(email, otp);

      toast({
        title: "Welcome Back!",
        description: "Sign in successful. Redirecting to dashboard...",
        variant: "success",
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Check for redirect destination
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin");
        router.push(redirectPath);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      toast({
        title: "Failed to verify OTP",
        description: err instanceof Error ? err.message : "Error verifying OTP",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setOtp("");
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* LEFT POSTER */}
      <div className="relative hidden md:block">
        <Image
          key={poster}
          src={poster}
          alt="Blind CU Poster"
          fill
          priority
          unoptimized
          className="object-cover object-center"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center p-6 
        bg-background-light dark:bg-background-dark">

        <Card
          className="
            w-full max-w-md shadow-xl
            bg-card-light dark:bg-card-dark
            border border-border-light dark:border-border-dark
          "
        >
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Sign In
            </CardTitle>

            <CardDescription>
              {step === "email"
                ? "Enter your college email to receive an OTP"
                : "Enter the 6-digit OTP sent to your email"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === "email" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@cuchd.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                  />

                  <p className="text-sm 
                    text-muted-foreground-light dark:text-muted-foreground-dark">
                    Use your college email (@cuchd.in)
                  </p>
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full font-semibold rounded-lg"
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
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Enter OTP</Label>

                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    length={6}
                    disabled={loading}
                  />

                  <p className="text-sm text-center
                    text-muted-foreground-light dark:text-muted-foreground-dark">
                    Check your email for the 6-digit code
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 rounded-lg"
                  >
                    Back
                  </Button>

                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="flex-1 font-semibold rounded-lg"
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

            <div className="flex justify-end pt-4 text-sm">
              <Link
                href="/"
                className="
                  underline
                  text-muted-foreground-light
                  hover:text-foreground-light
                  dark:text-muted-foreground-dark
                  dark:hover:text-foreground-dark
                "
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
