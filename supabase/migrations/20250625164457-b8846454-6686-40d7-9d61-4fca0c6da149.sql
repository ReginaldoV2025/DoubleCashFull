
-- Criar tabela para rastrear transações blockchain
CREATE TABLE public.blockchain_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tx_hash TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  block_number BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela para bônus de indicação
CREATE TABLE public.referral_bonuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  bonus_amount DECIMAL(10,2) NOT NULL,
  package_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela para estatísticas do usuário
CREATE TABLE public.user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_daily_yield DECIMAL(10,2) DEFAULT 0,
  total_referral_bonus DECIMAL(10,2) DEFAULT 0,
  available_bonus_balance DECIMAL(10,2) DEFAULT 0,
  total_withdrawals DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para blockchain_transactions
CREATE POLICY "Users can view own transactions" ON public.blockchain_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert transactions" ON public.blockchain_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update transactions" ON public.blockchain_transactions FOR UPDATE USING (true);

-- Políticas RLS para referral_bonuses
CREATE POLICY "Users can view own bonuses" ON public.referral_bonuses FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "System can insert bonuses" ON public.referral_bonuses FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update bonuses" ON public.referral_bonuses FOR UPDATE USING (true);

-- Políticas RLS para user_stats
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert stats" ON public.user_stats FOR INSERT WITH CHECK (true);

-- Função para verificar pagamentos blockchain
CREATE OR REPLACE FUNCTION public.process_blockchain_payment(
  _tx_hash TEXT,
  _package_id UUID,
  _from_address TEXT,
  _amount DECIMAL,
  _block_number BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pkg_record RECORD;
  referral_record RECORD;
  bonus_amount DECIMAL(10,2);
BEGIN
  -- Buscar o pacote
  SELECT * INTO pkg_record FROM packages WHERE id = _package_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o valor está correto
  IF _amount < pkg_record.amount THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar transação blockchain
  INSERT INTO blockchain_transactions (
    package_id, user_id, tx_hash, amount, from_address, 
    to_address, block_number, status, confirmations, confirmed_at
  ) VALUES (
    _package_id, pkg_record.user_id, _tx_hash, _amount, _from_address,
    '0x950eca39A0B6FFCF8E5c1ae9E7116254408d0fA7', _block_number, 'confirmed', 1, NOW()
  )
  ON CONFLICT (tx_hash) DO UPDATE SET
    status = 'confirmed',
    confirmations = 1,
    confirmed_at = NOW();
  
  -- Ativar o pacote
  UPDATE packages 
  SET 
    status = 'active',
    activation_date = NOW()
  WHERE id = _package_id;
  
  -- Verificar se usuário tem indicador para dar bônus
  SELECT r.referrer_id INTO referral_record
  FROM referrals r 
  WHERE r.referred_id = pkg_record.user_id;
  
  IF FOUND THEN
    -- Calcular bônus de 10%
    bonus_amount := pkg_record.amount * 0.10;
    
    -- Inserir bônus de indicação
    INSERT INTO referral_bonuses (
      referrer_id, referred_id, package_id, bonus_amount, package_amount
    ) VALUES (
      referral_record.referrer_id, pkg_record.user_id, _package_id, bonus_amount, pkg_record.amount
    );
    
    -- Atualizar estatísticas do indicador
    INSERT INTO user_stats (user_id, total_referral_bonus, available_bonus_balance)
    VALUES (referral_record.referrer_id, bonus_amount, bonus_amount)
    ON CONFLICT (user_id) DO UPDATE SET
      total_referral_bonus = user_stats.total_referral_bonus + bonus_amount,
      available_bonus_balance = user_stats.available_bonus_balance + bonus_amount,
      updated_at = NOW();
  END IF;
  
  -- Inicializar estatísticas do usuário se não existir
  INSERT INTO user_stats (user_id)
  VALUES (pkg_record.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Atualizar função de rendimentos diários para incluir estatísticas
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
      
      -- Atualizar estatísticas do usuário
      INSERT INTO user_stats (user_id, total_daily_yield)
      VALUES (pkg.user_id, yield_amount)
      ON CONFLICT (user_id) DO UPDATE SET
        total_daily_yield = user_stats.total_daily_yield + yield_amount,
        updated_at = NOW();
      
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

-- Habilitar realtime para as novas tabelas
ALTER TABLE public.blockchain_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.referral_bonuses REPLICA IDENTITY FULL;
ALTER TABLE public.user_stats REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.blockchain_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_bonuses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;
