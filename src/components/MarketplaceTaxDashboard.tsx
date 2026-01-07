import React from "react";
import { prisma } from "@/lib/prisma";
import { Receipt, TrendingUp, Landmark, Globe, ShieldCheck, Download } from "lucide-react";

export async function MarketplaceTaxDashboard() {
  const commissions = await prisma.commission.findMany();
  
  const totalGross = commissions.reduce((acc: number, c: any) => acc + Number(c.orderGrossTotal || 0), 0);
  const totalCommNet = commissions.reduce((acc: number, c: any) => acc + Number(c.commissionNet || 0), 0);
  const totalCommVat = commissions.reduce((acc: number, c: any) => acc + Number(c.commissionVat || 0), 0);
  const ossGross = commissions.reduce((acc: number, c: any) => acc + (c.isOss ? Number(c.orderGrossTotal || 0) : 0), 0);

  const stats = [
    {
      label: "Gross GMV (Marketplace)",
      value: `€${totalGross.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/10",
      description: "Total sales volume processed"
    },
    {
      label: "Platform Revenue (Net)",
      value: `€${totalCommNet.toFixed(2)}`,
      icon: Landmark,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/10",
      description: "Net commission earned"
    },
    {
      label: "Commission VAT (NL Pay)",
      value: `€${totalCommVat.toFixed(2)}`,
      icon: Receipt,
      color: "text-terracotta",
      bgColor: "bg-terracotta/10",
      description: "VAT to remit to Belastingdienst"
    },
    {
      label: "OSS Reporting Volume",
      value: `€${ossGross.toFixed(2)}`,
      icon: Globe,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/10",
      description: "Sales subject to EU OSS filing"
    }
  ];

  const ossByCountry = commissions.reduce((acc: Record<string, number>, c: any) => {
    if (c.isOss && c.destinationCountry) {
      acc[c.destinationCountry] = (acc[c.destinationCountry] || 0) + Number(c.orderGrossTotal || 0);
    }
    return acc;
  }, {});

  const topOssCountries = Object.entries(ossByCountry)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 4);

  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });

  return (
    <div className="space-y-6 mb-12">
      <div className="flex justify-between items-center mb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Platform Fiscal Overview</h3>
          <div className="flex gap-2">
              <a 
                href="/api/export?type=oss" 
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors"
                download
              >
                <Download size={14} /> Export OSS CSV
              </a>
              <a 
                href="/api/export?type=commissions" 
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors"
                download
              >
                <Download size={14} /> Export Ledger
              </a>
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border-custom p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-110 transition-transform ${stat.bgColor}`}></div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary opacity-60">{stat.label}</span>
            </div>
            <div className="text-3xl font-extrabold mb-2 text-text-primary">{stat.value}</div>
            <p className="text-[10px] text-text-secondary font-extrabold uppercase tracking-widest opacity-40">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {topOssCountries.length > 0 && (
            <div className="xl:col-span-2 bg-card border border-border-custom rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-purple-600">
                <Globe size={18} />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Global OSS Exposure Breakdown</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {topOssCountries.map(([country, volume]) => (
                  <div key={country} className="flex flex-col">
                    <span className="text-2xl font-extrabold text-text-primary">€{(volume as number).toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">{country} Revenue</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border-custom rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-text-secondary">
                <ShieldCheck size={18} />
                <h3 className="text-[11px] font-bold uppercase tracking-widest">Legal Hub Information</h3>
              </div>
              <div className="space-y-4">
                  <div>
                      <div className="text-[9px] font-bold text-text-secondary/60 uppercase tracking-widest">Entity Name</div>
                      <div className="text-sm font-extrabold text-text-primary">{(settings as any)?.companyName || "Saleor Marketplace NL"}</div>
                  </div>
                  <div className="flex justify-between items-end">
                      <div>
                          <div className="text-[9px] font-bold text-text-secondary/60 uppercase tracking-widest">VAT Number</div>
                          <div className="text-xs font-mono font-bold text-accent">{(settings as any)?.vatNumber || "NL812345678B01"}</div>
                      </div>
                      <div className="text-right">
                          <div className="text-[9px] font-bold text-text-secondary/60 uppercase tracking-widest">OSS Status</div>
                          <div className="text-[10px] font-bold text-green-600 uppercase bg-green-500/10 px-2 py-0.5 rounded">Active Agent</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
