import { AuroraBackground } from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "@/lib/admin-credentials";
import { useAction } from "convex/react";
import logo from "@/assets/logo.svg";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Shield,
  UserX,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [mode, setMode] = useState<"student" | "admin">("student");
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Admin account bootstrap — idempotent, runs when the Admin tab is open.
  const ensureAdmin = useAction(api.admin.ensureAdmin);
  const [setupState, setSetupState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  useEffect(() => {
    if (mode !== "admin") return;
    let cancelled = false;
    setSetupState("loading");
    setSetupError(null);
    ensureAdmin({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .then(() => {
        if (!cancelled) setSetupState("ready");
      })
      .catch((err) => {
        console.error("Admin setup error:", err);
        if (!cancelled) {
          setSetupState("error");
          setSetupError(
            err instanceof Error
              ? err.message
              : "Could not prepare the admin account. Please try again.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode, ensureAdmin]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);

      setError("The verification code you entered is incorrect.");
      setIsLoading(false);

      setOtp("");
    }
  };

  const handleAdminSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("password", formData);

      navigate(redirect);
    } catch (error) {
      console.error("Admin sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Sign-in failed — check the password and try again.",
      );
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Failed to sign in as guest: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-foreground">
      <AuroraBackground />

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center justify-center h-full flex-col">
          <Card className="glass-strong min-w-[350px] max-w-[400px] pb-0 border-0 shadow-none rounded-3xl">
            {/* Student / Admin toggle */}
            <div className="px-6 pt-6">
              <div className="grid grid-cols-2 gap-1 rounded-full border border-white/60 bg-white/40 p-1">
                <button
                  type="button"
                  onClick={() => setMode("student")}
                  className={[
                    "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                    mode === "student"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <GraduationCap className="size-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setMode("admin")}
                  className={[
                    "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                    mode === "admin"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <Shield className="size-4" />
                  Admin
                </button>
              </div>
            </div>

            {mode === "student" ? (
              step === "signIn" ? (
                <>
                  <CardHeader className="text-center">
                    <div className="flex justify-center">
                      <img
                        src={logo}
                        alt="Lock Icon"
                        width={64}
                        height={64}
                        className="rounded-lg mb-4 mt-4 cursor-pointer"
                        onClick={() => navigate("/")}
                      />
                    </div>
                    <CardTitle className="text-xl">Get Started</CardTitle>
                    <CardDescription>
                      Enter your email to log in or sign up
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleEmailSubmit}>
                    <CardContent>
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            className="pl-9"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="outline"
                          size="icon"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-500">{error}</p>
                      )}

                      <div className="mt-4">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              Or
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full mt-4"
                          onClick={handleGuestLogin}
                          disabled={isLoading}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Continue as Guest
                        </Button>
                      </div>
                    </CardContent>
                  </form>
                </>
              ) : (
                <>
                  <CardHeader className="text-center mt-4">
                    <CardTitle>Check your email</CardTitle>
                    <CardDescription>
                      We've sent a code to {step.email}
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleOtpSubmit}>
                    <CardContent className="pb-4">
                      <input type="hidden" name="email" value={step.email} />
                      <input type="hidden" name="code" value={otp} />

                      <div className="flex justify-center">
                        <InputOTP
                          value={otp}
                          onChange={setOtp}
                          maxLength={6}
                          disabled={isLoading}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              otp.length === 6 &&
                              !isLoading
                            ) {
                              const form = (e.target as HTMLElement).closest(
                                "form",
                              );
                              if (form) {
                                form.requestSubmit();
                              }
                            }
                          }}
                        >
                          <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, index) => (
                              <InputOTPSlot key={index} index={index} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-500 text-center">
                          {error}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Didn't receive a code?{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => setStep("signIn")}
                        >
                          Try again
                        </Button>
                      </p>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || otp.length !== 6}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify code
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep("signIn")}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Use different email
                      </Button>
                    </CardFooter>
                  </form>
                </>
              )
            ) : (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center">
                    <img
                      src={logo}
                      alt="Lock Icon"
                      width={64}
                      height={64}
                      className="rounded-lg mb-4 mt-4 cursor-pointer"
                      onClick={() => navigate("/")}
                    />
                  </div>
                  <CardTitle className="text-xl">Admin Sign In</CardTitle>
                  <CardDescription>
                    Sign in with the seeded admin credentials
                  </CardDescription>
                </CardHeader>

                <div className="px-6">
                  {/* Demo credentials */}
                  <div className="rounded-2xl border border-white/60 bg-white/50 p-3 text-xs shadow-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <KeyRound className="size-3.5 text-muted-foreground" />
                      Demo credentials
                    </div>
                    <div className="mt-2 space-y-1 font-mono text-muted-foreground">
                      <div>
                        Email: <span className="text-foreground">{ADMIN_EMAIL}</span>
                      </div>
                      <div>
                        Password:{" "}
                        <span className="text-foreground">{ADMIN_PASSWORD}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      Change these in{" "}
                      <code className="text-foreground">
                        src/lib/admin-credentials.ts
                      </code>{" "}
                      after first sign-in.
                    </p>
                  </div>

                  {setupState === "loading" && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                      Preparing admin account…
                    </p>
                  )}
                  {setupState === "error" && (
                    <p className="mt-3 text-sm text-red-500">{setupError}</p>
                  )}
                  {setupState === "ready" && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
                      <Shield className="size-3.5" />
                      Admin account ready — you can sign in below.
                    </p>
                  )}
                </div>

                <form key={mode} onSubmit={handleAdminSubmit}>
                  <CardContent className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="email"
                        type="email"
                        defaultValue={ADMIN_EMAIL}
                        className="pl-9"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        defaultValue={ADMIN_PASSWORD}
                        className="pl-9 pr-10"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-2.5 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <input type="hidden" name="flow" value="signIn" />
                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || setupState === "loading"}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Sign in as Admin
                        </>
                      )}
                    </Button>
                  </CardContent>
                </form>
              </>
            )}

            <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-white/40 border-t border-white/60 rounded-b-3xl">
              Secured by{" "}
              <a
                href="https://freebuff.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                freebuff.com
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
