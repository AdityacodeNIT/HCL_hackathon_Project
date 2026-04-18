CREATE TABLE IF NOT EXISTS anganwadis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  city VARCHAR(120) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anganwadis_city ON anganwadis (city);
CREATE INDEX IF NOT EXISTS idx_anganwadis_pincode ON anganwadis (pincode);

CREATE TABLE IF NOT EXISTS anganwadi_vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anganwadi_id UUID NOT NULL REFERENCES anganwadis(id) ON DELETE CASCADE,
  vaccine_id UUID NOT NULL REFERENCES vaccines(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  price_inr INTEGER NOT NULL DEFAULT 0 CHECK (price_inr >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_anganwadi_vaccine UNIQUE (anganwadi_id, vaccine_id)
);

CREATE INDEX IF NOT EXISTS idx_anganwadi_vaccines_anganwadi_id ON anganwadi_vaccines (anganwadi_id);
CREATE INDEX IF NOT EXISTS idx_anganwadi_vaccines_vaccine_id ON anganwadi_vaccines (vaccine_id);

CREATE TABLE IF NOT EXISTS anganwadi_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anganwadi_vaccine_id UUID NOT NULL REFERENCES anganwadi_vaccines(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  booked_count INTEGER NOT NULL DEFAULT 0 CHECK (booked_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_anganwadi_slot UNIQUE (anganwadi_vaccine_id, slot_date, start_time, end_time),
  CONSTRAINT anganwadi_slot_time_order CHECK (end_time > start_time),
  CONSTRAINT anganwadi_slot_booked_count_limit CHECK (booked_count <= capacity)
);

CREATE INDEX IF NOT EXISTS idx_anganwadi_time_slots_vaccine ON anganwadi_time_slots (anganwadi_vaccine_id);
CREATE INDEX IF NOT EXISTS idx_anganwadi_time_slots_date ON anganwadi_time_slots (slot_date);
