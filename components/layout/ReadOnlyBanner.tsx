"use client";

import React from "react";
import { Eye } from "lucide-react";

interface ReadOnlyBannerProps {
  /** What the user is currently viewing (e.g. "categories", "menu"). */
  module?: string;
}

/**
 * Notice shown at the top of operational pages when the signed-in
 * Restaurant Admin is running a multi-branch tenant. They can browse and
 * analyze data across branches but direct edits are delegated to the
 * assigned Branch Admin for each branch.
 */
const ReadOnlyBanner: React.FC<ReadOnlyBannerProps> = ({ module }) => (
  <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    <Eye size={18} className="mt-0.5 shrink-0 text-amber-600" />
    <div>
      <p className="font-semibold">Head-office view · read only</p>
      <p className="mt-0.5 text-amber-700">
        This multi-branch restaurant delegates {module ?? "operational"}{" "}
        edits to each branch&apos;s assigned Branch Admin. You can review,
        filter and compare data across branches here, but add / edit /
        delete actions are disabled.
      </p>
    </div>
  </div>
);

export default ReadOnlyBanner;
