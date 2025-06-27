
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Gift, Wallet, Download } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

const DashboardStats = () => {
  const { stats, loading } = useUserStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* Rendimento Diário */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg text-green-800 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Rendimento Diário
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
            {stats.total_daily_yield.toFixed(2)} USDT
          </div>
          <p className="text-xs sm:text-sm text-green-700">
            Total acumulado de rendimentos
          </p>
        </CardContent>
      </Card>

      {/* Bônus de Indicação */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg text-blue-800 flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Bônus de Indicação
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
            {stats.total_referral_bonus.toFixed(2)} USDT
          </div>
          <div className="text-sm text-blue-700 mt-2">
            <span className="text-xs">Saldo disponível:</span>
            <div className="font-semibold text-lg">
              {stats.available_bonus_balance.toFixed(2)} USDT
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saques Totais */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg text-purple-800 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Saques Totais
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
            {stats.total_withdrawals.toFixed(2)} USDT
          </div>
          <p className="text-xs sm:text-sm text-purple-700">
            Total de saques realizados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
