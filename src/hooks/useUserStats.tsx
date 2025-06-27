
import { useState, useEffect } from 'react';

interface UserStats {
  total_daily_yield: number;
  total_referral_bonus: number;
  available_bonus_balance: number;
  total_withdrawals: number;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>({
    total_daily_yield: 0,
    total_referral_bonus: 0,
    available_bonus_balance: 0,
    total_withdrawals: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Usar mock data por enquanto já que a tabela user_stats não existe nos tipos atuais
      const mockStats = {
        total_daily_yield: 0,
        total_referral_bonus: 0,
        available_bonus_balance: 0,
        total_withdrawals: 0
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Usar dados padrão em caso de erro
      setStats({
        total_daily_yield: 0,
        total_referral_bonus: 0,
        available_bonus_balance: 0,
        total_withdrawals: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};
