import { useCallback, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
  clearOfflineQueue,
  setOfflineSyncing,
  removeFromOfflineQueue,
} from 'src/core/redux/slice/ticket.slice';
import * as TicketService from 'src/core/services/TicketService';

/**
 * Hook for offline scan synchronization.
 * Monitors network connectivity and syncs offline scans when back online.
 */
export function useOfflineSync() {
  const dispatch = useAppDispatch();
  const { offlineQueue, offlineSyncing } = useAppSelector(state => state.ticket);
  const isConnectedRef = useRef(true);

  // Monitor connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasDisconnected = !isConnectedRef.current;
      isConnectedRef.current = !!state.isConnected;

      // Came back online with pending scans
      if (wasDisconnected && state.isConnected && offlineQueue.length > 0) {
        syncOfflineScans();
      }
    });

    return () => unsubscribe();
  }, [offlineQueue.length]);

  // Sync offline scans
  const syncOfflineScans = useCallback(async () => {
    if (offlineQueue.length === 0 || offlineSyncing) return;

    dispatch(setOfflineSyncing(true));
    try {
      const result = await TicketService.submitOfflineBatch(offlineQueue);

      // Remove successfully synced entries
      result.results
        .filter(r => r.success)
        .forEach(r => {
          dispatch(removeFromOfflineQueue(r.ticketId));
        });

      // If all synced, clear the queue
      if (result.synced === result.total) {
        dispatch(clearOfflineQueue());
      }

      return result;
    } catch (err) {
      // Will retry on next connectivity change
      console.warn('[OFFLINE_SYNC] Sync failed, will retry:', err);
    } finally {
      dispatch(setOfflineSyncing(false));
    }
  }, [offlineQueue, offlineSyncing, dispatch]);

  return {
    offlineQueue,
    offlineCount: offlineQueue.length,
    isSyncing: offlineSyncing,
    syncNow: syncOfflineScans,
    isConnected: isConnectedRef.current,
  };
}
