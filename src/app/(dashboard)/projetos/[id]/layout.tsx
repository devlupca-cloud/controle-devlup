"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "", label: "Visão Geral" },
  { href: "/kanban", label: "Kanban" },
  { href: "/acessos", label: "Acessos" },
  { href: "/notas", label: "Notas" },
  { href: "/financeiro", label: "Financeiro" },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.id as string;
  const basePath = `/projetos/${projectId}`;

  return (
    <div>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => {
          const fullPath = `${basePath}${tab.href}`;
          const isActive = tab.href === ""
            ? pathname === basePath
            : pathname.startsWith(fullPath);

          return (
            <Link
              key={tab.href}
              href={fullPath}
              className={cn(
                "whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
