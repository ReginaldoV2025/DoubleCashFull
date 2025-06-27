
import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Wallet,
  Lock,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isFinanceExpanded: boolean;
  onFinanceToggle: () => void;
}

const Sidebar = ({ activeSection, onSectionChange, isFinanceExpanded, onFinanceToggle }: SidebarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <nav className="space-y-2 p-4">
      <Button
        variant={activeSection === 'painel' ? 'default' : 'ghost'}
        className={`w-full justify-start text-sm sm:text-base ${
          activeSection === 'painel' 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'text-white hover:bg-green-600/20 hover:text-green-400'
        }`}
        onClick={() => handleSectionChange('painel')}
      >
        <Home className="mr-2 h-4 w-4" />
        Painel
      </Button>

      <Button
        variant={activeSection === 'comprar-pacote' ? 'default' : 'ghost'}
        className={`w-full justify-start text-sm sm:text-base ${
          activeSection === 'comprar-pacote' 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'text-white hover:bg-green-600/20 hover:text-green-400'
        }`}
        onClick={() => handleSectionChange('comprar-pacote')}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Comprar Pacote
      </Button>

      <Button
        variant={activeSection === 'meus-pacotes' ? 'default' : 'ghost'}
        className={`w-full justify-start text-sm sm:text-base ${
          activeSection === 'meus-pacotes' 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'text-white hover:bg-green-600/20 hover:text-green-400'
        }`}
        onClick={() => handleSectionChange('meus-pacotes')}
      >
        <Package className="mr-2 h-4 w-4" />
        Meus Pacotes
      </Button>

      <Button
        variant={activeSection === 'indicados' ? 'default' : 'ghost'}
        className={`w-full justify-start text-sm sm:text-base ${
          activeSection === 'indicados' 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'text-white hover:bg-green-600/20 hover:text-green-400'
        }`}
        onClick={() => handleSectionChange('indicados')}
      >
        <Users className="mr-2 h-4 w-4" />
        Indicados
      </Button>

      <div>
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-green-600/20 hover:text-green-400 text-sm sm:text-base"
          onClick={onFinanceToggle}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Financeiro
          {isFinanceExpanded ? (
            <ChevronDown className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4" />
          )}
        </Button>
        
        {isFinanceExpanded && (
          <div className="ml-6 mt-2 space-y-1">
            <Button
              variant={activeSection === 'extrato' ? 'default' : 'ghost'}
              className={`w-full justify-start text-xs sm:text-sm ${
                activeSection === 'extrato' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-white hover:bg-green-600/20 hover:text-green-400'
              }`}
              onClick={() => handleSectionChange('extrato')}
            >
              <FileText className="mr-2 h-3 w-3" />
              Extrato
            </Button>
            
            <Button
              variant={activeSection === 'rendimentos' ? 'default' : 'ghost'}
              className={`w-full justify-start text-xs sm:text-sm ${
                activeSection === 'rendimentos' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-white hover:bg-green-600/20 hover:text-green-400'
              }`}
              onClick={() => handleSectionChange('rendimentos')}
            >
              <TrendingUp className="mr-2 h-3 w-3" />
              Rendimentos
            </Button>

            <Button
              variant={activeSection === 'dados-recebimento' ? 'default' : 'ghost'}
              className={`w-full justify-start text-xs sm:text-sm ${
                activeSection === 'dados-recebimento' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-white hover:bg-green-600/20 hover:text-green-400'
              }`}
              onClick={() => handleSectionChange('dados-recebimento')}
            >
              <Wallet className="mr-2 h-3 w-3" />
              Dados para Recebimento
            </Button>

            <Button
              variant={activeSection === 'pin-saque' ? 'default' : 'ghost'}
              className={`w-full justify-start text-xs sm:text-sm ${
                activeSection === 'pin-saque' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-white hover:bg-green-600/20 hover:text-green-400'
              }`}
              onClick={() => handleSectionChange('pin-saque')}
            >
              <Lock className="mr-2 h-3 w-3" />
              Criar PIN Saque
            </Button>
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed top-0 left-0 h-full w-80 bg-black/90 backdrop-blur-md border-r border-white/20 z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="pt-20">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white/10 backdrop-blur-md border-r border-white/20 min-h-screen">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
