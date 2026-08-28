'use client';

import { useEffect, useState } from 'react';
import { Lead } from '@/lib/leads';
import { useLeads } from '@/hooks/useLeads';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { LeadTable } from '@/components/LeadTable';
import { LeadDetailModal } from '@/components/LeadDetailModal';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';

export default function Home() {
  const {
    leads,
    searchQuery,
    sourceFilter,
    statusFilter,
    selectedLead,
    ui,
    setSearch,
    setSourceFilter,
    setStatusFilter,
    selectLead,
    contactLead,
    retry,
  } = useLeads();

  // Clear contact error when user interacts
  useEffect(() => {
    if (ui.contactError && (searchQuery || sourceFilter !== 'all' || statusFilter !== 'all')) {
      // Error will be cleared by SET_SEARCH/SET_SOURCE_FILTER/SET_STATUS_FILTER via useLeads
    }
  }, [searchQuery, sourceFilter, statusFilter, ui.contactError]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Mini CRM - Leads</h1>
            <div className="text-sm text-gray-500">
              {leads.length} lead{leads.length !== 1 ? 's' : ''} encontrado{leads.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <SearchBar value={searchQuery} onChange={setSearch} />
            <FilterBar
              sourceFilter={sourceFilter}
              statusFilter={statusFilter}
              onSourceChange={setSourceFilter}
              onStatusChange={setStatusFilter}
            />
          </div>
        </div>

        {/* Contact Error Toast */}
        {ui.contactError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 text-sm">{ui.contactError}</span>
            </div>
            <button
              onClick={() => selectLead(null)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dispensar
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Loading State */}
          {ui.loading && <LoadingState />}

          {/* Error State */}
          {ui.error && !ui.loading && (
            <ErrorState message={ui.error} onRetry={retry} />
          )}

          {/* Empty State */}
          {!ui.loading && !ui.error && leads.length === 0 && (
            <EmptyState />
          )}

          {/* Lead Table */}
          {!ui.loading && !ui.error && leads.length > 0 && (
            <LeadTable
              leads={leads}
              onViewDetails={selectLead}
              onContact={contactLead}
              updatingId={ui.updatingId}
            />
          )}
        </div>
      </main>

      {/* Lead Detail Modal */}
      <LeadDetailModal lead={selectedLead} onClose={() => selectLead(null)} />
    </div>
  );
}