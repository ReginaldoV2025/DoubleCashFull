
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface AuthSectionProps {
  onLogin: (email: string) => void;
}

const AuthSection = ({ onLogin }: AuthSectionProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: "Erro",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simular requisição de login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onLogin(email);
    toast({
      title: "Sucesso!",
      description: "Login realizado com sucesso.",
    });
    
    setIsLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-800">Entrar ou Criar Conta</CardTitle>
        <CardDescription>
          Acesse sua conta para começar a investir
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar / Criar Conta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthSection;
