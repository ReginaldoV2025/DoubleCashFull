
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, DollarSign, Users, CheckCircle, Star } from 'lucide-react';

interface HomePageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const HomePage = ({ onLoginClick, onRegisterClick }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-blue-900/20" />
        
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Double$cash
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-green-400 mb-4">
              Dobre seus valores em USDT em 21 dias
            </p>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Trabalhamos com vários tipos de investimentos e rentabilidade no trade esportivo, 
              em várias casas regulamentadas e autorizadas
            </p>
          </div>

          {/* Investment Range */}
          <div className="mb-8 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-green-400 mb-2">Valores de Investimento</h3>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">Mínimo</p>
                <p className="text-xl font-bold text-white">50 USDT</p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Máximo</p>
                <p className="text-xl font-bold text-white">1.000 USDT</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={onRegisterClick}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
            >
              Cadastre-se Agora
            </Button>
            <Button
              onClick={onLoginClick}
              variant="outline"
              className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-3 text-lg font-semibold rounded-xl w-full sm:w-auto transition-all duration-200"
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-white">
            Por que escolher a Double$cash?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
                <CardTitle className="text-white">Rentabilidade Alta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">
                  Dobre seus investimentos em apenas 21 dias com nossa estratégia comprovada
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-blue-400" />
                </div>
                <CardTitle className="text-white">Casas Regulamentadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">
                  Operamos apenas em casas de apostas regulamentadas e autorizadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-purple-400" />
                </div>
                <CardTitle className="text-white">Investimento Flexível</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">
                  Comece com apenas 50 USDT e invista até 1.000 USDT
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Programa de Indicação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">
                  Ganhe 10% de bonificação por cada indicação direta que realizar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Referral Program Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-white">
            Programa de Bonificação
          </h2>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-600/20 rounded-full p-4">
                <Star className="h-12 w-12 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-400 mb-4">10% de Bonificação</h3>
            <p className="text-lg text-gray-300 mb-6">
              Ganhe 10% do valor investido por cada pessoa que usar seu link de indicação
            </p>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-gray-300">Saque mínimo: 10 USDT</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-gray-300">Saque máximo: 500 USDT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-white">
            Comece a investir hoje mesmo
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Junte-se a milhares de investidores que já estão dobrando seus valores conosco
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onRegisterClick}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
            >
              Criar Conta Grátis
            </Button>
            <Button
              onClick={onLoginClick}
              variant="outline"
              className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-3 text-lg font-semibold rounded-xl w-full sm:w-auto transition-all duration-200"
            >
              Já tenho conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
