
-- Criar tabela de perfis dos usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  withdrawal_pin TEXT,
  withdrawal_wallet_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de pacotes
CREATE TABLE public.packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activation_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  hash_payment TEXT,
  daily_yield DECIMAL(10,2) DEFAULT 0,
  total_yield DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de transações
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  wallet_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de indicações
CREATE TABLE public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  bonus_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de rendimentos diários
CREATE TABLE public.daily_yields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES packages ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  yield_amount DECIMAL(10,2) NOT NULL,
  yield_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_yields ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para packages
CREATE POLICY "Users can view own packages" ON public.packages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own packages" ON public.packages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own packages" ON public.packages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own packages" ON public.packages FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para referrals
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can insert referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Políticas RLS para daily_yields
CREATE POLICY "Users can view own yields" ON public.daily_yields FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert yields" ON public.daily_yields FOR INSERT WITH CHECK (true);

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para calcular rendimentos diários automaticamente
CREATE OR REPLACE FUNCTION public.calculate_daily_yields()
RETURNS void AS $$
DECLARE
  pkg RECORD;
  yield_amount DECIMAL(10,2);
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Para cada pacote ativo
  FOR pkg IN 
    SELECT * FROM packages 
    WHERE status = 'active' 
    AND activation_date IS NOT NULL
    AND activation_date::date <= current_date
    AND (completion_date IS NULL OR completion_date::date > current_date)
  LOOP
    -- Calcular rendimento de 10% ao dia
    yield_amount := pkg.amount * 0.10;
    
    -- Verificar se já existe rendimento para hoje
    IF NOT EXISTS (
      SELECT 1 FROM daily_yields 
      WHERE package_id = pkg.id 
      AND yield_date = current_date
    ) THEN
      -- Inserir rendimento diário
      INSERT INTO daily_yields (package_id, user_id, yield_amount, yield_date)
      VALUES (pkg.id, pkg.user_id, yield_amount, current_date);
      
      -- Atualizar totais no pacote
      UPDATE packages 
      SET 
        daily_yield = yield_amount,
        total_yield = total_yield + yield_amount
      WHERE id = pkg.id;
      
      -- Verificar se completou 20 dias
      IF (current_date - pkg.activation_date::date) >= 20 THEN
        UPDATE packages 
        SET 
          status = 'completed',
          completion_date = NOW()
        WHERE id = pkg.id;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar realtime para todas as tabelas
ALTER TABLE public.packages REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.referrals REPLICA IDENTITY FULL;
ALTER TABLE public.daily_yields REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.packages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_yields;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
