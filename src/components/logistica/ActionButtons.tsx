
import { Button } from '@/components/ui/button';
import { Truck, Package, CheckCircle, X } from 'lucide-react';
import type { Comanda } from '@/types/comanda';

interface ActionButtonsProps {
  comanda: Comanda;
  onAlocaTransport: (comanda: Comanda) => void;
  onMarcheazaExpediat: (comanda: Comanda) => void;
  onMarcheazaLivrat: (comanda: Comanda) => void;
  onAnuleazaComanda: (comanda: Comanda) => void;
}

export function ActionButtons({
  comanda,
  onAlocaTransport,
  onMarcheazaExpediat,
  onMarcheazaLivrat,
  onAnuleazaComanda
}: ActionButtonsProps) {
  const currentStatus = comanda.status || 'in_asteptare';
  const isInAsteptare = currentStatus === 'in_asteptare';
  const isInProcesare = currentStatus === 'in_procesare';
  const isInTranzit = currentStatus === 'in_tranzit';
  const isLivrata = currentStatus === 'livrata';
  const isAnulata = currentStatus === 'anulata';

  if (isLivrata || isAnulata) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {isInAsteptare && (
        <>
          <Button
            variant="default"
            size="sm"
            className="h-8"
            onClick={() => onAlocaTransport(comanda)}
          >
            <Truck className="h-4 w-4 mr-2" />
            Alocă Transport
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => onAnuleazaComanda(comanda)}
          >
            <X className="h-4 w-4 mr-2" />
            Anulează
          </Button>
        </>
      )}
      {isInProcesare && (
        <>
          <Button
            variant="default"
            size="sm"
            className="h-8"
            onClick={() => onMarcheazaExpediat(comanda)}
          >
            <Package className="h-4 w-4 mr-2" />
            Marchează ca Expediat
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => onAnuleazaComanda(comanda)}
          >
            <X className="h-4 w-4 mr-2" />
            Anulează
          </Button>
        </>
      )}
      {isInTranzit && (
        <Button
          variant="default"
          size="sm"
          className="h-8"
          onClick={() => onMarcheazaLivrat(comanda)}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Marchează ca Livrat
        </Button>
      )}
    </div>
  );
}
