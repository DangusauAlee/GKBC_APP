import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string | null;
  author?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const useAnnouncement = (id: string) => {
  return useQuery({
    queryKey: ['announcement', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:profiles!created_by (
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Announcement;
    },
    enabled: !!id,
  });
};
EOFmkdir -p src/hooks
cat > src/hooks/useAnnouncement.ts << 'EOF'
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string | null;
  author?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const useAnnouncement = (id: string) => {
  return useQuery({
    queryKey: ['announcement', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:profiles!created_by (
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Announcement;
    },
    enabled: !!id,
  });
};
