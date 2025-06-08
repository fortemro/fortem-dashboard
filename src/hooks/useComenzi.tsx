import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Comanda {
  id: string;
  numar_comanda: string;
  distribuitor_id: string;
  data_comanda: string;
  oras_livrare: string;
  status: string;
  numar_paleti: number;
  adresa_livrare?: string;
  judet_livrare?: string;
  telefon_livrare?: string;
}

export function useComenzi() {
  const { user } = useAuth();
  const [comenzi, setComenzi] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setComenzi([]);
      setLoading(false);
      return;
    }

    async function fetchComenzi() {
      setLoading(true);
      try {
        // Replace with actual API call or data fetching logic
        // For example, fetch from /api/comenzi?userId=user.id
        const response = await fetch(`/api/comenzi?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch comenzi');
        }
        const data: Comanda[] = await response.json();
        setComenzi(data);
      } catch (error) {
        console.error('Error fetching comenzi:', error);
        setComenzi([]);
      } finally {
        setLoading(false);
      }
    }

    fetchComenzi();
  }, [user]);

  return { comenzi, loading };
}
