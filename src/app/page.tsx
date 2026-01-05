import React from "react";
import { Receipt, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <Zap size={14} />
            Marketplace Engine Active
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">
            Tax & Commission <br /> Control Center
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
            Your primary hub for managing Eurozone VAT compliance, vendor commissions, and automated invoicing logic for your Saleor marketplace.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            {
              title: "Automated Invoicing",
              desc: "Generating destination-based VAT receipts for customers and reverse-charge invoices for brands.",
              icon: <Receipt className="text-indigo-400" size={24} />,
            },
            {
              title: "Commission Logic",
              desc: "Real-time calculation of platform fees based on your configured marketplace rates.",
              icon: <BarChart3 className="text-emerald-400" size={24} />,
            },
            {
              title: "Compliance Shield",
              desc: "Ensuring all transactions align with EU One-Stop Shop (OSS) reporting requirements.",
              icon: <ShieldCheck className="text-amber-400" size={24} />,
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.05] transition-all group"
            >
              <div className="mb-4 p-3 rounded-xl bg-white/[0.05] w-fit group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        <section className="p-10 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready for Deployment</h2>
              <p className="text-gray-400 mb-6 max-w-md">
                All core systems are initialized. Push this repository to GitHub and connect it to Vercel to begin processing live orders.
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors">
                  View App Manifest
                </button>
                <button className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  Documentation
                </button>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-[#0e0e11] border border-white/5 shadow-2xl">
              <pre className="text-xs text-indigo-300 font-mono leading-relaxed">
                {`{
  "status": "ready",
  "webhooks": ["ORDER_FULLY_PAID"],
  "regions": ["Eurozone"],
  "engine": "Next.js 14",
  "orm": "Prisma 7"
}`}
              </pre>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 px-6 py-10 text-center text-gray-500 text-sm">
        &copy; 2026 Saleor Marketplace Tax System  Built with Antigravity
      </footer>
    </div>
  );
}

