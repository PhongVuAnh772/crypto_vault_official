import { useEffect } from 'react';
import { useAppDispatch } from 'src/core/redux/hooks';
import { setSession, setLoading } from 'src/core/redux/slice/auth.slice';
import { supabase } from 'src/core/services/supabase/supabaseClient';

export const useSupabaseAuth = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      dispatch(setLoading(true));
      const { data: { session } } = await supabase.auth.getSession();
      dispatch(setSession(session));
      if (session?.user) {
        syncUserProfile(session.user);
      }
      dispatch(setLoading(false));
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session));
      if (session?.user) {
        syncUserProfile(session.user);
      }
    });

    const syncUserProfile = async (user: any) => {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar: user.user_metadata?.avatar_url || '',
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.log('Failed to sync profile');
      }
    };

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { signOut };
};
