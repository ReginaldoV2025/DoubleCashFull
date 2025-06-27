
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  isLoggedIn: boolean;
  userEmail: string;
  onLogout: () => void;
  onProfileClick: () => void;
}

const Header = ({ isLoggedIn, userEmail, onLogout, onProfileClick }: HeaderProps) => {
  const [userProfile, setUserProfile] = useState<{
    name: string | null;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Tentar buscar o perfil, mas usar dados padrão em caso de erro
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Usar dados padrão
          setUserProfile({
            name: user.email?.split('@')[0] || '',
            avatar_url: null
          });
          return;
        }

        if (profile) {
          setUserProfile(profile);
        }
      } catch (profileError) {
        console.error('Profile fetch error:', profileError);
        // Usar dados padrão em caso de erro
        setUserProfile({
          name: user.email?.split('@')[0] || '',
          avatar_url: null
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4 sticky top-0 z-30">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Double$cash
          </h1>
        </div>
        
        {isLoggedIn && (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-white text-xs sm:text-sm hidden sm:block truncate max-w-32 sm:max-w-none">
              {userProfile?.name || userEmail}
            </span>
            
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              <AvatarImage src={userProfile?.avatar_url || ''} alt="Avatar" />
              <AvatarFallback className="bg-green-600 text-white text-xs sm:text-sm">
                {userProfile?.name?.charAt(0) || userEmail?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-green-600/20 hover:text-green-400 p-2"
              onClick={onProfileClick}
            >
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Perfil</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-600/20 hover:text-red-400 p-2"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
