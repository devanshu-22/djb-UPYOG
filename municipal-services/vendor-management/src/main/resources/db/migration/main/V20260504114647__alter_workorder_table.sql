ALTER TABLE eg_vendor_work_order
ADD COLUMN IF NOT EXISTS filling_station_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS wt_file_store_id VARCHAR(255);