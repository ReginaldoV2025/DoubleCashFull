
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Copy, Users, DollarSign, RefreshCw } from 'lucide-react';

interface ReferralData {
  id: string;
  referred_id: string;
  bonus_amount: number;
  created_at: string;
  referred_profile?: {
    name: string | null;
    email: string | null;
    username: string | null;
  };
}

const ReferralsSection = () => {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [totalBonus, setTotalBonus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeReferralSystem();
  }, []);

  const initializeReferralSystem = async () => {
    await generateReferralLink();
    await fetchReferrals();
  };

  const generateReferralLink = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Generating referral link for user:', user.id);

      // Buscar ou criar perfil do usuário
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Se não existe perfil ou username, criar/atualizar
      if (!profile || !profile.username) {
        const tempUsername = `user_${user.id.slice(0, 8)}`;
        
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: tempUsername,
            email: user.email,
            updated_at: new Date().toISOString()
          });

        if (!upsertError) {
          profile = { username: tempUsername };
          console.log('Created username:', tempUsername);
        } else {
          console.error('Error creating profile:', upsertError);
        }
      }

      if (profile?.username) {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/?ref=${profile.username}`;
        setReferralLink(link);
        console.log('Generated referral link:', link);
      }
    } catch (error) {
      console.error('Error generating referral link:', error);
    }
  };

  const fetchReferrals = async () => {
    try {
      setRefreshing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Fetching referrals for user:', user.id);

      // Buscar indicações do usuário atual
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_id,
          bonus_amount,
          created_at
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        toast({
          title: "Erro",
          description: "Erro ao carregar indicações: " + referralsError.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Found referrals:', referralsData);

      if (!referralsData || referralsData.length === 0) {
        setReferrals([]);
        setTotalBonus(0);
        return;
      }

      // Buscar os perfis dos indicados
      const referredIds = referralsData.map(ref => ref.referred_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, username')
        .in('id', referredIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      console.log('Found profiles:', profilesData);

      // Combinar dados de referrals com perfis
      const referralsWithProfiles = referralsData.map(referral => {
        const profile = profilesData?.find(p => p.id === referral.referred_id);
        return {
          ...referral,
          referred_profile: profile || null
        };
      });

      console.log('Final referrals with profiles:', referralsWithProfiles);

      setReferrals(referralsWithProfiles);
      
      // Calcular total de bônus
      const total = referralsData.reduce((sum, ref) => sum + (ref.bonus_amount || 0), 0);
      setTotalBonus(total);

      toast({
        title: "Dados atualizados",
        description: `${referralsData.length} indicação(ões) carregada(s) com sucesso.`,
      });
    } catch (error) {
      console.error('Error in fetchReferrals:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar indicações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copiado!",
        description: "Link de indicação copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    fetchReferrals();
  };

  if (loading) {
    return <div className="text-center text-white">Carregando indicações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Meus Indicados</h2>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="text-white border-white hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Link de Indicação */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">Seu Link de Indicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="flex-1"
            />
            <Button
              onClick={copyReferralLink}
              variant="outline"
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-green-700">
            🎯 Compartilhe este link e ganhe 10 USDT por cada pessoa que se cadastrar através dele!
          </p>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{referrals.length}</div>
            <div className="text-sm text-gray-600">Indicados</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{totalBonus.toFixed(2)}</div>
            <div className="text-sm text-gray-600">USDT em Bônus</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Indicados */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Lista de Indicados</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Você ainda não possui indicados.</p>
              <p className="text-sm text-gray-500 mt-2">
                Compartilhe seu link de indicação para começar a ganhar bônus!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {referral.referred_profile?.name || 'Usuário'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {referral.referred_profile?.email || 'Email não disponível'}
                    </div>
                    <div className="text-sm text-blue-600">
                      @{referral.referred_profile?.username || 'username'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Indicado em: {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      +{referral.bonus_amount.toFixed(2)} USDT
                    </div>
                    <div className="text-xs text-gray-500">Bônus</div>
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

export default ReferralsSection;
