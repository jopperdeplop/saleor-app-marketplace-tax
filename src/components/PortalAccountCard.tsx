"use client";

import React, { useState } from "react";
import { User, Mail, Shield, ShieldAlert, KeyRound, Save, Loader2 } from "lucide-react";
import { triggerPortalPasswordReset, updatePortalUser } from "@/app/actions/admin";

interface PortalAccountCardProps {
    user: {
        id: string | number;
        name: string;
        email: string;
        twoFactorEnabled: boolean;
    };
}

export function PortalAccountCard({ user }: PortalAccountCardProps) {
    const [email, setEmail] = useState(user.email);
    const [name, setName] = useState(user.name);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);

    const handleUpdate = async () => {
        setSaving(true);
        try {
            await updatePortalUser(user.id, { email, name });
            alert("Account details updated successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to update account details");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!confirm(`Send password reset email to ${email}?`)) return;
        setResetting(true);
        try {
            await triggerPortalPasswordReset(email);
            alert("Password reset email sent");
        } catch (error) {
            console.error(error);
            alert("Failed to send reset email");
        } finally {
            setResetting(false);
        }
    };

    return (
        <section className="bg-card rounded-3xl border border-border-custom shadow-sm overflow-hidden mb-12">
            <div className="px-8 py-6 border-b border-border-custom bg-indigo-50/30 dark:bg-indigo-900/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                        <User size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-serif text-text-primary">Portal Account</h2>
                        <p className="text-xs text-text-secondary mt-1">Manage partner access and credentials.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {user.twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                            <Shield size={12} /> 2FA Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                            <ShieldAlert size={12} /> 2FA Disabled
                        </span>
                    )}
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-text-secondary mb-2">Display Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-stone-50/50 dark:bg-stone-950/30 border border-border-custom rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-text-primary"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-text-secondary mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-stone-50/50 dark:bg-stone-950/30 border border-border-custom rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-text-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-custom pt-8">
                    <button 
                        onClick={handlePasswordReset}
                        disabled={resetting}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-red-500/10 hover:text-red-500 text-text-primary rounded-xl font-extrabold uppercase text-[10px] tracking-widest transition-all disabled:opacity-50"
                    >
                        {resetting ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                        Send Reset Link
                    </button>

                    <button 
                        onClick={handleUpdate}
                        disabled={saving || (name === user.name && email === user.email)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </section>
    );
}
