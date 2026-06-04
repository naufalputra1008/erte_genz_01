import * as XLSX from "xlsx";
import type { TransaksiKeuangan } from "./types";

export const MAX_IMPORT_ROWS = 500;
export const MAX_IMPORT_FILE_SIZE = 2 * 1024 * 1024;

export type KeuanganImportMode = "add" | "update";

const BASE_HEADER_MAP: Record<string, keyof KeuanganImportInput> = {
  jenis: "jenis",
  type: "jenis",
  tipe: "jenis",
  kategori: "kategori",
  category: "kategori",
  deskripsi: "deskripsi",
  description: "deskripsi",
  keterangan: "deskripsi",
  jumlah: "jumlah",
  amount: "jumlah",
  nominal: "jumlah",
  tanggal: "tanggal",
  date: "tanggal",
  tgl: "tanggal",
};

const UPDATE_HEADER_MAP: Record<string, "id"> = {
  id: "id",
  id_transaksi: "id",
};

export type KeuanganImportInput = {
  jenis: "pemasukan" | "pengeluaran";
  kategori: string;
  deskripsi: string;
  jumlah: number;
  tanggal: string;
};

export type KeuanganUpdateImportInput = KeuanganImportInput & { id: number };

export type KeuanganImportError = { row: number; message: string };

export type KeuanganImportParseResult = {
  rows: KeuanganImportInput[];
  errors: KeuanganImportError[];
};

export type KeuanganUpdateImportParseResult = {
  rows: KeuanganUpdateImportInput[];
  errors: KeuanganImportError[];
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function parseJenis(value: unknown): "pemasukan" | "pengeluaran" | null {
  const raw = String(value ?? "").trim().toLowerCase();
  if (["pemasukan", "masuk", "income", "in"].includes(raw)) return "pemasukan";
  if (["pengeluaran", "keluar", "expense", "out"].includes(raw)) return "pengeluaran";
  return null;
}

function parseJumlah(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const cleaned = raw.replace(/[Rp\s]/gi, "").replace(/\./g, "").replace(",", ".");
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num);
}

