-- ============================================
-- SomazBet SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  vip_level INTEGER DEFAULT 0,
  balance DECIMAL(15,2) DEFAULT 0.00,
  bonus_balance DECIMAL(15,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  referred_by UUID REFERENCES public.users(id),
  agent_id UUID,
  ewallet_provider TEXT,
  ewallet_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE public.admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'support', 'finance')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAMES TABLE
-- ============================================
CREATE TABLE public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('slots', 'poker', 'aviator', 'casino', 'sports')),
  thumbnail_url TEXT,
  game_url TEXT,
  min_bet DECIMAL(10,2) DEFAULT 1.00,
  max_bet DECIMAL(10,2) DEFAULT 10000.00,
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BET RECORDS TABLE
-- ============================================
CREATE TABLE public.bet_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  game_id UUID REFERENCES public.games(id),
  game_name TEXT,
  bet_amount DECIMAL(15,2) NOT NULL,
  win_amount DECIMAL(15,2) DEFAULT 0,
  result TEXT CHECK (result IN ('win', 'loss', 'pending', 'cancelled')),
  status TEXT DEFAULT 'pending',
  round_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bonus', 'bet', 'win', 'refund')),
  amount DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_method TEXT,
  payment_reference TEXT,
  bank_info JSONB,
  admin_note TEXT,
  processed_by UUID REFERENCES public.admin_users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT METHODS TABLE
-- ============================================
CREATE TABLE public.payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  type TEXT CHECK (type IN ('ewallet', 'bank', 'crypto')),
  settings JSONB DEFAULT '{}',
  api_credentials JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- ============================================
-- PROMOTIONS TABLE
-- ============================================
CREATE TABLE public.promotions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title_en TEXT,
  title_local TEXT,
  description_en TEXT,
  description_local TEXT,
  banner_url TEXT,
  type TEXT CHECK (type IN ('bonus', 'cashback', 'referral', 'event')),
  bonus_amount DECIMAL(10,2),
  bonus_percent DECIMAL(5,2),
  min_deposit DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  visibility BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE public.agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  total_users INTEGER DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPORT TICKETS TABLE
-- ============================================
CREATE TABLE public.support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ticket_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES public.support_tickets(id),
  sender_type TEXT CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APP VERSIONS TABLE
-- ============================================
CREATE TABLE public.app_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  platform TEXT CHECK (platform IN ('ios', 'android')),
  version TEXT NOT NULL,
  release_notes TEXT,
  apk_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_force_update BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert defaults
INSERT INTO public.system_settings (key, value, description) VALUES
  ('site_name', '"SomazBet"', 'Site name'),
  ('maintenance_mode', 'false', 'Maintenance mode'),
  ('min_deposit', '10', 'Minimum deposit amount'),
  ('max_withdrawal', '50000', 'Maximum withdrawal amount'),
  ('referral_bonus', '50', 'Referral bonus amount');

-- ============================================
-- LEADERBOARD VIEW
-- ============================================
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  u.id,
  u.username,
  u.avatar_url,
  u.vip_level,
  COALESCE(SUM(b.bet_amount), 0) as total_bets,
  COALESCE(SUM(b.win_amount), 0) as total_wins,
  COALESCE(SUM(b.win_amount) - SUM(b.bet_amount), 0) as net_profit,
  COUNT(b.id) as games_played
FROM public.users u
LEFT JOIN public.bet_records b ON b.user_id = u.id AND b.result = 'win'
GROUP BY u.id, u.username, u.avatar_url, u.vip_level
ORDER BY total_wins DESC
LIMIT 100;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users read own data" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users update own data" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Users see own transactions
CREATE POLICY "Users read own transactions" ON public.transactions
  FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Users see own bets
CREATE POLICY "Users read own bets" ON public.bet_records
  FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Games are public
CREATE POLICY "Games are public" ON public.games
  FOR SELECT USING (is_active = true AND is_visible = true);
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Promotions are public
CREATE POLICY "Promotions are public" ON public.promotions
  FOR SELECT USING (is_active = true);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update user balance
CREATE OR REPLACE FUNCTION update_user_balance(
  p_user_id UUID,
  p_amount DECIMAL,
  p_type TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  IF p_type = 'add' THEN
    UPDATE public.users SET balance = balance + p_amount WHERE id = p_user_id;
  ELSIF p_type = 'subtract' THEN
    IF (SELECT balance FROM public.users WHERE id = p_user_id) >= p_amount THEN
      UPDATE public.users SET balance = balance - p_amount WHERE id = p_user_id;
    ELSE
      RETURN FALSE;
    END IF;
  END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED SAMPLE GAMES
-- ============================================
INSERT INTO public.games (name, category, min_bet, max_bet, is_active) VALUES
  ('Aviator', 'aviator', 1.00, 10000.00, true),
  ('Super Ace', 'slots', 0.50, 5000.00, true),
  ('Golden Empire', 'slots', 0.50, 5000.00, true),
  ('Texas Poker', 'poker', 5.00, 50000.00, true),
  ('Lucky Slots', 'slots', 0.10, 1000.00, true),
  ('Baccarat', 'casino', 10.00, 100000.00, true);

-- ============================================
-- SEED PAYMENT METHODS
-- ============================================
INSERT INTO public.payment_methods (name, type, is_active) VALUES
  ('bKash', 'ewallet', true),
  ('Nagad', 'ewallet', true),
  ('Rocket', 'ewallet', true),
  ('Bank Transfer', 'bank', true);
