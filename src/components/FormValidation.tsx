
import { useToast } from '@/hooks/use-toast';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

export function useFormValidation() {
  const { toast } = useToast();

  const validateForm = (data: any, items: ItemComanda[]) => {
    // Validare distribuitor
    if (!data.distribuitor_id) {
      toast({
        title: "Eroare",
        description: "Selectarea unui distribuitor este obligatorie",
        variant: "destructive"
      });
      return false;
    }

    // Validări de bază pentru livrare
    if (!data.oras_livrare || !data.adresa_livrare) {
      toast({
        title: "Eroare",
        description: "Orașul și adresa de livrare sunt obligatorii",
        variant: "destructive"
      });
      return false;
    }

    if (items.length === 0) {
      toast({
        title: "Eroare",
        description: "Adaugă cel puțin un produs în comandă",
        variant: "destructive"
      });
      return false;
    }

    // Verifică că toate itemii au produs selectat
    const itemsWithoutProduct = items.filter(item => !item.produs_id);
    if (itemsWithoutProduct.length > 0) {
      toast({
        title: "Eroare",
        description: "Toate produsele trebuie să fie selectate",
        variant: "destructive"
      });
      return false;
    }

    // Verifică că toate itemii au cantitate în paleti
    const itemsWithoutQuantity = items.filter(item => !item.cantitate || item.cantitate <= 0);
    if (itemsWithoutQuantity.length > 0) {
      toast({
        title: "Eroare",
        description: "Toate produsele trebuie să aibă o cantitate validă în paleti (minimum 1 palet)",
        variant: "destructive"
      });
      return false;
    }

    // Verifică că cantitățile sunt numere întregi (nu se pot comanda fracții de paleti)
    const itemsWithFractionalQuantity = items.filter(item => !Number.isInteger(item.cantitate));
    if (itemsWithFractionalQuantity.length > 0) {
      toast({
        title: "Eroare",
        description: "Cantitățile trebuie să fie numere întregi de paleti",
        variant: "destructive"
      });
      return false;
    }

    // Verifică că toate itemii au preț manual introdus per palet
    const itemsWithoutPrice = items.filter(item => !item.pret_unitar || item.pret_unitar <= 0);
    if (itemsWithoutPrice.length > 0) {
      toast({
        title: "Eroare",
        description: "Toate produsele trebuie să aibă un preț de vânzare manual introdus per palet",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return { validateForm };
}
