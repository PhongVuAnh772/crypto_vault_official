import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { setActiveQR, setQRLoading, clearQR } from 'src/core/redux/slice/ticket.slice';
import * as TicketService from 'src/core/services/TicketService';

/**
 * Hook for the Ticket QR screen.
 * Auto-refreshes the QR nonce every 30 seconds.
 */
export function useTicketQR(ticketId: string) {
  const dispatch = useAppDispatch();
  const { activeQR, qrLoading } = useAppSelector(state => state.ticket);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Generate QR
  const generateQR = useCallback(async () => {
    if (!ticketId) return;
    dispatch(setQRLoading(true));
    setError(null);
    try {
      const qrData = await TicketService.generateQR(ticketId);
      dispatch(setActiveQR(qrData));
      setCountdown(Math.floor(qrData.ttlMs / 1000));
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR');
      dispatch(setQRLoading(false));
    }
  }, [ticketId, dispatch]);

  // Refresh nonce
  const refreshNonce = useCallback(async () => {
    try {
      const qrData = await TicketService.refreshNonce(ticketId);
      dispatch(setActiveQR(qrData));
      setCountdown(Math.floor(qrData.ttlMs / 1000));
    } catch (err: any) {
      setError(err.message || 'Failed to refresh QR');
    }
  }, [ticketId, dispatch]);

  // Initial generation
  useEffect(() => {
    generateQR();
    return () => {
      dispatch(clearQR());
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [generateQR, dispatch]);

  // Auto-refresh timer
  useEffect(() => {
    if (!activeQR) return;

    // Countdown timer (every second)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // Refresh timer (at TTL interval)
    const ttlMs = activeQR.ttlMs || 30000;
    timerRef.current = setInterval(() => {
      refreshNonce();
    }, ttlMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [activeQR?.payload?.n, refreshNonce]);

  // Progress (0 to 1, where 1 = fresh)
  const progress = activeQR ? countdown / Math.floor((activeQR.ttlMs || 30000) / 1000) : 1;

  return {
    qrString: activeQR?.qrString || null,
    payload: activeQR?.payload || null,
    isLoading: qrLoading,
    error,
    countdown,
    progress,
    refresh: generateQR,
  };
}
