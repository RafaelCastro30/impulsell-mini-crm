'use client';

import { useReducer, useEffect, useCallback } from 'react';
import { Lead, LeadSource, LeadStatus } from '@/lib/leads';
import { fetchLeads, contactLead as apiContactLead } from '@/lib/api';

interface LeadsState {
  leads: Lead[];
  searchQuery: string;
  sourceFilter: LeadSource | 'all';
  statusFilter: LeadStatus | 'all';
  selectedLead: Lead | null;
  ui: {
    loading: boolean;
    error: string | null;
    updatingId: string | null;
    contactError: string | null;
  };
}

type LeadsAction =
  | { type: 'SET_LEADS'; payload: Lead[] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SOURCE_FILTER'; payload: LeadSource | 'all' }
  | { type: 'SET_STATUS_FILTER'; payload: LeadStatus | 'all' }
  | { type: 'SELECT_LEAD'; payload: Lead | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_UPDATING'; payload: string | null }
  | { type: 'SET_CONTACT_ERROR'; payload: string | null }
  | { type: 'UPDATE_LEAD'; payload: Lead };

const initialState: LeadsState = {
  leads: [],
  searchQuery: '',
  sourceFilter: 'all',
  statusFilter: 'all',
  selectedLead: null,
  ui: {
    loading: false,
    error: null,
    updatingId: null,
    contactError: null,
  },
};

function leadsReducer(state: LeadsState, action: LeadsAction): LeadsState {
  switch (action.type) {
    case 'SET_LEADS':
      return { ...state, leads: action.payload, ui: { ...state.ui, loading: false, error: null } };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_SOURCE_FILTER':
      return { ...state, sourceFilter: action.payload };
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload };
    case 'SELECT_LEAD':
      return { ...state, selectedLead: action.payload };
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, loading: action.payload, error: action.payload ? null : state.ui.error } };
    case 'SET_ERROR':
      return { ...state, ui: { ...state.ui, loading: false, error: action.payload } };
    case 'SET_UPDATING':
      return { ...state, ui: { ...state.ui, updatingId: action.payload, contactError: null } };
    case 'SET_CONTACT_ERROR':
      return { ...state, ui: { ...state.ui, updatingId: null, contactError: action.payload } };
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(lead => (lead.id === action.payload.id ? action.payload : lead)),
        ui: { ...state.ui, updatingId: null },
      };
    default:
      return state;
  }
}

export function useLeads() {
  const [state, dispatch] = useReducer(leadsReducer, initialState);

  const loadLeads = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const leads = await fetchLeads({
        q: state.searchQuery,
        source: state.sourceFilter,
        status: state.statusFilter,
      });
      dispatch({ type: 'SET_LEADS', payload: leads });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }, [state.searchQuery, state.sourceFilter, state.statusFilter]);

  // Load leads when filters change
  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const setSearch = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  const setSourceFilter = (source: LeadSource | 'all') => {
    dispatch({ type: 'SET_SOURCE_FILTER', payload: source });
  };

  const setStatusFilter = (status: LeadStatus | 'all') => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: status });
  };

  const selectLead = (lead: Lead | null) => {
    dispatch({ type: 'SELECT_LEAD', payload: lead });
  };

  const contactLead = async (id: string) => {
    dispatch({ type: 'SET_UPDATING', payload: id });
    try {
      const updatedLead = await apiContactLead(id);
      dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
      // If the contacted lead was selected, update the modal too
      if (state.selectedLead?.id === id) {
        dispatch({ type: 'SELECT_LEAD', payload: updatedLead });
      }
    } catch (error) {
      dispatch({ type: 'SET_CONTACT_ERROR', payload: error instanceof Error ? error.message : 'Falha ao registrar contato' });
    }
  };

  const retry = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
    loadLeads();
  };

  return {
    ...state,
    loadLeads,
    setSearch,
    setSourceFilter,
    setStatusFilter,
    selectLead,
    contactLead,
    retry,
  };
}