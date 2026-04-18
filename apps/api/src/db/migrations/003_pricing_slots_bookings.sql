ALTER TABLE hospital_vaccines
ADD COLUMN IF NOT EXISTS price_inr INTEGER NOT NULL DEFAULT 0 CHECK (price_inr >= 0);

CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_vaccine_id UUID NOT NULL REFERENCES hospital_vaccines(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  booked_count INTEGER NOT NULL DEFAULT 0 CHECK (booked_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_offering_slot UNIQUE (hospital_vaccine_id, slot_date, start_time, end_time),
  CONSTRAINT slot_time_order CHECK (end_time > start_time),
  CONSTRAINT slot_booked_count_limit CHECK (booked_count <= capacity)
);

CREATE INDEX IF NOT EXISTS idx_time_slots_hospital_vaccine ON time_slots (hospital_vaccine_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_slot_date ON time_slots (slot_date);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hospital_vaccine_id UUID NOT NULL REFERENCES hospital_vaccines(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled')),
  locked_price_inr INTEGER NOT NULL CHECK (locked_price_inr >= 0),
  confirmation_code VARCHAR(32) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_time_slot_id ON bookings (time_slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_booking_per_user_slot
ON bookings (user_id, time_slot_id)
WHERE status = 'booked';
