"use client";

import React from "react";
import { Package, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";

interface PlatformStatsProps {
    brand: string;
}

export function PlatformStats({ brand }: PlatformStatsProps) {
    // In a real scenario, this would fetch from Saleor. 
    // For now, let's use a beautiful placeholder UI to show what's possible
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Package size={64} />
                </div>
                <TrendingUp className="text-blue-500 mb-4" size={32} />
                <h3 className="text-lg font-bold mb-1">Products Listed</h3>
                <p className="text-3xl font-bold">12</p>
                <p className="text-xs text-stone-500 mt-2 uppercase tracking-wide font-bold">Active in Saleor Catalog</p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShoppingBag size={64} />
                </div>
                <ShoppingBag className="text-purple-500 mb-4" size={32} />
                <h3 className="text-lg font-bold mb-1">Total Orders</h3>
                <p className="text-3xl font-bold">48</p>
                <p className="text-xs text-stone-500 mt-2 uppercase tracking-wide font-bold">Lifetime Sales Volume</p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign size={64} />
                </div>
                <DollarSign className="text-green-500 mb-4" size={32} />
                <h3 className="text-lg font-bold mb-1">Avg. Order Value</h3>
                <p className="text-3xl font-bold">€124.50</p>
                <p className="text-xs text-stone-500 mt-2 uppercase tracking-wide font-bold">Per vendor transaction</p>
            </div>
        </div>
    );
}
