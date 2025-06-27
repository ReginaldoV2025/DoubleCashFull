
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

const WithdrawalDataSection = () => {
  const [walletHash, setWalletHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const fetchWithdrawalData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('withdrawal_wallet_hash')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching withdrawal data:', error);
        return;
      }

      if (data?.withdrawal_wallet_hash) {
        setWalletHash(data.withdrawal_wallet_hash);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!walletHash.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe a hash da carteira.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          withdrawal_wallet_hash: walletHash.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao salvar dados: " + error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Dados para recebimento salvos com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center text-white">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-white">
        <Wallet className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Dados para Recebimento</h2>
      </div>

      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Carteira USDT BEP20</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="wallet">Hash da Carteira USDT (BEP20)</Label>
            <Input
              id="wallet"
              value={walletHash}
              onChange={(e) => setWalletHash(e.target.value)}
              placeholder="Digite a hash da sua carteira USDT BEP20"
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              Esta será a carteira utilizada para receber seus saques de bônus e rendimentos.
            </p>
          </div>

          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawalDataSection;
