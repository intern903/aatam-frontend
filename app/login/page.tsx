"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthField, { AuthError, AuthSubmit } from "@/components/auth/AuthField";
import { createToken, saveToken } from "@/lib/auth";
import { signIn, useApp } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Any password is accepted; only the email has to match the saved user.
    if (!user || user.email.toLowerCase() !== email.trim().toLowerCase()) {
      setError(true);
      return;
    }
    const token = createToken({ email: user.email, name: user.name });
    saveToken(token);
    // An account without a saved password (the sample client) takes the first one used,
    // so Change Password has something to check against.
    signIn({ ...user, token, password: user.password ?? password });
    router.replace("/");
  }

  return (
    <main className="pt-login-top">
      <AuthCard subtitle="Gateway to your Life Operating System" onSubmit={handleSubmit}>
        <div className="flex w-full flex-col gap-16">
          <AuthField
            label="Email"
            placeholder="Enter your email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              setError(false);
            }}
          />
          <div className="flex w-full flex-col gap-12">
            <AuthField
              label="Password"
              placeholder="Enter your password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />
            <div className="flex w-full items-center justify-between text-caption-lg text-ink-brown">
              <label className="flex items-center gap-8">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-16 appearance-none rounded-2 border-hairline border-ink-muted bg-background shadow-input-inset checked:bg-primary-600"
                />
                Remember me
              </label>
              <Link href="/forgot-password">Forgot Password</Link>
            </div>
          </div>
          {error && (
            <AuthError>
              We couldn’t find an account with that email.{" "}
              <Link href="/signup" className="underline">
                Create one
              </Link>
            </AuthError>
          )}
        </div>
        <AuthSubmit />
      </AuthCard>
    </main>
  );
}
