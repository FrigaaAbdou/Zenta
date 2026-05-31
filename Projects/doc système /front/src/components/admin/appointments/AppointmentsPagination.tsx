import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppointmentsPagination({
  page,
  totalPages,
  total,
  pageSize,
  copy,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  copy: {
    page: string;
    previous: string;
    next: string;
    results: string;
  };
  onPageChange: (page: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        {copy.results} {start}-{end} / {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border-slate-200"
        >
          <ChevronLeft data-icon="inline-start" />
          {copy.previous}
        </Button>
        <span className="min-w-20 text-center text-sm font-medium text-slate-700">
          {copy.page} {page}/{totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border-slate-200"
        >
          {copy.next}
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
