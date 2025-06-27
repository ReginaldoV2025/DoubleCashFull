import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, AlertCircle, Package } from 'lucide-react';

const PAYMENT_HASH = "0x950eca39A0B6FFCF8E5c1ae9E7116254408d0fA7";

const AVAILABLE_PACKAGES = [
  { amount: 50, title: "Pacote Starter", description: "Ideal para iniciantes" },
  { amount: 100, title: "Pacote Basic", description: "Melhor custo benefício" },
  { amount: 250, title: "Pacote Silver", description: "Para investidores sérios" },
  { amount: 500, title: "Pacote Gold", description: "Alto rendimento" },
  { amount: 1000, title: "Pacote Diamond", description: "Máximo rendimento" }
];

const PackageSection = () => {
  const [loadingPackage, setLoadingPackage] = useState<number | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Hash copiada para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a hash.",
        variant: "destructive"
      });
    }
  };

  const handlePurchase = async (packageAmount: number) => {
    setLoadingPackage(packageAmount);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('packages')
        .insert({
          user_id: user.id,
          amount: packageAmount,
          status: 'pending'
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao criar pacote: " + error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Pacote Criado!",
        description: `Pacote de ${packageAmount} USDT criado. O sistema está monitorando automaticamente os pagamentos na blockchain. Faça o pagamento na hash fornecida e o pacote será ativado automaticamente quando confirmado.`,
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar pacote.",
        variant: "destructive"
      });
    } finally {
      setLoadingPackage(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-white">
        <Package className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Pacotes Disponíveis</h2>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800">🔗 Sistema Blockchain Automatizado:</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Escolha um dos pacotes disponíveis abaixo</li>
              <li>• Envie o pagamento para a hash fornecida (BEP20)</li>
              <li>• <strong>Ativação automática</strong> - O sistema monitora a blockchain em tempo real</li>
              <li>• Receba 10% ao dia por 20 dias corridos automaticamente</li>
              <li>• Dobre seu investimento em apenas 20 dias!</li>
              <li>• ⚡ <strong>Confirmação instantânea</strong> após confirmação na rede</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AVAILABLE_PACKAGES.map((pkg) => (
          <Card key={pkg.amount} className="bg-white/95 backdrop-blur-sm border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardHeader className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <CardTitle className="text-xl text-gray-800">{pkg.title}</CardTitle>
              <div className="text-2xl font-bold text-green-600">{pkg.amount} USDT</div>
              <p className="text-sm text-gray-600">{pkg.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-sm text-green-700">Retorno em 20 dias:</div>
                <div className="text-lg font-bold text-green-600">
                  {(pkg.amount * 2).toFixed(2)} USDT
                </div>
                <div className="text-xs text-green-600">
                  Lucro: +{pkg.amount.toFixed(2)} USDT
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-sm text-blue-700">Rendimento diário:</div>
                <div className="text-lg font-bold text-blue-600">
                  {(pkg.amount * 0.1).toFixed(2)} USDT
                </div>
                <div className="text-xs text-blue-600">10% ao dia</div>
              </div>

              <Button 
                onClick={() => handlePurchase(pkg.amount)}
                disabled={loadingPackage === pkg.amount}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                {loadingPackage === pkg.amount ? 'Criando...' : `Comprar ${pkg.amount} USDT`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">
            🔗 Hash de Pagamento Automático (BEP20)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono text-gray-800 break-all pr-2">
                {PAYMENT_HASH}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(PAYMENT_HASH)}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 mb-2">
              ⚡ <strong>SISTEMA AUTOMATIZADO:</strong>
            </p>
            <ul className="text-xs text-green-600 space-y-1">
              <li>• Monitoramento em tempo real da blockchain</li>
              <li>• Ativação automática após confirmação</li>
              <li>• Contagem regressiva de 20 dias inicia automaticamente</li>
              <li>• Rendimentos diários creditados automaticamente</li>
            </ul>
          </div>
          <p className="text-sm text-red-700 mt-2">
            ⚠️ <strong>IMPORTANTE:</strong> Envie apenas USDT via rede BEP20 para esta hash. 
            Outros tokens ou redes podem resultar em perda dos fundos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageSection;
