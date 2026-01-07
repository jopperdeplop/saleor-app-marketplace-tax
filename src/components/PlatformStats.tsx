"use client";

import React from "react";
import { Package, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";

interface PlatformStatsProps {
    brand: string;
    stats?: {
        productCount: number;
        totalOrders: number;
        avgOrderValue: number;
    };
}

export function PlatformStats({ brand, stats }: PlatformStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-8 rounded-3xl border border-border-custom shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-text-secondary">
                    <Package size={64} />
                </div>
                <TrendingUp className="text-blue-500 mb-4" size={32} />
                <h3 className="text-lg font-bold mb-1 text-text-primary">Products Listed</h3>
                <p className="text-3xl font-extrabold text-text-primary">{stats?.productCount ?? 0}</p>
                <p className="text-[10px] text-text-secondary mt-2 uppercase tracking-widest font-extrabold opacity-60">Active in Saleor Catalog</p>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border-custom shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-text-secondary">
                    <ShoppingBag size={64} />
                </div>
                <ShoppingBag className="text-purple-500 mb-4" size={32} />
                <h3 className="text-lg font-bold mb-1 text-text-primary">Total Orders</h3>
                <p className="text-3xl font-extrabold text-text-primary">{stats?.totalOrders ?? 0}</p>
                <p className="text-[10px] text-text-secondary mt-2 uppercase tracking-widest font-extrabold opacity-60">Life-to-date Transacted</p>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border-custom shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-text-secondary">
                    <DollarSign size={64} />
                </div>
                <DollarSign className="text-green-500 mb-4" size={32} />
                <h3 className="text-lg font-bold mb-1 text-text-primary">Avg. Order Value</h3>
                <p className="text-3xl font-extrabold text-text-primary">€{(stats?.avgOrderValue ?? 0).toFixed(2)}</p>
                <p className="text-[10px] text-text-secondary mt-2 uppercase tracking-widest font-extrabold opacity-60">Per marketplace sale</p>
            </div>
        </div>
    );
}
