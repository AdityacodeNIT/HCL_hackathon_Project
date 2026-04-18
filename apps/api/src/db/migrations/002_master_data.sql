CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  city VARCHAR(120) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospitals_name ON hospitals (name);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals (city);
CREATE INDEX IF NOT EXISTS idx_hospitals_pincode ON hospitals (pincode);

CREATE TABLE IF NOT EXISTS vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name CITEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  doses_required INTEGER NOT NULL DEFAULT 1 CHECK (doses_required > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospital_vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  vaccine_id UUID NOT NULL REFERENCES vaccines(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_hospital_vaccine UNIQUE (hospital_id, vaccine_id)
);

CREATE INDEX IF NOT EXISTS idx_hospital_vaccines_hospital_id ON hospital_vaccines (hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_vaccines_vaccine_id ON hospital_vaccines (vaccine_id);
