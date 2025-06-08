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
        const response = await fetch(`/api/comenzi?userId=${user.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch comenzi: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Expected JSON but got: ${text}`);
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

  async function createComanda(
    comandaData: {
      distribuitor_id: string;
      oras_livrare: string;
      adresa_livrare?: string;
      judet_livrare?: string;
      telefon_livrare?: string;
      observatii?: string;
      numar_paleti?: number;
    },
    items: {
      produs_id: string;
      cantitate: number;
      pret_unitar: number;
    }[]
  ) {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/comenzi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user.id,
        comanda: comandaData,
        items: items
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create comanda: ${errorText}`);
    }

    const createdComanda = await response.json();
    return createdComanda;
  }

  return { comenzi, loading, createComanda };
}
