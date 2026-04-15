 "use client";

 import React from "react";
 import {
   Pencil,
   Trash2,
   Building2,
   BadgePercent,
 } from "lucide-react";
 import type { Deal } from "@/types/deal";

 interface DealsTableProps {
   deals: Deal[];
   onEdit: (deal: Deal) => void;
   onDelete: (deal: Deal) => void;
 }

 const DealsTable: React.FC<DealsTableProps> = ({ deals, onEdit, onDelete }) => {
   if (deals.length === 0) {
     return (
       <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
         <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
           <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
             <BadgePercent size={28} className="text-gray-400" />
           </div>
           <p className="text-sm text-gray-500 max-w-xs">
             No deals found matching your filters.
           </p>
         </div>
       </div>
     );
   }

   return (
     <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
       <div className="overflow-x-auto">
         <table className="w-full text-sm min-w-[760px]">
           <thead>
             <tr className="bg-gray-50/80 border-b border-gray-100">
               {["Deal", "Type", "Branch", "Price", "Status", "Actions"].map(
                 (col) => (
                   <th
                     key={col}
                     className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                   >
                     {col}
                   </th>
                 )
               )}
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
             {deals.map((deal) => (
               <tr
                 key={deal.id}
                 className="hover:bg-gray-50/60 transition-colors"
               >
                 <td className="px-5 py-3.5">
                   <p className="font-semibold text-gray-800 truncate max-w-[220px]">
                     {deal.name}
                   </p>
                   {deal.description && (
                     <p className="text-[11px] text-gray-400 truncate max-w-[260px]">
                       {deal.description}
                     </p>
                   )}
                 </td>
                 <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600">
                   {deal.type}
                 </td>
                 <td className="px-5 py-3.5 whitespace-nowrap">
                   <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs">
                     <Building2 size={13} className="text-gray-400" />
                     {deal.branchName}
                   </span>
                 </td>
                 <td className="px-5 py-3.5 whitespace-nowrap">
                   <span className="font-semibold text-gray-800">
                     PKR {deal.price.toLocaleString()}
                   </span>
                 </td>
                 <td className="px-5 py-3.5 whitespace-nowrap">
                   <span
                     className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                       deal.status === "active"
                         ? "bg-green-50 text-green-600"
                         : "bg-gray-100 text-gray-500"
                     }`}
                   >
                     {deal.status === "active" ? "● Active" : "○ Inactive"}
                   </span>
                 </td>
                 <td className="px-5 py-3.5 whitespace-nowrap">
                   <div className="flex items-center gap-1.5">
                     <button
                       onClick={() => onEdit(deal)}
                       className="p-2 rounded-lg text-gray-400 hover:text-[#ff5a1f] hover:bg-orange-50 transition-colors cursor-pointer"
                       title="Edit"
                     >
                       <Pencil size={15} />
                     </button>
                     <button
                       onClick={() => onDelete(deal)}
                       className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                       title="Delete"
                     >
                       <Trash2 size={15} />
                     </button>
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>
   );
 };

 export default DealsTable;

