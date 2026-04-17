 "use client";

 import React from "react";
 import { Search, Building2, Filter, Tag } from "lucide-react";
 import type { Branch } from "@/types/branch";
 import ViewToggle, { type ViewMode } from "@/components/menu/ViewToggle";
 import type { DealStatus } from "@/types/deal";

 export type DealStatusFilter = DealStatus | "all";

 interface DealsToolbarProps {
   branches: Branch[];
   branchesLoading: boolean;
   filterBranchId: number | "all";
   onBranchChange: (v: number | "all") => void;
   statusFilter: DealStatusFilter;
   onStatusChange: (v: DealStatusFilter) => void;
   search: string;
   onSearchChange: (v: string) => void;
   view: ViewMode;
   onViewChange: (v: ViewMode) => void;
 }

 const pillBase =
   "px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border";

 const DealsToolbar: React.FC<DealsToolbarProps> = ({
   branches,
   branchesLoading,
   filterBranchId,
   onBranchChange,
   statusFilter,
   onStatusChange,
   search,
   onSearchChange,
   view,
   onViewChange,
 }) => (
   <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 space-y-4">
     {/* Row 1: filters */}
     <div className="flex flex-col lg:flex-row lg:items-end gap-4">
       {/* Branch filter */}
       <div className="flex-1 min-w-[180px] max-w-xs">
         <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
           <Building2 size={13} />
           Branch
         </label>
         <select
           className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
           value={filterBranchId}
           onChange={(e) => {
             const v = e.target.value;
             onBranchChange(v === "all" ? "all" : Number(v));
           }}
          disabled={branchesLoading || (branches.length === 1 && filterBranchId !== "all")}
         >
          {!(branches.length === 1 && filterBranchId !== "all") && <option value="all">All Branches</option>}
           {branches.map((b) => (
             <option key={b.branch_id} value={b.branch_id}>
               {b.branch_name}
             </option>
           ))}
         </select>
       </div>

       {/* Status filter */}
       <div className="flex-1 min-w-[180px] max-w-xs">
         <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
           <Filter size={13} />
           Status
         </label>
         <div className="inline-flex items-center gap-2">
           {(["active", "inactive", "all"] as DealStatusFilter[]).map((s) => {
             const isActive = statusFilter === s;
             let colors: string;
             if (isActive) {
               colors =
                 s === "active"
                   ? "bg-green-50 text-green-700 border-green-200"
                   : s === "inactive"
                   ? "bg-gray-100 text-gray-600 border-gray-200"
                   : "bg-[#ff5a1f]/10 text-[#ff5a1f] border-[#ff5a1f]/20";
             } else {
               colors = "bg-white text-gray-500 border-gray-200 hover:bg-gray-50";
             }
             return (
               <button
                 key={s}
                 onClick={() => onStatusChange(s)}
                 className={`${pillBase} ${colors}`}
               >
                 {s === "active" && "● "}
                 {s === "inactive" && "○ "}
                 {s.charAt(0).toUpperCase() + s.slice(1)}
               </button>
             );
           })}
         </div>
       </div>

       {/* Search */}
       <div className="flex-1 min-w-[220px] max-w-sm">
         <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
           <Search size={13} />
           Search
         </label>
         <div className="relative">
           <Search
             size={16}
             className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
           />
           <input
             type="text"
             className="w-full border border-gray-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
             placeholder="Search deals by name, type, items…"
             value={search}
             onChange={(e) => onSearchChange(e.target.value)}
           />
         </div>
       </div>
     </div>

     {/* Row 2: type label + view toggle */}
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
       <div className="flex items-center gap-2 text-xs text-gray-500">
         <Tag size={13} className="text-gray-400" />
         <span>Deals can be viewed as cards or table.</span>
       </div>
       <ViewToggle view={view} onChange={onViewChange} />
     </div>
   </div>
 );

 export default DealsToolbar;

