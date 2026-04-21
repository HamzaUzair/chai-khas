import React from "react";
import {
  BarChart3,
  ChefHat,
  Receipt,
  Layers,
  Users,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

/**
 * A stylised dashboard mockup rendered purely with HTML/SVG — no external assets.
 * Designed to look like the Restenzo admin panel in a crisp, premium way.
 */
const DashboardMockup: React.FC = () => {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      {/* Window chrome */}
      <div className="rounded-t-2xl border border-gray-200/80 dark:border-white/10 bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm px-4 py-3 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-[#ff5a5a]" />
        <span className="h-3 w-3 rounded-full bg-[#ffb13d]" />
        <span className="h-3 w-3 rounded-full bg-[#5ad872]" />
        <div className="ml-3 flex-1 flex justify-center">
          <div className="px-3 py-1 rounded-md bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 text-[11px] font-medium text-gray-500 dark:text-gray-400">
            app.restenzo.com/dashboard
          </div>
        </div>
      </div>

      {/* Dashboard body */}
      <div className="relative rounded-b-2xl border border-t-0 border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#0b1220] shadow-[0_40px_100px_-30px_rgba(15,23,42,0.35)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
        <div className="grid grid-cols-12 min-h-[380px] lg:min-h-[460px]">
          {/* Sidebar */}
          <aside className="hidden md:flex col-span-3 lg:col-span-2 flex-col gap-1 p-4 border-r border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-[#070b14]">
            <div className="flex items-center gap-2 px-2 py-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-brand" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Restenzo
              </span>
            </div>
            {[
              { label: "Dashboard", icon: BarChart3, active: true },
              { label: "Orders", icon: Receipt },
              { label: "Live Kitchen", icon: ChefHat },
              { label: "Menu", icon: Layers },
              { label: "Branches", icon: Users },
              { label: "Reports", icon: TrendingUp },
            ].map(({ label, icon: Icon, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium ${
                  active
                    ? "bg-[#ff5a1f]/10 text-[#ff5a1f]"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </aside>

          {/* Main */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10 p-5 lg:p-7">
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] font-semibold tracking-widest text-[#ff5a1f] uppercase">
                  Overview
                </p>
                <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">
                  Good morning, Sana
                </h3>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
                <div className="h-8 w-8 rounded-full bg-gradient-brand" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Today's sales", value: "$4,218", trend: "+12.4%" },
                { label: "Orders", value: "186", trend: "+8.1%" },
                { label: "Avg ticket", value: "$22.6", trend: "+3.2%" },
                { label: "Active branches", value: "6 / 8", trend: "" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0b1220] p-3.5"
                >
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="mt-1 text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                  {card.trend && (
                    <p className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-500">
                      <ArrowUpRight className="h-3 w-3" />
                      {card.trend}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Chart + list */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0b1220] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Revenue last 14 days
                  </p>
                  <span className="text-[11px] text-gray-500">USD</span>
                </div>
                {/* SVG chart */}
                <svg
                  viewBox="0 0 400 140"
                  className="w-full h-32"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff5a1f" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#ff5a1f" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 100 L30 82 L60 94 L90 70 L120 78 L150 55 L180 66 L210 40 L240 58 L270 30 L300 45 L330 20 L360 35 L400 18 L400 140 L0 140 Z"
                    fill="url(#area)"
                  />
                  <path
                    d="M0 100 L30 82 L60 94 L90 70 L120 78 L150 55 L180 66 L210 40 L240 58 L270 30 L300 45 L330 20 L360 35 L400 18"
                    fill="none"
                    stroke="#ff5a1f"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="lg:col-span-2 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0b1220] p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Live orders
                </p>
                <ul className="space-y-2.5">
                  {[
                    { id: "#2418", table: "Table 7", status: "Preparing" },
                    { id: "#2417", table: "Takeaway", status: "Ready" },
                    { id: "#2416", table: "Table 3", status: "Served" },
                  ].map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {o.id}
                        </p>
                        <p className="text-[11px] text-gray-500">{o.table}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          o.status === "Preparing"
                            ? "bg-amber-500/10 text-amber-600"
                            : o.status === "Ready"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {o.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating live-kitchen card */}
      <div
        className="hidden md:flex absolute -left-6 lg:-left-10 top-1/2 -translate-y-1/2 w-56 rounded-2xl bg-white dark:bg-[#0b1220] border border-gray-100 dark:border-white/10 shadow-xl p-4 flex-col gap-2 animate-float"
        style={{ animationDelay: "-2s" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center">
            <ChefHat className="h-4 w-4 text-[#ff5a1f]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              Live Kitchen
            </p>
            <p className="text-[11px] text-gray-500">Branch · Downtown</p>
          </div>
        </div>
        <p className="text-[11px] text-gray-500">
          <span className="font-semibold text-gray-900 dark:text-white">
            3 tickets
          </span>{" "}
          in queue · avg 6 min
        </p>
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-gradient-brand" />
        </div>
      </div>

      {/* Floating analytics card */}
      <div
        className="hidden md:flex absolute -right-4 lg:-right-8 -bottom-8 w-56 rounded-2xl bg-white dark:bg-[#0b1220] border border-gray-100 dark:border-white/10 shadow-xl p-4 flex-col gap-2 animate-float"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-900 dark:text-white">
            Weekly growth
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            +18.2%
          </span>
        </div>
        <div className="flex items-end gap-1 h-12">
          {[30, 50, 40, 65, 55, 80, 72].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-[#ff5a1f] to-[#ff8a3d]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardMockup;
