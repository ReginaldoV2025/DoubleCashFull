
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Clock, TrendingUp, Package, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

interface PackageData {
  id: string;
  amount: number;
  status: string;
  purchase_date: string;
  activation_date: string | null;
  completion_date: string | null;
  daily_yield: number;
  total_yield: number;
  created_at: string;
}

interface DailyYield {
  yield_amount: number;
  yield_date: string;
}

const MyPackagesSection = () => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [dailyYields, setDailyYields] = useState<Record<string, DailyYield[]>>({});
  const [loading, setLoading] = useState(true);
  const [deletingPackage, setDeletingPackage] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
    fetchDailyYields();
    
    // Configurar atualizações em tempo real
    const packageChannel = supabase
      .channel('packages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'packages'
        },
        () => {
          console.log('Package updated, refreshing...');
          fetchPackages();
        }
      )
      .subscribe();

    const yieldsChannel = supabase
      .channel('yields_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_yields'
        },
        () => {
          console.log('Yields updated, refreshing...');
          fetchDailyYields();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(packageChannel);
      supabase.removeChannel(yieldsChannel);
    };
  }, []);

  const fetchPackages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching packages:', error);
        return;
      }

      console.log('Fetched packages:', data);
      setPackages(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyYields = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('daily_yields')
        .select('package_id, yield_amount, yield_date')
        .eq('user_id', user.id)
        .order('yield_date', { ascending: false });

      if (error) {
        console.error('Error fetching daily yields:', error);
        return;
      }

      // Agrupar rendimentos por package_id
      const groupedYields: Record<string, DailyYield[]> = {};
      data?.forEach(yieldData => {
        if (!groupedYields[yieldData.package_id]) {
          groupedYields[yieldData.package_id] = [];
        }
        groupedYields[yieldData.package_id].push({
          yield_amount: yieldData.yield_amount,
          yield_date: yieldData.yield_date
        });
      });

      setDailyYields(groupedYields);
    } catch (error) {
      console.error('Error fetching yields:', error);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    setDeletingPackage(packageId);
    
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir pacote: " + error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Pacote excluído com sucesso.",
      });

      fetchPackages();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir pacote.",
        variant: "destructive"
      });
    } finally {
      setDeletingPackage(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600 bg-yellow-50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
            <Clock className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return "Aguardando confirmação do pagamento...";
      case 'active':
        return "Pacote ativo e gerando rendimentos de 10% ao dia";
      case 'completed':
        return "Rendimento liberado para saque";
      default:
        return "Status não identificado";
    }
  };

  const calculateTimeRemaining = (activationDate: string) => {
    if (!activationDate) return null;
    
    const activation = new Date(activationDate);
    const completion = new Date(activation.getTime() + 20 * 24 * 60 * 60 * 1000); // 20 dias
    const now = new Date();
    const diff = completion.getTime() - now.getTime();
    
    if (diff <= 0) return "Liberado!";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p>Carregando pacotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-white">
        <Package className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Meus Pacotes</h2>
        <span className="text-sm bg-green-600 px-2 py-1 rounded-full">
          {packages.length} {packages.length === 1 ? 'pacote' : 'pacotes'}
        </span>
      </div>

      {packages.length === 0 ? (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum pacote encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Você ainda não possui pacotes de investimento.
            </p>
            <p className="text-sm text-gray-500">
              Adquira seu primeiro pacote para começar a investir e dobrar seus valores em 20 dias!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <span className="text-2xl mr-2">💰</span>
                      Pacote de {pkg.amount} USDT
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {getStatusDescription(pkg.status)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(pkg.status)}
                    {pkg.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePackage(pkg.id)}
                        disabled={deletingPackage === pkg.id}
                        className="text-xs"
                      >
                        {deletingPackage === pkg.id ? (
                          'Excluindo...'
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 block">Data da Compra:</span>
                    <div className="font-medium text-gray-800">
                      {formatDate(pkg.created_at || pkg.purchase_date)}
                    </div>
                  </div>
                  
                  {pkg.activation_date && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="text-blue-600 block">Data de Ativação:</span>
                      <div className="font-medium text-blue-800">
                        {formatDate(pkg.activation_date)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rendimento Diário */}
                {pkg.status === 'active' && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-yellow-800">📈 Rendimento Diário</h4>
                      <div className="text-lg font-bold text-yellow-600">
                        {(pkg.amount * 0.1).toFixed(2)} USDT/dia
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-yellow-600">Rendimento Hoje:</span>
                        <div className="font-bold text-yellow-800">
                          +{pkg.daily_yield?.toFixed(2) || '0.00'} USDT
                        </div>
                      </div>
                      <div>
                        <span className="text-yellow-600">Total Acumulado:</span>
                        <div className="font-bold text-yellow-800">
                          {pkg.total_yield?.toFixed(2) || '0.00'} USDT
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600">Rendimento Final (20 dias):</span>
                      <div className="text-2xl font-bold text-green-600">
                        {(pkg.amount * 2).toFixed(2)} USDT
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">Lucro:</span>
                      <div className="text-lg font-semibold text-green-600">
                        +{pkg.amount.toFixed(2)} USDT
                      </div>
                    </div>
                  </div>
                </div>

                {pkg.status === 'active' && pkg.activation_date && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-6 w-6 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium text-blue-800 mb-1">Tempo Restante:</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {calculateTimeRemaining(pkg.activation_date)}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Para liberação do rendimento (20 dias corridos)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {pkg.status === 'completed' && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-medium text-green-800">✅ Investimento Concluído!</div>
                        <div className="text-lg font-bold text-green-600">
                          Rendimento de {(pkg.amount * 2).toFixed(2)} USDT disponível
                        </div>
                        <div className="text-sm text-green-700 mt-1">
                          Você pode realizar o saque na seção "Saque de Rendimento"
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {pkg.status === 'pending' && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                      <div>
                        <div className="font-medium text-yellow-800">⏳ Aguardando Confirmação</div>
                        <div className="text-sm text-yellow-700 mt-1">
                          Seu pagamento está sendo processado. Após a confirmação, o pacote será ativado automaticamente.
                        </div>
                        <div className="text-xs text-yellow-600 mt-2">
                          Tempo médio de confirmação: 10-30 minutos
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>ID do Pacote: {pkg.id}</div>
                    <div>Status: {pkg.status}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPackagesSection;
