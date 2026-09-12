export type CsvColumn<T> = {
  header: string;
  accessor: keyof T | ((row: T) => string | number | boolean | null | undefined);
};

export function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);
  // If string contains quotes, commas, or newlines, wrap in quotes and double internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function generateCsvString<T>(
  columns: CsvColumn<T>[],
  data: T[]
): string {
  const headerRow = columns.map((col) => formatCsvValue(col.header)).join(",");

  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const rawValue =
          typeof col.accessor === "function"
            ? col.accessor(row)
            : row[col.accessor];
        return formatCsvValue(rawValue);
      })
      .join(",")
  );

  return [headerRow, ...dataRows].join("\r\n");
}

export function downloadCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[]
): void {
  const csvContent = generateCsvString(columns, data);
  // Add UTF-8 BOM prefix for Excel compatibility
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
