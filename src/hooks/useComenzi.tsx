
import { useComenziData } from './comenzi/useComenziData';
import { useComandaCreate } from './comenzi/useComandaCreate';
import { useComandaDetails } from './comenzi/useComandaDetails';

export function useComenzi() {
  const { comenzi, loading, refreshComenzi } = useComenziData();
  const { createComanda } = useComandaCreate();
  const { getComandaById } = useComandaDetails();

  return {
    comenzi,
    loading,
    createComanda,
    refreshComenzi,
    getComandaById
  };
}
