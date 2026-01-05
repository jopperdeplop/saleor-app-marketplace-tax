"use client";

import React, { useEffect, useState } from "react";
import { Users, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { syncVendors } from "@/app/actions";

interface Vendor {
  brandName: string;
  brandAttributeValue: string;
  commissionRate: number;
}

export function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchVendors = () => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => {
        setVendors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load vendors", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncVendors();
      fetchVendors();
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Failed to sync vendors from Saleor.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="bg-card border border-border-custom rounded-3xl p-8 md:p-12 mt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-xl text-accent">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif">Vendor Portals</h2>
            <p className="text-text-secondary text-sm">
              Access individual vendor dashboards to view their specific financial data.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> 
                {syncing ? "Syncing..." : "Sync Brands"}
            </button>
            <Link 
            href="/dashboard/register-vendor"
            className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
            <Users size={14} /> Register New
            </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-accent animate-spin">
          <Loader2 size={32} />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border-custom rounded-xl cursor-default">
          <p className="text-text-secondary font-medium">No vendors registered yet.</p>
          <p className="text-xs text-text-secondary mt-2 mb-6">
            Vendors are created automatically when an order is paid with a new Brand, or you can sync them now.
          </p>
          <div className="flex justify-center gap-4">
            <button 
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
                 <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> 
                 {syncing ? "Syncing..." : "Sync from Saleor"}
            </button>
            <Link 
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
            >
                Configure Defaults
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <Link
              key={vendor.brandAttributeValue}
              href={`/dashboard/vendor/${vendor.brandAttributeValue}`}
              className="flex justify-between items-center p-4 bg-background border border-border-custom rounded-xl hover:border-accent hover:shadow-md transition-all group"
            >
              <div>
                <h3 className="font-bold text-lg">{vendor.brandName}</h3>
                <span className="text-xs text-text-secondary bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
                  {vendor.commissionRate}% Fee
                </span>
              </div>
              <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

