"use client";

import { useState, Suspense } from "react";
import { resetPassword } from "@/app/actions/auth-recovery";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const result = await resetPassword(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-6">
        <div className="max-w-md w-full bg-stone-800/50 backdrop-blur-xl border border-stone-700 p-8 rounded-3xl shadow-2xl text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-stone-400 mb-6">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
             Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-6">
        <div className="max-w-md w-full bg-stone-800/50 backdrop-blur-xl border border-stone-700 p-8 rounded-3xl shadow-2xl text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Password Updated!</h1>
          <p className="text-stone-400 mb-6">Your password has been reset successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-6">
      <div className="max-w-md w-full bg-stone-800/50 backdrop-blur-xl border border-stone-700 p-8 rounded-3xl shadow-2xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">New Password</h1>
          <p className="text-stone-400 text-sm">Please set a secure new password for your admin account.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/30 flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <input type="hidden" name="token" value={token} />
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">New Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 bg-stone-900/50 border border-stone-700 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-stone-900/50 border border-stone-700 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
