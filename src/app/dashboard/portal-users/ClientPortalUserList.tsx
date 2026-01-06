"use client";

import { useState } from "react";
import { Search, RefreshCw, KeyRound, Shield, User, RotateCcw } from "lucide-react";
import { triggerPortalPasswordReset } from "@/app/actions/admin";

interface PortalUser {
  id: string;
  name: string;
  email: string;
  brand: string | null;
  role: string | null;
  twoFactorEnabled: boolean | null;
  createdAt: string;
}

export default function ClientPortalUserList({ initialUsers }: { initialUsers: PortalUser[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [resettingMap, setResettingMap] = useState<Record<string, boolean>>({});

  const filteredUsers = initialUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReset = async (email: string) => {
    if (!confirm(`Are you sure you want to send a password reset email to ${email}?`)) return;

    setResettingMap(prev => ({ ...prev, [email]: true }));
    try {
      await triggerPortalPasswordReset(email);
      alert(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error(error);
      alert("Failed to send reset email.");
    } finally {
      setResettingMap(prev => ({ ...prev, [email]: false }));
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-8 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20">
        <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="text-sm text-stone-500 flex items-center">
                {filteredUsers.length} active users found
            </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 border-b border-stone-200 dark:border-stone-800">
                <tr>
                    <th className="px-8 py-4 font-bold text-xs uppercase tracking-widest">User</th>
                    <th className="px-8 py-4 font-bold text-xs uppercase tracking-widest">Brand/Role</th>
                    <th className="px-8 py-4 font-bold text-xs uppercase tracking-widest text-center">Security</th>
                    <th className="px-8 py-4 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {filteredUsers.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-stone-500">
                            No users match your search.
                        </td>
                    </tr>
                ) : (
                    filteredUsers.map(user => (
                        <tr key={user.id} className="group hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors">
                            <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-stone-900 dark:text-white">{user.name}</div>
                                        <div className="text-xs text-stone-500">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-4">
                                <div className="font-medium text-stone-900 dark:text-white">{user.brand || "Internal"}</div>
                                <div className="text-xs text-stone-500 capitalize">{user.role || "N/A"}</div>
                            </td>
                            <td className="px-8 py-4 text-center">
                                {user.twoFactorEnabled ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-bold">
                                        <Shield size={12} /> 2FA
                                    </span>
                                ) : (
                                    <span className="text-stone-400 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-8 py-4 text-right">
                                <button
                                    onClick={() => handleReset(user.email)}
                                    disabled={resettingMap[user.email]}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                    <KeyRound size={14} className={resettingMap[user.email] ? "animate-spin" : ""} />
                                    {resettingMap[user.email] ? "Sending..." : "Reset Password"}
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
