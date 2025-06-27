
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthPageProps {
  onLogin: (email: string) => void;
  initialMode?: 'login' | 'register';
}

const AuthPage = ({ onLogin, initialMode = 'login' }: AuthPageProps) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Erro no login",
          description: error.message === 'Invalid login credentials' 
            ? "Email ou senha incorretos." 
            : "Erro ao fazer login. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso.",
      });
      
      onLogin(email);
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao fazer login.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !username) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name,
            username: username
          }
        }
      });

      if (error) {
        console.error('Register error:', error);
        if (error.message.includes('already registered')) {
          toast({
            title: "Erro",
            description: "Este email já está cadastrado. Tente fazer login.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message || "Erro ao criar conta. Tente novamente.",
            variant: "destructive"
          });
        }
        return;
      }

      if (data.user) {
        console.log('User registered successfully:', data.user.id);
        
        // Processar código de indicação se existir
        const referralCode = localStorage.getItem('referralCode');
        if (referralCode) {
          try {
            console.log('Processing referral code:', referralCode);
            
            // Tentar buscar o usuário que fez a indicação pelo username
            // Usando try/catch para lidar com possíveis erros de tipo
            try {
              const { data: referrer } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', referralCode)
                .single();

              if (referrer?.id) {
                console.log('Referrer found:', referrer.id);
                
                // Criar registro de indicação
                const { error: referralError } = await supabase
                  .from('referrals')
                  .insert({
                    referrer_id: referrer.id,
                    referred_id: data.user.id,
                    bonus_amount: 10
                  });

                if (referralError) {
                  console.error('Error creating referral:', referralError);
                } else {
                  console.log('Referral created successfully');
                  localStorage.removeItem('referralCode');
                }
              } else {
                console.log('Referrer not found for code:', referralCode);
              }
            } catch (profileError) {
              console.log('Error fetching referrer profile:', profileError);
            }
          } catch (referralError) {
            console.error('Error processing referral:', referralError);
          }
        }

        toast({
          title: "Sucesso!",
          description: "Conta criada com sucesso! Verifique seu email para confirmar.",
        });
        
        onLogin(email);
      }
    } catch (error: any) {
      console.error('Register error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar conta.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800">
            {mode === 'login' ? 'Login' : 'Criar Conta'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Nome de Usuário *</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu nome de usuário único"
                    required
                  />
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>
            
            {mode === 'register' && (
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  required
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
