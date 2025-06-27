
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const WithdrawalPinSection = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('withdrawal_pin')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking PIN:', error);
        return;
      }

      setHasPin(!!data?.withdrawal_pin);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pin || !confirmPin) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      toast({
        title: "Erro",
        description: "O PIN deve conter exatamente 6 dígitos numéricos.",
        variant: "destructive"
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "Erro",
        description: "Os PINs não coincidem.",
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
          withdrawal_pin: pin,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao salvar PIN: " + error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: hasPin ? "PIN de saque atualizado com sucesso." : "PIN de saque criado com sucesso.",
      });

      setPin('');
      setConfirmPin('');
      setHasPin(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar PIN.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center text-white">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-white">
        <Lock className="h-6 w-6" />
        <h2 className="text-2xl font-bold">
          {hasPin ? 'Alterar PIN de Saque' : 'Criar PIN de Saque'}
        </h2>
      </div>

      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">
            {hasPin ? 'Alterar PIN de Saque' : 'Criar PIN de Saque'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPin && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Você já possui um PIN de saque configurado. Use este formulário para alterá-lo.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="pin">PIN de Saque (6 dígitos)</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Digite 6 dígitos numéricos"
              maxLength={6}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="confirmPin">Confirmar PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Confirme o PIN"
              maxLength={6}
              className="mt-2"
            />
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              ⚠️ Este PIN será necessário para confirmar todos os seus saques. Guarde-o em local seguro.
            </p>
          </div>

          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Salvando...' : hasPin ? 'Alterar PIN' : 'Criar PIN'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawalPinSection;
