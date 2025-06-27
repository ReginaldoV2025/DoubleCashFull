
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white/80">
          <p className="text-sm mb-2">
            &copy; 2025 Double$Cash - Todos os direitos reservados
          </p>
          <p className="text-xs opacity-70">
            Plataforma de investimentos em USDT (BEP20) | Rendimentos em 21 dias
          </p>
          <div className="flex justify-center space-x-4 mt-4 text-xs">
            <span>Suporte 24/7</span>
            <span>•</span>
            <span>Transações Seguras</span>
            <span>•</span>
            <span>BSC Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
