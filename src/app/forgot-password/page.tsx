"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/actions/auth-recovery";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const result = await requestPasswordReset(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-6">
        <div className="max-w-md w-full bg-stone-800/50 backdrop-blur-xl border border-stone-700 p-8 rounded-3xl shadow-2xl text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-stone-400 mb-8">If an account exists for that email, you will receive a password reset link shortly.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-6">
      <div className="max-w-md w-full bg-stone-800/50 backdrop-blur-xl border border-stone-700 p-8 rounded-3xl shadow-2xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-300 mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-stone-400 text-sm">Enter your email and we&apos;ll send you a link to reset your password.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/30 flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Admin Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@salp.shop"
              className="w-full px-4 py-3 bg-stone-900/50 border border-stone-700 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
