import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      code,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "OTP_REQUIRED") {
        setOtpRequired(true);
      } else if (result.error === "INVALID_OTP") {
        setError("Invalid verification code");
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-6">
      <div className="w-full max-w-md">
        <div className="bg-stone-800/50 backdrop-blur-xl border border-stone-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-600/10 blur-[100px] rounded-full" />

          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              {otpRequired ? (
                <ShieldCheck className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {otpRequired ? "Verification Required" : "Admin Hub"}
            </h1>
            <p className="text-stone-400 text-sm mt-2">
              {otpRequired 
                ? "Enter the code from your Authenticator app" 
                : "Secure marketplace operations center"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {!otpRequired ? (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-900/50 border border-stone-700 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                      placeholder="admin@salp.shop"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                      Password
                    </label>
                    <Link 
                      href="/forgot-password"
                      className="text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-900/50 border border-stone-700 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-4 text-center">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-4 bg-stone-900/50 border border-stone-700 rounded-xl text-white placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-center text-3xl font-mono tracking-[0.5em]"
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setOtpRequired(false)}
                  className="w-full mt-4 text-stone-500 hover:text-stone-300 text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowLeft size={12} /> Back to email login
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                otpRequired ? "Verify & Sign In" : "Secure Log In"
              )}
            </button>
          </form>

          <p className="text-center text-stone-600 text-[10px] uppercase tracking-[0.2em] mt-8 font-bold">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
