"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deletePortalUser } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

interface DeleteUserButtonProps {
    userId: number | string;
    userName: string;
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deletePortalUser(userId);
            router.push("/dashboard/portal-users");
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert("Deletion failed. Please try again.");
            setIsDeleting(false);
            setIsOpen(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none font-sans"
            >
                Delete User
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-950 w-full max-w-md rounded-2xl shadow-2xl border border-red-100 dark:border-red-900/30 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                                    <AlertTriangle size={24} />
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-full transition-colors text-stone-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50 mb-2 font-display">
                                Delete {userName}?
                            </h3>
                            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6">
                                This will permanently remove this user account and all associated data including integrations and feature requests. This action cannot be undone.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Deleting User...
                                        </>
                                    ) : (
                                        "Yes, delete this user"
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
