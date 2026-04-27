ALTER TABLE eg_driver_trip
ADD COLUMN IF NOT EXISTS divert_lat NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS divert_long NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS divert_file_store_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS divert_remark VARCHAR(500);


-- Add all missing columns safely

ALTER TABLE public.eg_driver_trip_history

-- Status
ADD COLUMN IF NOT EXISTS current_status VARCHAR(30),

-- Start details
ADD COLUMN IF NOT EXISTS start_latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS start_longitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS start_file_store_id VARCHAR(100),

-- End details
ADD COLUMN IF NOT EXISTS end_latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS end_longitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS end_file_store_id VARCHAR(100),

-- Remarks & roles
ADD COLUMN IF NOT EXISTS remark VARCHAR(255),
ADD COLUMN IF NOT EXISTS remark_updated_by_role VARCHAR(50),
ADD COLUMN IF NOT EXISTS photo_updated_by_role VARCHAR(250),

-- File reference
ADD COLUMN IF NOT EXISTS jefilestoreid VARCHAR(100),

-- KM tracking
ADD COLUMN IF NOT EXISTS initial_km INT8,
ADD COLUMN IF NOT EXISTS final_km INT8,
ADD COLUMN IF NOT EXISTS total_km INT8,

ADD COLUMN IF NOT EXISTS divert_lat NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS divert_long NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS divert_file_store_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS divert_remark VARCHAR(500);