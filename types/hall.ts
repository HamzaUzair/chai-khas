/* ── Hall Management types ── */

export interface HallTable {
  id: string;
  tableId: number;
  name: string;
  capacity: number;
  status: string;
  terminal: number;
  createdAt: number;
  updatedAt: number;
}

export interface Hall {
  id: string;
  hallId: number;
  name: string;
  tableCount: number;
  totalCapacity: number;
  status: "active" | "inactive";
  capacity: number;
  terminal: number;
  branchId: number;
  branchName: string;
  tables: HallTable[];
  createdAt: number;
  updatedAt: number;
}

export interface HallTableFormData {
  id?: string;
  name: string;
  capacity: string;
  status: "Available" | "Occupied" | "Reserved";
}

export interface HallFormData {
  name: string;
  terminal: string;
  status: "active" | "inactive";
  branchId: number | "";
  tables: HallTableFormData[];
}
