import React from "react";
import { prisma } from "@/lib/prisma";
import { Receipt, TrendingUp, Landmark, Globe, ShieldCheck } from "lucide-react";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border-custom p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-110 transition-transform ${stat.bgColor}`}></div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold mb-2">{stat.value}</div>
            <p className="text-[10px] text-text-secondary font-medium uppercase tracking-tighter">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {topOssCountries.length > 0 && (
            <div className="xl:col-span-2 bg-stone-50/50 dark:bg-stone-900/10 border border-border-custom rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4 text-purple-600">
                <Globe size={18} />
                <h3 className="text-[11px] font-bold uppercase tracking-widest">Global OSS Exposure Breakdown</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {topOssCountries.map(([country, volume]) => (
                  <div key={country} className="flex flex-col">
                    <span className="text-2xl font-bold">€{(volume as number).toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">{country} Revenue</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-stone-900/40 border border-border-custom rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4 text-stone-500">
                <ShieldCheck size={18} />
                <h3 className="text-[11px] font-bold uppercase tracking-widest">Legal Hub Information</h3>
              </div>
              <div className="space-y-3">
                  <div>
                      <div className="text-[9px] font-bold text-stone-400 uppercase">Entity Name</div>
                      <div className="text-sm font-bold">{(settings as any)?.companyName || "Saleor Marketplace NL"}</div>
                  </div>
                  <div className="flex justify-between">
                      <div>
                          <div className="text-[9px] font-bold text-stone-400 uppercase">VAT Number</div>
                          <div className="text-xs font-mono font-bold text-accent">{(settings as any)?.vatNumber || "NL812345678B01"}</div>
                      </div>
                      <div className="text-right">
                          <div className="text-[9px] font-bold text-stone-400 uppercase">OSS Status</div>
                          <div className="text-[10px] font-bold text-green-600 uppercase">Active Agent</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
