
ALTER TABLE upyog_rs_water_tanker_address_details
    ADD COLUMN IF NOT EXISTS ward VARCHAR(255);

ALTER TABLE upyog_rs_water_tanker_address_details
    ADD COLUMN IF NOT EXISTS zone VARCHAR(255);

ALTER TABLE upyog_rs_water_tanker_address_details
    ADD COLUMN IF NOT EXISTS constituency VARCHAR(255);