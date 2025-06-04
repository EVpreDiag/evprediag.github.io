
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface TechnicianProfile {
  id: string;
  full_name: string | null;
  username: string | null;
}

export const useTechnicianNames = () => {
  const [technicianNames, setTechnicianNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicianNames = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, username');

        if (error) throw error;

        const nameMap: Record<string, string> = {};
        profiles?.forEach((profile: TechnicianProfile) => {
          nameMap[profile.id] = profile.full_name || profile.username || 'Unknown Technician';
        });

        setTechnicianNames(nameMap);
      } catch (error) {
        console.error('Error fetching technician names:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicianNames();
  }, []);

  const getTechnicianName = (technicianId: string): string => {
    return technicianNames[technicianId] || 'Unknown Technician';
  };

  return { technicianNames, getTechnicianName, loading };
};
