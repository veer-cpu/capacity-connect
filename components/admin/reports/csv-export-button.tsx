"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, type CsvColumn } from "@/lib/utils/csv-export";

type CsvExportButtonProps<T> = {
  filename: string;
  columns: CsvColumn<T>[];
  data: T[];
  label?: string;
  disabled?: boolean;
};

export function CsvExportButton<T>({
  filename,
  columns,
  data,
  label = "Export CSV",
  disabled = false,
}: CsvExportButtonProps<T>) {
  const handleExport = () => {
    if (data.length === 0) return;
    downloadCsv(filename, columns, data);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || data.length === 0}
      className="flex items-center gap-2"
    >
      <Download className="size-4" />
      <span>{label}</span>
      {data.length > 0 && (
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
          {data.length}
        </span>
      )}
    </Button>
  );
}
