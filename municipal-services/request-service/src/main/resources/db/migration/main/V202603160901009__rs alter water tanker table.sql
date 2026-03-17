
ALTER TABLE upyog_rs_water_tanker_address_details
    ADD COLUMN IF NOT EXISTS wt_file_store_id VARCHAR(255);
