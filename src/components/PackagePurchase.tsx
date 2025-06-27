
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface PackagePurchaseProps {
  onPurchase: (packageData: any) => void;
}

const PackagePurchase = ({ onPurchase }: PackagePurchaseProps) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount < 50 || numAmount > 1000) {
      toast({
        title: "Erro",
        description: "O valor deve estar entre 50 e 1000 USDT.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simular compra
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const packageData = {
      amount: numAmount,
      purchaseDate: new Date(),
      hash: '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    
    onPurchase(packageData);
    
    toast({
      title: "Pacote Adquirido!",
      description: `Pacote de ${numAmount} USDT adquirido com sucesso. Hash: ${packageData.hash}`,
    });
    
    setIsLoading(false);
    setAmount('');
  };

  const copyHash = () => {
    const hash = '0xSuaHashExemploAqui123456789';
    navigator.clipboard.writeText(hash);
    toast({
      title: "Hash Copiada!",
      description: "Hash da carteira copiada para a área de transferência.",
    });
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
            $
          </span>
          Comprar Pacote
        </CardTitle>
        <CardDescription>
          Escolha um valor entre 50 USDT e 1000 USDT (BEP20)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePurchase} className="space-y-4">
          <div>
            <Input
              type="number"
              min="50"
              max="1000"
              placeholder="Valor do pacote (USDT)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Rendimento estimado: {amount ? (parseFloat(amount) * 2).toFixed(2) : '0'} USDT em 21 dias
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Carteira para depósito (BSC/BEP20):</p>
            <div className="flex items-center space-x-2">
              <code className="bg-gray-200 px-2 py-1 rounded text-xs flex-1 break-all">
                0xSuaHashExemploAqui123456789
              </code>
              <Button 
                type="button" 
                onClick={copyHash}
                variant="outline" 
                size="sm"
              >
                Copiar
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Comprar Pacote'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PackagePurchase;
