/* ── Hall Management types ── */

export interface Hall {
  id: string;
  hallId: number;
  name: string;
  capacity: number;
  terminal: number;
  branchId: number;
  branchName: string;
  createdAt: number;
  updatedAt: number;
}

export interface HallFormData {
  name: string;
  capacity: string;   // string for form input
  terminal: string;    // string for form input
  branchId: number | "";
}
