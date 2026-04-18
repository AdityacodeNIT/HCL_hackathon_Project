-- Drop the old constraint first
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Update existing 'booked' status to 'approved' for backward compatibility
UPDATE bookings SET status = 'approved' WHERE status = 'booked';

-- Add new booking statuses for approval workflow with updated constraint
ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'approved', 'completed', 'cancelled'));

-- Update the unique index to work with new statuses
DROP INDEX IF EXISTS unique_active_booking_per_user_slot;
CREATE UNIQUE INDEX unique_active_booking_per_user_slot
ON bookings (user_id, time_slot_id)
WHERE status IN ('pending', 'approved', 'completed');

-- Add admin approval tracking
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bookings_approved_by ON bookings (approved_by);
CREATE INDEX IF NOT EXISTS idx_bookings_completed_by ON bookings (completed_by);
