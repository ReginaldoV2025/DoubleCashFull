import React, { useState, useEffect } from 'react';
import AuthPage from '../components/AuthPage';
import HomePage from '../components/HomePage';
import UserDashboard from '../components/UserDashboard';
import PackageSection from '../components/PackageSection';
import { ExtractSection, YieldSection } from '../components/FinancialSections';
import ReferralsSection from '../components/ReferralsSection';
import ProfileSection from '../components/ProfileSection';
import WithdrawalDataSection from '../components/WithdrawalDataSection';
import WithdrawalPinSection from '../components/WithdrawalPinSection';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import TradingBackground from '../components/TradingBackground';
import MyPackagesSection from '../components/MyPackagesSection';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeSection, setActiveSection] = useState('painel');
  const [userPackage, setUserPackage] = useState(null);
  const [isFinanceExpanded, setIsFinanceExpanded] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profileUpdated, setProfileUpdated] = useState(0); // Para forçar atualização do header

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || '');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || '');
        setShowAuth(false);
        // Forçar atualização do header quando login/logout acontece
        setProfileUpdated(prev => prev + 1);
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
      }
    });

    // Verificar se há parâmetro de referência na URL
    const checkReferralParam = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      
      if (referralCode) {
        // Armazenar código de referência no localStorage para usar no registro
        localStorage.setItem('referralCode', referralCode);
        console.log('Referral code detected and stored:', referralCode);
        
        // Mostrar tela de registro quando há código de indicação
        setAuthMode('register');
        setShowAuth(true);
        
        // Limpar parâmetro da URL sem recarregar a página
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };

    checkReferralParam();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setShowAuth(false);
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserEmail('');
    setActiveSection('painel');
    setShowAuth(false);
  };

  const handlePackagePurchase = (packageData: any) => {
    setUserPackage(packageData);
  };

  const handleProfileClick = () => {
    setActiveSection('perfil');
  };

  const handleProfileUpdate = () => {
    // Função para ser chamada quando o perfil for atualizado
    setProfileUpdated(prev => prev + 1);
  };

  const handleFinanceToggle = () => {
    setIsFinanceExpanded(!isFinanceExpanded);
  };

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuth(true);
  };

  const handleRegisterClick = () => {
    setAuthMode('register');
    setShowAuth(true);
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'painel':
        return <UserDashboard userEmail={userEmail} userPackage={userPackage} />;
      case 'comprar-pacote':
        return <PackageSection />;
      case 'meus-pacotes':
        return <MyPackagesSection />;
      case 'indicados':
        return <ReferralsSection />;
      case 'extrato':
        return <ExtractSection activeSection={activeSection} />;
      case 'rendimentos':
        return <YieldSection />;
      case 'dados-recebimento':
        return <WithdrawalDataSection />;
      case 'pin-saque':
        return <WithdrawalPinSection />;
      case 'perfil':
        return <ProfileSection onProfileUpdate={handleProfileUpdate} />;
      default:
        return <UserDashboard userEmail={userEmail} userPackage={userPackage} />;
    }
  };

  // Show auth page if user clicked login/register buttons  
  if (showAuth) {
    return <AuthPage onLogin={handleLogin} initialMode={authMode} />;
  }

  // Show home page if not logged in
  if (!isLoggedIn) {
    return (
      <HomePage 
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TradingBackground />
      <div className="relative z-10">
        <Header 
          key={profileUpdated} // Força re-render quando perfil é atualizado
          isLoggedIn={isLoggedIn}
          userEmail={userEmail} 
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
        />
        <div className="flex flex-col lg:flex-row">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            isFinanceExpanded={isFinanceExpanded}
            onFinanceToggle={handleFinanceToggle}
          />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 min-h-screen">
            {renderMainContent()}
          </main>
        </div>
        <Footer />
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
