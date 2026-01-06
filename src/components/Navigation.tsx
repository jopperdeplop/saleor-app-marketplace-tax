"use client";

import Link from 'next/link';
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Sparkles, Settings, UsersRound, Package } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from "react";

interface NavLinkProps {
    href: string;
    children: ReactNode;
    icon: LucideIcon;
    isActive?: boolean;
}

function NavLink({ href, children, icon: Icon, isActive }: NavLinkProps) {
    return (
        <Link 
            href={href} 
            className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-lg transition-all text-sm font-medium",
                isActive 
                    ? "text-accent bg-accent/10" 
                    : "text-stone-500 hover:text-accent dark:text-stone-400 dark:hover:text-stone-300"
            )}
        >
            <Icon className="w-4 h-4" />
            {children}
        </Link>
    );
}

export function Navigation() {
    const pathname = usePathname();
    
    return (
        <nav className="flex items-center gap-2">
            <NavLink href="/" icon={LayoutDashboard} isActive={pathname === '/'}>
                Overview
            </NavLink>
            <NavLink href="/dashboard/applications" icon={UsersRound} isActive={pathname.startsWith('/dashboard/applications')}>
                Applications
            </NavLink>
            <NavLink href="/dashboard/portal-users" icon={Users} isActive={pathname.startsWith('/dashboard/portal-users')}>
                Portal Users
            </NavLink>
            <NavLink href="/dashboard/feature-requests" icon={Sparkles} isActive={pathname.startsWith('/dashboard/feature-requests')}>
                Requests
            </NavLink>
            <NavLink href="/dashboard/settings" icon={Settings} isActive={pathname.startsWith('/dashboard/settings')}>
                Settings
            </NavLink>
        </nav>
    );
}
