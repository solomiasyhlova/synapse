import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Path the pagination links point at, e.g. "/items/snippets" or "/collections/abc123". */
  basePath: string;
}

function pageHref(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      {currentPage > 1 ? (
        <Button
          render={<Link href={pageHref(basePath, currentPage - 1)} aria-label="Previous page" />}
          nativeButton={false}
          variant="outline"
          size="icon"
        >
          <ChevronLeft />
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="Previous page">
          <ChevronLeft />
        </Button>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          render={<Link href={pageHref(basePath, page)} aria-label={`Page ${page}`} />}
          nativeButton={false}
          variant={page === currentPage ? "default" : "outline"}
          size="icon"
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Button>
      ))}

      {currentPage < totalPages ? (
        <Button
          render={<Link href={pageHref(basePath, currentPage + 1)} aria-label="Next page" />}
          nativeButton={false}
          variant="outline"
          size="icon"
        >
          <ChevronRight />
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="Next page">
          <ChevronRight />
        </Button>
      )}
    </nav>
  );
}
