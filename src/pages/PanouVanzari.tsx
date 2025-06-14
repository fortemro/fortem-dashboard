
import { useProfile } from "@/hooks/useProfile";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { OrdersTableGeneral } from "@/components/panou-vanzari/OrdersTableGeneral";
import { usePanouVanzariData } from "@/hooks/usePanouVanzariData";

export default function PanouVanzari() {
  const { profile, loading } = useProfile();
  const [selectedAgent, setSelectedAgent] = useState<string>("toti");
  const { comenzi, agenti, isLoading } = usePanouVanzariData();

  // Filtrează comenzile pe baza agentului selectat
  const filteredComenzi = selectedAgent === "toti" 
    ? comenzi 
    : comenzi.filter(comanda => comanda.user_id === selectedAgent);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile || profile.rol !== 'management') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panou Vânzări (General)</h1>
        <p className="text-gray-600">Comenzile tuturor agenților de vânzări</p>
      </div>

      {/* Filtru pentru agent */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrare pe Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Agent MZV:</label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selectează agentul" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="toti">Toți agenții</SelectItem>
                {agenti.map((agent) => (
                  <SelectItem key={agent.user_id} value={agent.user_id}>
                    {agent.nume_complet || 'Agent necunoscut'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">
              ({filteredComenzi.length} comenzi afișate)
            </span>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <OrdersTableGeneral comenzi={filteredComenzi} />
      )}
    </div>
  );
}
