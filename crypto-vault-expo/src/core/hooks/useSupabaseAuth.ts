import { useEffect } from 'react';
import { useAppDispatch } from 'src/core/redux/hooks';
import { setSession, setLoading } from 'src/core/redux/slice/auth.slice';
import { getSupabaseClient, requireSupabaseClient, SupabaseAuthSession } from 'src/core/services/supabase/supabaseClient';

export const useSupabaseAuth = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      dispatch(setLoading(false));
      dispatch(setSession(null));
      return;
    }

    let mounted = true;
    dispatch(setLoading(true));
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        dispatch(setSession((data.session as SupabaseAuthSession) ?? null));
      })
      .finally(() => {
        if (mounted) dispatch(setLoading(false));
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession((session as SupabaseAuthSession) ?? null));
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [dispatch]);

  const signOut = async () => {
    const supabase = requireSupabaseClient();
    await supabase.auth.signOut();
    dispatch(setSession(null));
  };

  return { signOut };
};
