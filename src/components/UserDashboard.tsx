
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardStats from './DashboardStats';
import { useBlockchainMonitor } from '@/hooks/useBlockchainMonitor';

interface UserDashboardProps {
  userEmail: string;
  userPackage: any;
}

const UserDashboard = ({ userEmail, userPackage }: UserDashboardProps) => {
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusWallet, setBonusWallet] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [yieldWallet, setYieldWallet] = useState('');
  const [referralLink, setReferralLink] = useState('');

  // Inicializar monitoramento blockchain
  const { isMonitoring } = useBlockchainMonitor();

  useEffect(() => {
    generateReferralLink();
  }, []);

  const generateReferralLink = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (profile?.username) {
          const baseUrl = window.location.origin;
          setReferralLink(`${baseUrl}/?ref=${profile.username}`);
        }
      } catch (error) {
        console.error('Error generating referral link:', error);
      }
    } catch (error) {
      console.error('Error generating referral link:', error);
    }
  };

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link Copiado!",
        description: "Link de indicação copiado para a área de transferência.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Complete seu perfil com um nome de usuário para gerar o link.",
        variant: "destructive"
      });
    }
  };

  const handleBonusWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bonusAmount);
    
    if (!bonusAmount || amount < 10) {
      toast({
        title: "Erro",
        description: "Valor mínimo para saque de bônus é 10 USDT.",
        variant: "destructive"
      });
      return;
    }

    if (amount > 500) {
      toast({
        title: "Erro",
        description: "Valor máximo para saque de bônus é 500 USDT.",
        variant: "destructive"
      });
      return;
    }

    if (!bonusWallet) {
      toast({
        title: "Erro",
        description: "Por favor, insira o hash da carteira.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Registrar transação de saque
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'bonus_withdrawal',
          amount: amount,
          wallet_hash: bonusWallet,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Saque Solicitado!",
        description: `Saque de bônus de ${amount} USDT solicitado. Processamento em até 24h.`,
      });
      
      setBonusAmount('');
      setBonusWallet('');
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar saque.",
        variant: "destructive"
      });
    }
  };

  const handleYieldWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(yieldAmount);
    
    if (!yieldAmount || amount <= 0) {
      toast({
        title: "Erro",
        description: "Insira um valor válido para saque.",
        variant: "destructive"
      });
      return;
    }

    if (!yieldWallet) {
      toast({
        title: "Erro",
        description: "Por favor, insira o hash da carteira.",
        variant: "destructive"
      });
      return;
    }

    if (!userPackage) {
      toast({
        title: "Erro",
        description: "Você precisa ter um pacote ativo para sacar rendimentos.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Saque Solicitado!",
      description: `Saque de rendimento de ${amount} USDT solicitado. Processamento em até 24h.`,
    });
    
    setYieldAmount('');
    setYieldWallet('');
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Link de Indicação */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl text-gray-800">Seu Link de Indicação</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Compartilhe e ganhe bônus por cada indicação
            {isMonitoring && (
              <span className="ml-2 text-green-600 text-xs">
                🔗 Monitoramento blockchain ativo
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              readOnly
              value={referralLink || "Complete seu perfil para gerar o link"}
              className="flex-1 bg-gray-50 text-xs sm:text-sm"
            />
            <Button 
              onClick={copyReferralLink} 
              variant="outline"
              className="w-full sm:w-auto"
            >
              Copiar
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ganhe 10% do valor investido por cada pessoa que usar seu link
          </p>
        </CardContent>
      </Card>

      {/* Campos de Estatísticas */}
      <DashboardStats />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Saque de Bônus */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-xl">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg text-green-800">Saque de Bônus</CardTitle>
            <CardDescription className="text-green-600 text-xs sm:text-sm">
              Liberado de 10 USDT até 500 USDT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBonusWithdraw} className="space-y-3">
              <Input
                type="number"
                placeholder="Valor (10 - 500 USDT)"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                min="10"
                max="500"
                className="text-sm"
              />
              <Input
                placeholder="Hash da Carteira (BEP20)"
                value={bonusWallet}
                onChange={(e) => setBonusWallet(e.target.value)}
                className="text-sm"
              />
              <Button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
              >
                Sacar Bônus
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Saque de Rendimento */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-xl">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg text-blue-800">Saque de Rendimento</CardTitle>
            <CardDescription className="text-blue-600 text-xs sm:text-sm">
              Disponível após 21 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleYieldWithdraw} className="space-y-3">
              <Input
                type="number"
                placeholder="Valor"
                value={yieldAmount}
                onChange={(e) => setYieldAmount(e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Hash da Carteira (BEP20)"
                value={yieldWallet}
                onChange={(e) => setYieldWallet(e.target.value)}
                className="text-sm"
              />
              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
              >
                Sacar Rendimento
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
