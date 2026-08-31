"use client"

import { AlertCircle, RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert
      variant="destructive"
      role="alert"
      className="border-destructive/40 bg-destructive/5"
    >
      <AlertCircle className="size-5" />
      <AlertTitle className="font-semibold">
        Erro ao carregar leads
      </AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm">{message}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-1.5 size-3.5" />
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}