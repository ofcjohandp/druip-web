import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Database } from '@/types/database';

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];

export function useMySubscriptions() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['subscriptions', userId],
    queryFn: async (): Promise<SubscriptionRow[]> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('student_id', userId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}
