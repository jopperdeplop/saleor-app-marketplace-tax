import { prisma } from "@/lib/prisma";
import { updateGlobalSettings } from "@/app/actions";
import { Settings, Save, ArrowLeft, User, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { TwoFactorSetup } from "./TwoFactorSetup";
import { signOut } from "@/auth";

// Type assertion to access adminUser
const db = prisma as any;

export default async function SettingsPage() {
  const session = await auth();
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "global" },
  });

  const adminUser = session?.user?.id
    ? await db.adminUser.findUnique({
        where: { id: session.user.id },
      })
    : null;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-text-secondary hover:text-accent mb-8 transition-colors text-[10px] font-extrabold uppercase tracking-widest"
        >
          <ArrowLeft size={20} /> Dashboard
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4 text-accent">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Settings size={32} />
            </div>
            <h1 className="text-3xl font-bold font-serif text-text-primary">Settings</h1>
          </div>
          <p className="text-text-secondary text-lg">
            Configure system-wide parameters and account security.
          </p>
        </header>

        {/* Global Settings */}
        <section className="bg-card p-8 rounded-3xl border border-border-custom shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 text-accent">
            <Settings size={20} />
            <h2 className="text-lg font-bold text-text-primary">Global System</h2>
          </div>
          <form action={updateGlobalSettings}>
            <div className="mb-6">
              <label htmlFor="defaultRate" className="block text-[10px] font-extrabold uppercase tracking-widest text-text-secondary mb-2">
                Default Commission Rate (%)
              </label>
              <p className="text-sm text-text-secondary/60 mb-4">
                This rate will be applied to all newly registered vendors automatically.
              </p>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  name="defaultRate"
                  id="defaultRate"
                  defaultValue={settings?.defaultCommissionRate ?? 10.0}
                  className="w-full text-4xl font-extrabold text-accent bg-transparent border-b-2 border-border-custom focus:border-accent outline-none py-2 px-1 transition-colors pl-8"
                  placeholder="10.0"
                />
                <span className="absolute top-1/2 -translate-y-1/2 left-0 text-xl font-bold text-text-secondary/30">
                  %
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
            >
              <Save size={20} /> Save Changes
            </button>
          </form>
        </section>

        {/* Security & 2FA */}
        <section className="bg-card p-8 rounded-3xl border border-border-custom shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 text-emerald-500">
            <ShieldCheck size={20} />
            <h2 className="text-lg font-bold text-text-primary">Security & 2FA</h2>
          </div>
          <TwoFactorSetup enabled={adminUser?.twoFactorEnabled ?? false} />
        </section>

        {/* Account Details */}
        <section className="bg-card p-8 rounded-3xl border border-border-custom shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 text-blue-500">
            <User size={20} />
            <h2 className="text-lg font-bold text-text-primary">Admin Account</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-text-secondary mb-1">Email</label>
              <p className="text-text-primary font-bold">{adminUser?.email || session?.user?.email}</p>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-text-secondary mb-1">Name</label>
              <p className="text-text-primary font-bold">{adminUser?.name || session?.user?.name}</p>
            </div>
          </div>
        </section>

        {/* Password Change */}
        <section className="bg-card p-8 rounded-3xl border border-border-custom shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 text-amber-500">
            <Lock size={20} />
            <h2 className="text-lg font-bold text-text-primary">Change Password</h2>
          </div>
          <PasswordChangeForm />
        </section>

        {/* Sign Out */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-red-500/10 text-red-500 font-extrabold py-4 rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
