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
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card border border-border-custom p-12 rounded-[40px] shadow-2xl text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-80" />
          <h1 className="text-3xl font-extrabold text-text-primary mb-3 font-serif">Invalid Link</h1>
          <p className="text-text-secondary text-lg mb-8">This password reset link is invalid or has expired.</p>
          <Link 
            href="/forgot-password" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-text-primary text-background rounded-full font-extrabold uppercase text-[10px] tracking-widest hover:opacity-90 transition-opacity"
          >
             Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card border border-border-custom p-12 rounded-[40px] shadow-2xl text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-text-primary mb-3 font-serif">Password Updated</h1>
          <p className="text-text-secondary text-lg">Your account security has been restored. Redirecting you to login now...</p>
          <div className="mt-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500 opacity-50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border border-border-custom p-12 rounded-[40px] shadow-2xl">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 mb-6">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary mb-3 font-serif">Secure New Password</h1>
          <p className="text-text-secondary text-base">Please set a strong password to protect your admin privileges.</p>
        </header>

        {error && (
          <div className="mb-8 p-5 bg-red-500/10 text-red-500 rounded-2xl text-sm border border-red-500/20 flex items-center gap-3 font-bold">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="token" value={token} />
          
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-text-secondary mb-3 ml-1">New Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full px-6 py-4 bg-stone-50/50 dark:bg-stone-950/30 border border-border-custom rounded-2xl text-text-primary placeholder-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-text-secondary mb-3 ml-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-stone-50/50 dark:bg-stone-950/30 border border-border-custom rounded-2xl text-text-primary placeholder-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 px-6 bg-amber-600 text-white font-extrabold rounded-2xl hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Update Password</>}
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
