import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { setActiveTicket } from 'src/core/redux/slice/ticket.slice';
import * as TicketService from 'src/core/services/TicketService';
import type { TicketData } from 'src/core/redux/slice/ticket.type';

/**
 * Hook for the Ticket Detail screen.
 */
export function useTicketDetail(ticketId: string) {
  const dispatch = useAppDispatch();
  const activeTicket = useAppSelector(state => state.ticket.activeTicket);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!ticketId) return;
    setIsLoading(true);
    setError(null);
    try {
      const ticket = await TicketService.getTicketDetail(ticketId);
      dispatch(setActiveTicket(ticket));
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, dispatch]);

  useEffect(() => {
    fetchDetail();
    return () => {
      dispatch(setActiveTicket(null));
    };
  }, [fetchDetail, dispatch]);

  // Computed properties
  const isActive = activeTicket?.status === 'ACTIVE';
  const isTransferable = isActive && activeTicket?.is_transferable !== false;
  const isRefundable = isActive && activeTicket?.is_refundable !== false;
  const hasExpired = activeTicket?.expires_at ? new Date(activeTicket.expires_at) < new Date() : false;
  const isUpcoming = activeTicket?.start_time ? new Date(activeTicket.start_time) > new Date() : false;

  // Time until event
  const timeUntilEvent = activeTicket?.start_time
    ? Math.max(0, new Date(activeTicket.start_time).getTime() - Date.now())
    : 0;

  return {
    ticket: activeTicket,
    isLoading,
    error,
    isActive,
    isTransferable,
    isRefundable,
    hasExpired,
    isUpcoming,
    timeUntilEvent,
    refresh: fetchDetail,
  };
}
