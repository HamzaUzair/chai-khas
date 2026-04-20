"use client";

import React, { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { apiFetch, getAuthSession, setAuthSession } from "@/lib/auth-client";
import type { AuthSession } from "@/types/auth";

function getDefaultRouteByRole(role: AuthSession["role"]) {
  if (role === "ORDER_TAKER") return "/create-order";
  if (role === "LIVE_KITCHEN") return "/kitchen";
  if (role === "CASHIER") return "/orders";
  if (role === "ACCOUNTANT") return "/sales-list";
  if (role === "SUPER_ADMIN") return "/dashboard";
  if (role === "RESTAURANT_ADMIN") return "/dashboard";
  if (role === "BRANCH_ADMIN") return "/dashboard";
  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = getAuthSession();
      if (session) {
        router.replace(getDefaultRouteByRole(session.role));
      }
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid username/email or password");
      }

      const session = data as AuthSession;
      setAuthSession(session);
      router.push(getDefaultRouteByRole(session.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fde8d8] via-[#f5e6d3] to-[#fde8d8] p-4">
      <div className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden bg-white">
        {/* ── Orange Header ── */}
        <div className="bg-[#ff5a1f] px-8 pt-10 pb-10 flex flex-col items-center gap-3">
          {/* Circle avatar */}
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-11 w-11 text-[#ff5a1f]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-wide">
            Welcome Back
          </h1>
          <p className="text-white/90 text-sm">
            Sign in to Restaurant Management
          </p>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="px-8 pt-8 pb-4 space-y-5">
          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="admin@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            }
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            }
            autoComplete="current-password"
            required
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        {/* ── Footer ── */}
        <div className="border-t border-gray-100 py-4 text-center">
          <p className="text-xs text-gray-400">
            © 2024 Restaurant Management System
          </p>
        </div>
      </div>
    </main>
  );
}
