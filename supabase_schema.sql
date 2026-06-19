-- Create Members Table
CREATE TABLE members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  phone TEXT NOT NULL,
  email TEXT,
  joined DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Active',
  reg_fee_paid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Levies Table
CREATE TABLE levies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  member_id BIGINT REFERENCES members(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  month TEXT NOT NULL,
  months_count INT DEFAULT 1,
  amount NUMERIC NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Paid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Expenses Table
CREATE TABLE expenses (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  amount NUMERIC NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  reason TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Meetings Table
CREATE TABLE meetings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE levies ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create simple policies (Allow all for now, but should be restricted in production)
CREATE POLICY "Allow all access" ON members FOR ALL USING (true);
CREATE POLICY "Allow all access" ON levies FOR ALL USING (true);
CREATE POLICY "Allow all access" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all access" ON meetings FOR ALL USING (true);
