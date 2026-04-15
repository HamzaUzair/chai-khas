 "use client";

 import React from "react";
 import { X } from "lucide-react";

 interface DeleteDealModalProps {
   isOpen: boolean;
   dealName: string | null;
   onCancel: () => void;
   onConfirm: () => void;
 }

 const DeleteDealModal: React.FC<DeleteDealModalProps> = ({
   isOpen,
   dealName,
   onCancel,
   onConfirm,
 }) => {
   if (!isOpen || !dealName) return null;

   return (
     <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
       <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
       <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10">
         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
           <h2 className="text-base font-bold text-gray-800">Delete Deal</h2>
           <button
             onClick={onCancel}
             className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
           >
             <X size={18} />
           </button>
         </div>

         <div className="px-6 py-5 space-y-3">
           <p className="text-sm text-gray-600">
             Are you sure you want to delete{" "}
             <strong className="text-gray-800">&quot;{dealName}&quot;</strong>? This
             will remove the deal from the Super Admin panel. You can recreate it
             later if needed.
           </p>
           <p className="text-xs text-gray-400">
             This action only affects the current UI state. Backend integration
             will be added later.
           </p>
         </div>

         <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
           <button
             type="button"
             onClick={onCancel}
             className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
           >
             Cancel
           </button>
           <button
             type="button"
             onClick={onConfirm}
             className="px-5 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 cursor-pointer shadow-sm"
           >
             Delete
           </button>
         </div>
       </div>
     </div>
   );
 };

 export default DeleteDealModal;

