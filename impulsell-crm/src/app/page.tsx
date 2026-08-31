"use client"

import { Calendar, Filter, Sparkles, Users } from "lucide-react"

import { LeadTable } from "@/components/LeadTable"
import { SearchBar } from "@/components/SearchBar"
import { FilterBar } from "@/components/FilterBar"
import { LeadDetailModal } from "@/components/LeadDetailModal"
import { StatsRow } from "@/components/stats-row"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLeads } from "@/hooks/useLeads"

export default function HomePage() {
  const {
    state,
    handleContact,
    selectLead,
    clearContactError,
    setSearch,
    setSource,
    setStatus,
    clearFilters,
    retryLoad,
  } = useLeads()

  const selectedLead = state.selectedLeadId
    ? state.leads.find((l) => l.id === state.selectedLeadId) ?? null
    : null

  const hasFilters =
    state.searchQuery !== "" ||
    state.sourceFilter !== "all" ||
    state.statusFilter !== "all"

  const retryContact = (id: string) => {
    clearContactError()
    void handleContact(id)
  }

  return (
    <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
      {/* Hero header */}
      <section className="relative space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Sparkles className="size-3 text-brand" />
            Painel da atendente
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Calendar className="size-3" />
            Atualizado agora
          </span>
        </div>

        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Mini{" "}
          <span className="text-gradient">CRM</span>{" "}
          de Leads
        </h1>

        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Visualize, busque, filtre e registre contato nos leads de campanha
          da Impulsell. Tudo em um lugar só, sem complicação.
        </p>
      </section>

      {/* Stats */}
      <StatsRow
        leads={state.leads}
        loading={state.ui.loading && state.leads.length === 0}
        hasFilters={hasFilters}
      />

      {/* Filter + Search card */}
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-muted ring-1 ring-foreground/5">
            <Filter className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-sm font-semibold tracking-tight">
            Filtros e busca
          </h2>
          {hasFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={clearFilters}
              className="ml-auto text-muted-foreground"
            >
              Limpar tudo
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={state.searchQuery} onChange={setSearch} />
          <FilterBar
            sourceFilter={state.sourceFilter}
            statusFilter={state.statusFilter}
            onSourceChange={setSource}
            onStatusChange={setStatus}
          />
        </div>
      </Card>

      {/* Resultado */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-muted ring-1 ring-foreground/5">
              <Users className="size-3.5 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="font-heading text-sm font-semibold tracking-tight">
              Carteira de leads
            </h2>
            {!state.ui.loading && (
              <span className="text-xs text-muted-foreground tabular-nums">
                · {state.leads.length}{" "}
                {state.leads.length === 1 ? "resultado" : "resultados"}
              </span>
            )}
          </div>
        </div>

        <LeadTable
          leads={state.leads}
          loading={state.ui.loading}
          loadError={state.ui.loadError}
          hasFilters={hasFilters}
          updatingId={state.ui.updatingId}
          contactError={state.ui.contactError}
          onSelect={(id) => selectLead(id)}
          onContact={(id) => void handleContact(id)}
          onRetryLoad={retryLoad}
          onRetryContact={retryContact}
          onClearContactError={clearContactError}
          onClearFilters={clearFilters}
        />
      </section>

      <footer className="border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
        <p>
          Impulsell · Mini CRM de Leads · Construído com Next.js, shadcn/ui e
          muito café ☕
        </p>
      </footer>

      {/* Modal (controlled) */}
      <LeadDetailModal
        lead={selectedLead}
        open={state.selectedLeadId !== null}
        updating={state.ui.updatingId === state.selectedLeadId}
        contactError={
          state.ui.contactError?.id === state.selectedLeadId
            ? state.ui.contactError.message
            : null
        }
        onOpenChange={(open) => selectLead(open ? state.selectedLeadId : null)}
        onContact={() =>
          state.selectedLeadId && void handleContact(state.selectedLeadId)
        }
        onRetry={() => state.selectedLeadId && retryContact(state.selectedLeadId)}
        onClearError={clearContactError}
      />
    </main>
  )
}