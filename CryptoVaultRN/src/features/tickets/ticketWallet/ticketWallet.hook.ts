import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
  setTickets,
  setTicketsLoading,
  setTicketsError,
  setActiveFilter,
} from 'src/core/redux/slice/ticket.slice';
import * as TicketService from 'src/core/services/TicketService';
import type { TicketData } from 'src/core/redux/slice/ticket.type';

/**
 * Hook for the Ticket Wallet screen.
 * Handles fetching, filtering, and sorting of user's tickets.
 */
export function useTicketWallet() {
  const dispatch = useAppDispatch();
  const { tickets, ticketsLoading, ticketsError, activeFilter } = useAppSelector(
    (state) => state.ticket
  );
  const walletAddress = useAppSelector(
    (state) => state.account?.activeAccount?.address ?? ''
  );

  // Fetch tickets for the active wallet
  const fetchTickets = useCallback(async () => {
    if (!walletAddress) return;
    dispatch(setTicketsLoading(true));
    try {
      const data = await TicketService.fetchMyTickets(walletAddress);
      dispatch(setTickets(data));
    } catch (err: any) {
      dispatch(setTicketsError(err.message || 'Failed to fetch tickets'));
    }
  }, [walletAddress, dispatch]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filtered tickets based on active filter
  const filteredTickets = useMemo(() => {
    if (activeFilter === 'ALL') return tickets;
    return tickets.filter((t) => {
      switch (activeFilter) {
        case 'ACTIVE':
          return t.status === 'ACTIVE';
        case 'USED':
          return t.status === 'USED';
        case 'EXPIRED':
          return t.status === 'EXPIRED' || t.status === 'CANCELLED' || t.status === 'REFUNDED';
        default:
          return true;
      }
    });
  }, [tickets, activeFilter]);

  // Upcoming tickets (sorted by event start time, active only)
  const upcomingTickets = useMemo(() => {
    const now = new Date();
    return tickets
      .filter((t) => t.status === 'ACTIVE' && t.start_time && new Date(t.start_time) > now)
      .sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime());
  }, [tickets]);

  // Counts
  const counts = useMemo(() => ({
    total: tickets.length,
    active: tickets.filter(t => t.status === 'ACTIVE').length,
    used: tickets.filter(t => t.status === 'USED').length,
    expired: tickets.filter(t => ['EXPIRED', 'CANCELLED', 'REFUNDED'].includes(t.status)).length,
  }), [tickets]);

  const changeFilter = useCallback((filter: 'ALL' | 'ACTIVE' | 'USED' | 'EXPIRED') => {
    dispatch(setActiveFilter(filter));
  }, [dispatch]);

  return {
    tickets: filteredTickets,
    allTickets: tickets,
    upcomingTickets,
    isLoading: ticketsLoading,
    error: ticketsError,
    activeFilter,
    counts,
    changeFilter,
    refresh: fetchTickets,
  };
}
