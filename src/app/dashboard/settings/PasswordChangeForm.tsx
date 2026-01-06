"use client";

import { useState } from "react";
import { changePassword } from "@/app/actions/auth";

export function PasswordChangeForm() {
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);

    const result = await changePassword(formData);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      // Clear form
      const form = document.getElementById('password-form') as HTMLFormElement;
      form?.reset();
    }

    setLoading(false);
  };

  return (
    <form id="password-form" action={handleSubmit} className="space-y-4">
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm ${
          message.type === 'success' 
            ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
            : 'bg-red-500/10 text-red-500 border border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
          Current Password
        </label>
        <input
          type="password"
          name="currentPassword"
          required
          className="w-full px-4 py-3 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          className="w-full px-4 py-3 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
          Confirm New Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          className="w-full px-4 py-3 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
