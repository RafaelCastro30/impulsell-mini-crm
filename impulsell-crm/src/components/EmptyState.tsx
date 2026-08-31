"use client"

import { Inbox, SearchX, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  const Icon = hasFilters ? SearchX : Inbox;

  return (
    <Card className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted ring-1 ring-foreground/5">
        <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-base font-semibold tracking-tight">
          {hasFilters ? "Nenhum resultado" : "Carteira vazia"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "Nenhum lead encontrado para os filtros aplicados. Tente ajustar a busca ou os filtros."
            : "Quando novos leads chegarem, eles aparecerão aqui."}
        </p>
      </div>
      {hasFilters && onClearFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          <X className="mr-1.5 size-3.5" />
          Limpar filtros
        </Button>
      )}
    </Card>
  );
}