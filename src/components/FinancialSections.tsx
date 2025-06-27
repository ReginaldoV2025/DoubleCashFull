
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FileText, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  wallet_hash: string;
  status: string;
  created_at: string;
}

interface ExtractProps {
  activeSection: string;
}

export const ExtractSection = ({ activeSection }: ExtractProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeSection === 'extrato') {
      fetchTransactions();
    }
  }, [activeSection]);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Concluído</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600">Falhou</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'bonus_withdrawal' || type === 'yield_withdrawal' 
      ? <ArrowUpRight className="h-4 w-4 text-red-500" />
      : <ArrowDownLeft className="h-4 w-4 text-green-500" />;
  };

  const getTransactionType = (type: string) => {
    switch (type) {
      case 'bonus_withdrawal':
        return 'Saque de Bônus';
      case 'yield_withdrawal':
        return 'Saque de Rendimento';
      default:
        return type;
    }
  };

  if (loading) {
    return <div className="text-center text-white">Carregando extrato...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-white">
        <FileText className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Extrato Financeiro</h2>
      </div>

      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma transação encontrada.</p>
              <p className="text-sm text-gray-500 mt-2">
                Suas transações aparecerão aqui quando realizadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-gray-800">
                        {getTransactionType(transaction.type)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Hash: {transaction.wallet_hash.slice(0, 10)}...
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-800">
                      {transaction.amount.toFixed(2)} USDT
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const YieldSection = () => {
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusWallet, setBonusWallet] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [yieldWallet, setYieldWallet] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBonusWithdrawal = async () => {
    const amount = parseFloat(bonusAmount);
    
    if (!bonusAmount || amount < 10) {
      toast({
        title: "Erro",
        description: "O valor mínimo para saque de bônus é 10 USDT.",
        variant: "destructive"
      });
      return;
    }

    if (amount > 500) {
      toast({
        title: "Erro",
        description: "O valor máximo para saque de bônus é 500 USDT.",
        variant: "destructive"
      });
      return;
    }

    if (!bonusWallet) {
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
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'bonus_withdrawal',
          amount: amount,
          wallet_hash: bonusWallet,
          status: 'pending'
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao processar saque: " + error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Saque Solicitado!",
        description: `Saque de ${amount} USDT em processamento.`,
      });

      setBonusAmount('');
      setBonusWallet('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar saque.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleYieldWithdrawal = async () => {
    const amount = parseFloat(yieldAmount);
    
    if (!yieldAmount || amount <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, informe um valor válido.",
        variant: "destructive"
      });
      return;
    }

    if (!yieldWallet) {
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
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'yield_withdrawal',
          amount: amount,
          wallet_hash: yieldWallet,
          status: 'pending'
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao processar saque: " + error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Saque Solicitado!",
        description: `Saque de ${amount} USDT em processamento.`,
      });

      setYieldAmount('');
      setYieldWallet('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar saque.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-white">
        <TrendingUp className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Saques</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Saque de Bônus */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Saque de Bônus</CardTitle>
            <p className="text-sm text-green-600">Liberado de 10 USDT até 500 USDT</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="number"
                placeholder="Valor do saque (10 - 500 USDT)"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                min="10"
                max="500"
              />
            </div>
            <div>
              <Input
                placeholder="Hash da carteira (BEP20)"
                value={bonusWallet}
                onChange={(e) => setBonusWallet(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleBonusWithdrawal}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processando...' : 'Sacar Bônus'}
            </Button>
          </CardContent>
        </Card>

        {/* Saque de Rendimento */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">Saque de Rendimento</CardTitle>
            <p className="text-sm text-blue-600">Disponível após 21 dias do pacote</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="number"
                placeholder="Valor do saque"
                value={yieldAmount}
                onChange={(e) => setYieldAmount(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Input
                placeholder="Hash da carteira (BEP20)"
                value={yieldWallet}
                onChange={(e) => setYieldWallet(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleYieldWithdrawal}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Processando..' : 'Sacar Rendimento'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
