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

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

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
  const [studentMethod, setStudentMethod] = useState<"email" | "password">(
    "email",
  );
  const [passwordFlow, setPasswordFlow] = useState<"signIn" | "signUp">(
    "signIn",
  );
  const [pwStep, setPwStep] = useState<
    "form" | "verify" | "reset" | "resetVerify"
  >("form");
  const [pwEmail, setPwEmail] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const flow = String(formData.get("flow") ?? "signIn");
      const email = String(formData.get("email") ?? "");
      await signIn("password", formData);
      if (flow === "signUp") {
        // New accounts must confirm their email with a code first.
        setPwEmail(email);
        setPwStep("verify");
      } else {
        navigate(redirect);
      }
    } catch (error) {
      console.error("Password sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Sign-in failed — check your details and try again.",
      );
      setIsLoading(false);
    }
  };

  const handlePasswordVerify = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signIn("password", new FormData(event.currentTarget));
      navigate(redirect);
    } catch (error) {
      console.error("Password verification error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Verification failed — check the code and try again.",
      );
      setIsLoading(false);
    }
  };

  const handleResetRequest = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    setIsLoading(true);
    setError(null);
    try {
      await signIn("password", { email, flow: "reset" });
      setPwEmail(email);
      setPwStep("resetVerify");
    } catch (error) {
      console.error("Password reset request error:", error);
      setError(
        error instanceof Error && /destructur/i.test(error.message)
          ? "No password account was found for that email — create one, or sign in with an email code."
          : error instanceof Error
            ? error.message
            : "Could not send the reset code.",
      );
      setIsLoading(false);
    }
  };

  const handleResetVerify = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsLoading(true);
    setError(null);
    try {
      await signIn("password", {
        email: pwEmail,
        code: String(formData.get("code") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
        flow: "reset-verification",
      });
      navigate(redirect);
    } catch (error) {
      console.error("Password reset error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Could not reset the password — try again.",
      );
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signIn("google", { redirectTo: redirect });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Google sign-in failed — please try again.",
      );
      setGoogleLoading(false);
    }
  };

  const switchStudentMethod = (method: "email" | "password") => {
    setStudentMethod(method);
    setPwStep("form");
    setError(null);
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
                      Sign in or create a student account
                    </CardDescription>
                  </CardHeader>

                  {/* Method switcher */}
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-1 rounded-full border border-white/60 bg-white/40 p-1">
                      <button
                        type="button"
                        onClick={() => switchStudentMethod("email")}
                        className={[
                          "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                          studentMethod === "email"
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        <Mail className="size-4" />
                        Email code
                      </button>
                      <button
                        type="button"
                        onClick={() => switchStudentMethod("password")}
                        className={[
                          "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                          studentMethod === "password"
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        <Lock className="size-4" />
                        Password
                      </button>
                    </div>
                  </div>

                  {studentMethod === "email" ? (
                    <form onSubmit={handleEmailSubmit}>
                      <CardContent className="pb-0">
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
                      </CardContent>
                    </form>
                  ) : pwStep === "form" ? (
                    <form onSubmit={handlePasswordSubmit}>
                      <CardContent className="space-y-3 pb-0">
                        {passwordFlow === "signUp" && (
                          <div className="relative">
                            <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              name="name"
                              placeholder="Your name"
                              type="text"
                              className="pl-9"
                              disabled={isLoading}
                              maxLength={40}
                              autoComplete="name"
                            />
                          </div>
                        )}
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            className="pl-9"
                            disabled={isLoading}
                            required
                            autoComplete="email"
                          />
                        </div>
                        <div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder={
                                passwordFlow === "signUp"
                                  ? "At least 8 characters"
                                  : "Your password"
                              }
                              className="pl-9 pr-10"
                              disabled={isLoading}
                              required
                              minLength={passwordFlow === "signUp" ? 8 : undefined}
                              autoComplete={
                                passwordFlow === "signUp"
                                  ? "new-password"
                                  : "current-password"
                              }
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
                          {passwordFlow === "signIn" && (
                            <button
                              type="button"
                              onClick={() => {
                                setPwStep("reset");
                                setError(null);
                              }}
                              className="ml-auto mt-1 block text-xs text-muted-foreground transition-colors hover:text-primary"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <input
                          type="hidden"
                          name="flow"
                          value={passwordFlow}
                        />
                        {error && (
                          <p className="text-sm text-red-500">{error}</p>
                        )}
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {passwordFlow === "signUp"
                                ? "Creating account…"
                                : "Signing in…"}
                            </>
                          ) : passwordFlow === "signUp" ? (
                            "Create account"
                          ) : (
                            "Sign in"
                          )}
                        </Button>
                        {passwordFlow === "signUp" && (
                          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                            We'll email you a code to confirm your address before
                            your account is activated.
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="flex-col gap-2 pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setPasswordFlow((f) =>
                              f === "signIn" ? "signUp" : "signIn",
                            );
                            setError(null);
                          }}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {passwordFlow === "signIn"
                            ? "New here? Create an account"
                            : "Already have an account? Sign in"}
                        </Button>
                      </CardFooter>
                    </form>
                  ) : pwStep === "verify" ? (
                    <form onSubmit={handlePasswordVerify}>
                      <CardContent className="space-y-3 pb-0">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          We sent a 6-digit code to{" "}
                          <span className="font-semibold text-foreground">
                            {pwEmail}
                          </span>
                          . Enter it below to activate your password account.
                        </p>
                        <input type="hidden" name="email" value={pwEmail} />
                        <input
                          type="hidden"
                          name="flow"
                          value="email-verification"
                        />
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="code"
                            placeholder="6-digit code"
                            inputMode="numeric"
                            maxLength={6}
                            className="pl-9 text-center font-mono tracking-[0.3em]"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        {error && (
                          <p className="text-sm text-red-500">{error}</p>
                        )}
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying…
                            </>
                          ) : (
                            "Verify & activate"
                          )}
                        </Button>
                      </CardContent>
                      <CardFooter className="flex-col gap-2 pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setPwStep("form")}
                          disabled={isLoading}
                          className="w-full"
                        >
                          Back
                        </Button>
                      </CardFooter>
                    </form>
                  ) : pwStep === "reset" ? (
                    <form onSubmit={handleResetRequest}>
                      <CardContent className="space-y-3 pb-0">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          Enter the email on your password account — we'll send
                          a reset code.
                        </p>
                        <div className="relative">
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
                        {error && (
                          <p className="text-sm text-red-500">{error}</p>
                        )}
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending…
                            </>
                          ) : (
                            "Send reset code"
                          )}
                        </Button>
                      </CardContent>
                      <CardFooter className="flex-col gap-2 pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setPwStep("form")}
                          disabled={isLoading}
                          className="w-full"
                        >
                          Back to sign in
                        </Button>
                      </CardFooter>
                    </form>
                  ) : (
                    <form onSubmit={handleResetVerify}>
                      <CardContent className="space-y-3 pb-0">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          Enter the 6-digit code sent to{" "}
                          <span className="font-semibold text-foreground">
                            {pwEmail}
                          </span>{" "}
                          and choose a new password.
                        </p>
                        <input type="hidden" name="email" value={pwEmail} />
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="code"
                            placeholder="6-digit code"
                            inputMode="numeric"
                            maxLength={6}
                            className="pl-9 text-center font-mono tracking-[0.3em]"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="New password (at least 8 characters)"
                            className="pl-9 pr-10"
                            disabled={isLoading}
                            required
                            minLength={8}
                            autoComplete="new-password"
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
                        {error && (
                          <p className="text-sm text-red-500">{error}</p>
                        )}
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Resetting…
                            </>
                          ) : (
                            "Reset password"
                          )}
                        </Button>
                      </CardContent>
                      <CardFooter className="flex-col gap-2 pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setPwStep("form")}
                          disabled={isLoading}
                          className="w-full"
                        >
                          Back
                        </Button>
                      </CardFooter>
                    </form>
                  )}

                  {/* Shared: Google + guest */}
                  <div className="px-6 pb-6 pt-4">
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
                      className="mt-4 w-full"
                      onClick={() => void handleGoogle()}
                      disabled={isLoading || googleLoading}
                    >
                      {googleLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <GoogleG className="mr-2 h-4 w-4" />
                      )}
                      Continue with Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => void handleGuestLogin()}
                      disabled={isLoading || googleLoading}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Continue as Guest
                    </Button>
                  </div>
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
