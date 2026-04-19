/**
 * Minimal CSV read/write for catalog ↔ Google Sheets round-trip.
 * RFC4180-style quoted fields.
 */

import fs from "node:fs";
import path from "node:path";

export function readCatalogJson(filePath) {
  const raw = fs.readFileSync(path.resolve(filePath), "utf8");
  const data = JSON.parse(raw);
  if (!data || typeof data !== "object") {
    throw new Error("Catalog root must be an object");
  }
  if (!Array.isArray(data.services) || !Array.isArray(data.options)) {
    throw new Error('Catalog must have "services" and "options" arrays');
  }
  return data;
}

export function csvEscape(value) {
  if (value === null || value === undefined) {
    return "";
  }
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** @returns {string[][]} */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      field = "";
      if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
        rows.push(row);
      }
      row = [];
    } else if (c === "\r") {
      // ignore lone \r; \r\n handled on \n
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
    rows.push(row);
  }
  return rows;
}

/**
 * @param {string[][]} rows
 * @returns {Record<string, string>[]}
 */
export function rowsToObjects(rows) {
  if (!rows.length) {
    return [];
  }
  const headers = rows[0].map((h) => h.trim());
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const line = rows[r];
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) {
        continue;
      }
      obj[key] = line[c] !== undefined ? line[c] : "";
    }
    out.push(obj);
  }
  return out;
}

/**
 * @param {string[]} headers
 * @param {Record<string, unknown>[]} records
 */
export function stringifyCsv(headers, records) {
  const lines = [headers.map(csvEscape).join(",")];
  for (const rec of records) {
    lines.push(
      headers.map((h) => csvEscape(rec[h] ?? "")).join(",")
    );
  }
  return `\ufeff${lines.join("\n")}\n`;
}

export function pipeJoin(arr) {
  if (!Array.isArray(arr) || !arr.length) {
    return "";
  }
  return arr.map(String).join("|");
}

export function pipeSplit(s) {
  const t = String(s).trim();
  if (!t) {
    return undefined;
  }
  return t
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);
}
