
import React, { useEffect, useState } from 'react';

const TradingBackground = () => {
  const [tradingData, setTradingData] = useState([
    { symbol: 'BTC/USDT', price: '43,250.00', change: '+2.34%', color: 'text-green-400' },
    { symbol: 'ETH/USDT', price: '2,580.50', change: '+1.87%', color: 'text-green-400' },
    { symbol: 'BNB/USDT', price: '315.20', change: '-0.45%', color: 'text-red-400' },
    { symbol: 'ADA/USDT', price: '0.3425', change: '+3.21%', color: 'text-green-400' },
    { symbol: 'SOL/USDT', price: '98.75', change: '+5.67%', color: 'text-green-400' },
    { symbol: 'XRP/USDT', price: '0.6234', change: '-1.23%', color: 'text-red-400' },
    { symbol: 'DOGE/USDT', price: '0.0842', change: '+4.56%', color: 'text-green-400' },
    { symbol: 'MATIC/USDT', price: '0.8765', change: '+2.89%', color: 'text-green-400' },
  ]);

  const [movingNumbers, setMovingNumbers] = useState<Array<{
    id: number;
    value: string;
    x: number;
    y: number;
    speed: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    // Atualizar preços periodicamente
    const priceInterval = setInterval(() => {
      setTradingData(prev => prev.map(item => {
        const changePercent = (Math.random() - 0.5) * 10;
        const newPrice = parseFloat(item.price.replace(',', '')) * (1 + changePercent / 100);
        return {
          ...item,
          price: newPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          change: `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
          color: changePercent > 0 ? 'text-green-400' : 'text-red-400'
        };
      }));
    }, 3000);

    // Criar números flutuantes
    const numbersInterval = setInterval(() => {
      const newNumber = {
        id: Date.now(),
        value: Math.random() > 0.5 ? `+${(Math.random() * 5).toFixed(2)}%` : `-${(Math.random() * 3).toFixed(2)}%`,
        x: Math.random() * 100,
        y: 100,
        speed: Math.random() * 2 + 1,
        opacity: 0.7
      };

      setMovingNumbers(prev => [...prev.slice(-10), newNumber]);
    }, 2000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(numbersInterval);
    };
  }, []);

  useEffect(() => {
    // Animar números flutuantes
    const animationInterval = setInterval(() => {
      setMovingNumbers(prev => 
        prev.map(num => ({
          ...num,
          y: num.y - num.speed,
          opacity: num.opacity - 0.01
        })).filter(num => num.y > -10 && num.opacity > 0)
      );
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid de linhas de trading */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-white/20"></div>
          ))}
        </div>
      </div>

      {/* Painéis de trading flutuantes */}
      {tradingData.map((item, index) => (
        <div
          key={item.symbol}
          className="absolute bg-black/20 backdrop-blur-sm rounded-lg p-3 text-white border border-white/10 animate-pulse"
          style={{
            left: `${10 + (index % 4) * 25}%`,
            top: `${15 + Math.floor(index / 4) * 35}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: '3s'
          }}
        >
          <div className="text-xs font-mono">
            <div className="text-white/80 text-[10px]">{item.symbol}</div>
            <div className="text-white font-bold text-sm">${item.price}</div>
            <div className={`${item.color} text-[10px]`}>{item.change}</div>
          </div>
        </div>
      ))}

      {/* Números flutuantes */}
      {movingNumbers.map(num => (
        <div
          key={num.id}
          className={`absolute text-xs font-mono transition-all duration-100 ${
            num.value.startsWith('+') ? 'text-green-400' : 'text-red-400'
          }`}
          style={{
            left: `${num.x}%`,
            top: `${num.y}%`,
            opacity: num.opacity
          }}
        >
          {num.value}
        </div>
      ))}

      {/* Linhas de gráfico animadas */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q50,60 100,80 T200,70 T300,90 T400,50 T500,75 T600,40 T700,65 T800,45 L800,128 L0,128 Z"
            fill="url(#gradient)"
            className="animate-pulse"
          />
          <path
            d="M0,100 Q50,60 100,80 T200,70 T300,90 T400,50 T500,75 T600,40 T700,65 T800,45"
            stroke="#10B981"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Efeito de particulas */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TradingBackground;
