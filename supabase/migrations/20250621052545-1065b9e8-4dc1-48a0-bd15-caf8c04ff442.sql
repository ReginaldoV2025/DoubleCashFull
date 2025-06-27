
-- Adicionar campos para username, hash de recebimento e PIN de saque
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN withdrawal_wallet_hash TEXT,
ADD COLUMN withdrawal_pin TEXT;

-- Criar índice único para username para garantir unicidade
CREATE UNIQUE INDEX idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;
