
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CountdownTimerProps {
  packageData: any;
}

const CountdownTimer = ({ packageData }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!packageData) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const purchaseTime = new Date(packageData.purchaseDate).getTime();
      const endTime = purchaseTime + (21 * 24 * 60 * 60 * 1000); // 21 dias
      const timeDiff = endTime - now;

      if (timeDiff <= 0) {
        setTimeLeft('Rendimento Liberado!');
        setIsExpired(true);
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
      setIsExpired(false);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [packageData]);

  if (!packageData) return null;

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-800">Contagem Regressiva do Pacote</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-lg mb-4">
          <p className="text-lg text-gray-700 mb-2">
            Pacote de <span className="font-bold text-blue-600">{packageData.amount} USDT</span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Rendimento esperado: <span className="font-bold text-green-600">{(packageData.amount * 2).toFixed(2)} USDT</span>
          </p>
          
          <div className={`text-3xl font-bold mb-2 ${isExpired ? 'text-green-600' : 'text-blue-600'}`}>
            {timeLeft}
          </div>
          
          {!isExpired && (
            <p className="text-gray-600">Rendimento disponível em:</p>
          )}
          
          {isExpired && (
            <p className="text-green-600 font-semibold">
              🎉 Parabéns! Seu rendimento está disponível para saque!
            </p>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          <p>Hash do pacote: {packageData.hash}</p>
          <p>Data da compra: {new Date(packageData.purchaseDate).toLocaleString('pt-BR')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownTimer;
