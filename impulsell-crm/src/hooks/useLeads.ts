'use client';

// useLeads: hook que centraliza todo o estado da página de leads.
//
// CONSTITUTION III: backend é a fonte da verdade da busca/filtros.
// O frontend dispara refetch com debounce na busca e imediato nos filtros.
// SPEC FR-014: debounce de 300ms. SPEC FR-015: URL sincroniza com estado.

import { useCallback, useEffect, useReducer, useState } from 'react';
import { fetchLeads, contactLead } from '@/lib/api';
import type { Lead, LeadSource, LeadStatus } from '@/types/lead';

type SourceFilter = LeadSource | 'all';
type StatusFilter = LeadStatus | 'all';

interface UiState {
  loading: boolean;
  loadError: string | null;
  updatingId: string | null;
  contactError: { id: string; message: string } | null;
}

export interface LeadsState {
  leads: Lead[];
  searchQuery: string;
  sourceFilter: SourceFilter;
  statusFilter: StatusFilter;
  selectedLeadId: string | null;
  ui: UiState;
}

type Action =
  | { type: 'SET_LEADS'; payload: Lead[] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SOURCE'; payload: SourceFilter }
  | { type: 'SET_STATUS'; payload: StatusFilter }
  | { type: 'SELECT_LEAD'; payload: string | null }
  | { type: 'LOADING_START' }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'START_CONTACT'; payload: string }
  | { type: 'CONTACT_SUCCESS'; payload: Lead }
  | { type: 'CONTACT_ERROR'; payload: { id: string; message: string } }
  | { type: 'CLEAR_CONTACT_ERROR' };

const initialState: LeadsState = {
  leads: [],
  searchQuery: '',
  sourceFilter: 'all',
  statusFilter: 'all',
  selectedLeadId: null,
  ui: {
    loading: false,
    loadError: null,
    updatingId: null,
    contactError: null,
  },
};

function reducer(state: LeadsState, action: Action): LeadsState {
  switch (action.type) {
    case 'SET_LEADS':
      return {
        ...state,
        leads: action.payload,
        ui: { ...state.ui, loading: false, loadError: null },
      };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_SOURCE':
      return { ...state, sourceFilter: action.payload };
    case 'SET_STATUS':
      return { ...state, statusFilter: action.payload };
    case 'SELECT_LEAD':
      return { ...state, selectedLeadId: action.payload };
    case 'LOADING_START':
      return { ...state, ui: { ...state.ui, loading: true, loadError: null } };
    case 'LOAD_ERROR':
      return {
        ...state,
        ui: { ...state.ui, loading: false, loadError: action.payload },
      };
    case 'START_CONTACT':
      return {
        ...state,
        ui: { ...state.ui, updatingId: action.payload, contactError: null },
      };
    case 'CONTACT_SUCCESS': {
      const leads = state.leads.map((l) =>
        l.id === action.payload.id ? action.payload : l,
      );
      return {
        ...state,
        leads,
        ui: { ...state.ui, updatingId: null, contactError: null },
      };
    }
    case 'CONTACT_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          updatingId: null,
          contactError: action.payload,
        },
      };
    case 'CLEAR_CONTACT_ERROR':
      return { ...state, ui: { ...state.ui, contactError: null } };
    default:
      return state;
  }
}

function readInitialFilters(): Pick<LeadsState, 'searchQuery' | 'sourceFilter' | 'statusFilter'> {
  if (typeof window === 'undefined') {
    return {
      searchQuery: '',
      sourceFilter: 'all' as SourceFilter,
      statusFilter: 'all' as StatusFilter,
    };
  }
  const sp = new URLSearchParams(window.location.search);
  return {
    searchQuery: sp.get('q') ?? '',
    sourceFilter: (sp.get('source') as SourceFilter) || ('all' as SourceFilter),
    statusFilter: (sp.get('status') as StatusFilter) || ('all' as StatusFilter),
  };
}

/**
 * Hook principal: retorna state + dispatch + helpers para carregar e contatar leads.
 * Sincroniza filtros com a URL (query string) e aplica debounce na busca.
 */
export function useLeads() {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => ({
    ...init,
    ...readInitialFilters(),
  }));

  // Debounce do searchQuery: dispara refetch 300ms após a última tecla.
  const [debouncedSearch, setDebouncedSearch] = useState(state.searchQuery);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(state.searchQuery), 300);
    return () => clearTimeout(id);
  }, [state.searchQuery]);

  // Sincroniza URL ↔ state (escrita; leitura no init).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams();
    if (debouncedSearch) sp.set('q', debouncedSearch);
    if (state.sourceFilter !== 'all') sp.set('source', state.sourceFilter);
    if (state.statusFilter !== 'all') sp.set('status', state.statusFilter);
    const qs = sp.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [debouncedSearch, state.sourceFilter, state.statusFilter]);

  // Carrega leads quando os filtros "efetivos" mudam (debounced).
  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'LOADING_START' });
    fetchLeads({
      q: debouncedSearch,
      source: state.sourceFilter,
      status: state.statusFilter,
    })
      .then((leads) => {
        if (cancelled) return;
        dispatch({ type: 'SET_LEADS', payload: leads });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Erro ao carregar leads';
        dispatch({ type: 'LOAD_ERROR', payload: message });
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, state.sourceFilter, state.statusFilter]);

  const handleContact = useCallback(async (id: string) => {
    dispatch({ type: 'START_CONTACT', payload: id });
    try {
      const updated = await contactLead(id);
      dispatch({ type: 'CONTACT_SUCCESS', payload: updated });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Falha ao registrar contato';
      dispatch({ type: 'CONTACT_ERROR', payload: { id, message } });
    }
  }, []);

  const selectLead = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_LEAD', payload: id });
  }, []);

  const clearContactError = useCallback(() => {
    dispatch({ type: 'CLEAR_CONTACT_ERROR' });
  }, []);

  const setSearch = useCallback((value: string) => {
    dispatch({ type: 'SET_SEARCH', payload: value });
  }, []);

  const setSource = useCallback((value: SourceFilter) => {
    dispatch({ type: 'SET_SOURCE', payload: value });
  }, []);

  const setStatus = useCallback((value: StatusFilter) => {
    dispatch({ type: 'SET_STATUS', payload: value });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'SET_SEARCH', payload: '' });
    dispatch({ type: 'SET_SOURCE', payload: 'all' });
    dispatch({ type: 'SET_STATUS', payload: 'all' });
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const retryLoad = useCallback(() => {
    // limpa cache de "último carregado" via mudança de filtros: forçar reload
    if (typeof window !== 'undefined') window.location.reload();
  }, []);

  return {
    state,
    handleContact,
    selectLead,
    clearContactError,
    setSearch,
    setSource,
    setStatus,
    clearFilters,
    retryLoad,
  };
}