function parseTanggal(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const y = parsed.y;
      const m = String(parsed.m).padStart(2, "0");
      const d = String(parsed.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const dmy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

function parseId(value: unknown): number | null {
  const num = Number(String(value ?? "").trim());
  if (!Number.isFinite(num) || num <= 0 || !Number.isInteger(num)) return null;
  return num;
}

function mapBaseFields(
  mapped: Partial<Record<keyof KeuanganImportInput, unknown>>,
  rowNumber: number
): { data?: KeuanganImportInput; error?: KeuanganImportError } {
  const jenis = parseJenis(mapped.jenis);
  if (!jenis) {
    return { error: { row: rowNumber, message: "Jenis harus pemasukan atau pengeluaran" } };
  }

  const kategori = String(mapped.kategori ?? "").trim();
  if (!kategori) {
    return { error: { row: rowNumber, message: "Kategori wajib diisi" } };
  }

  const deskripsi = String(mapped.deskripsi ?? "").trim();
  if (!deskripsi) {
    return { error: { row: rowNumber, message: "Deskripsi wajib diisi" } };
  }

  const jumlah = parseJumlah(mapped.jumlah);
  if (jumlah == null) {
    return { error: { row: rowNumber, message: "Jumlah tidak valid" } };
  }

  const tanggal = parseTanggal(mapped.tanggal);
  if (!tanggal) {
    return { error: { row: rowNumber, message: "Tanggal tidak valid (gunakan YYYY-MM-DD)" } };
  }

  return { data: { jenis, kategori, deskripsi, jumlah, tanggal } };
}

function mapRecordToFields(record: Record<string, unknown>) {
  const mapped: Partial<Record<keyof KeuanganImportInput, unknown>> = {};
  let id: number | null = null;

  for (const [key, value] of Object.entries(record)) {
    const normalized = normalizeHeader(key);
    const idField = UPDATE_HEADER_MAP[normalized];
    if (idField) {
      id = parseId(value);
      continue;
    }
    const field = BASE_HEADER_MAP[normalized];
    if (field) mapped[field] = value;
  }

  return { mapped, id };
}

function readSpreadsheetRecords(buffer: Buffer, filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!["csv", "xlsx", "xls"].includes(ext)) {
    return {
      error: { row: 0, message: "Format file harus .csv, .xlsx, atau .xls" } as KeuanganImportError,
      records: null as Record<string, unknown>[] | null,
    };
  }

  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      error: { row: 0, message: "File tidak memiliki sheet data" } as KeuanganImportError,
      records: null,
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  if (records.length === 0) {
    return {
      error: { row: 0, message: "Tidak ada baris data" } as KeuanganImportError,
      records: null,
    };
  }

  if (records.length > MAX_IMPORT_ROWS) {
    return {
      error: {
        row: 0,
        message: `Maksimal ${MAX_IMPORT_ROWS} baris per import`,
      } as KeuanganImportError,
      records: null,
    };
  }

  return { error: null, records };
}

export function parseKeuanganSpreadsheet(
  buffer: Buffer,
  filename: string
): KeuanganImportParseResult {
  const { error, records } = readSpreadsheetRecords(buffer, filename);
  if (error || !records) {
    return { rows: [], errors: error ? [error] : [] };
  }

  const rows: KeuanganImportInput[] = [];
  const errors: KeuanganImportError[] = [];

  records.forEach((record, index) => {
    const isEmpty = Object.values(record).every((v) => String(v ?? "").trim() === "");
    if (isEmpty) return;

    const rowNumber = index + 2;
    const { mapped } = mapRecordToFields(record);
    const result = mapBaseFields(mapped, rowNumber);
    if (result.error) errors.push(result.error);
    else if (result.data) rows.push(result.data);
  });

  return { rows, errors };
}

export function parseKeuanganUpdateSpreadsheet(
  buffer: Buffer,
  filename: string
): KeuanganUpdateImportParseResult {
  const { error, records } = readSpreadsheetRecords(buffer, filename);
  if (error || !records) {
    return { rows: [], errors: error ? [error] : [] };
  }

  const rows: KeuanganUpdateImportInput[] = [];
  const errors: KeuanganImportError[] = [];

  records.forEach((record, index) => {
    const isEmpty = Object.values(record).every((v) => String(v ?? "").trim() === "");
    if (isEmpty) return;

    const rowNumber = index + 2;
    const { mapped, id } = mapRecordToFields(record);

    if (id == null) {
      errors.push({ row: rowNumber, message: "ID transaksi wajib diisi dan harus angka valid" });
      return;
    }

    const result = mapBaseFields(mapped, rowNumber);
    if (result.error) errors.push(result.error);
    else if (result.data) rows.push({ id, ...result.data });
  });

  return { rows, errors };
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildKeuanganExportCsv(transaksi: TransaksiKeuangan[]): string {
  const header = ["id", "jenis", "kategori", "deskripsi", "jumlah", "tanggal"];
  const lines = [
    header.join(","),
    ...transaksi.map((t) =>
      [
        t.id,
        t.jenis,
        csvEscape(t.kategori),
        csvEscape(t.deskripsi),
        t.jumlah,
        t.tanggal,
      ].join(",")
    ),
  ];
  return lines.join("\n");
}

export const KEUANGAN_IMPORT_TEMPLATE = [
  ["jenis", "kategori", "deskripsi", "jumlah", "tanggal"],
  ["pemasukan", "Iuran Warga", "Iuran bulan Mei 2026", "150000", "2026-05-01"],
  ["pengeluaran", "Operasional", "Pembelian ATK RT", "75000", "2026-05-10"],
]
  .map((row) => row.join(","))
  .join("\n");

export const KEUANGAN_UPDATE_IMPORT_TEMPLATE = [
  ["id", "jenis", "kategori", "deskripsi", "jumlah", "tanggal"],
  ["1", "pemasukan", "Iuran Warga", "Iuran bulan Mei 2026", "150000", "2026-05-01"],
  ["2", "pengeluaran", "Operasional", "Pembelian ATK RT", "75000", "2026-05-10"],
]
  .map((row) => row.join(","))
  .join("\n");
