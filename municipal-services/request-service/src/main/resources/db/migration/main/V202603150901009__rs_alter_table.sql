-- Add columns to Water Tanker Address table
ALTER TABLE upyog_rs_water_tanker_address_details
    ADD COLUMN IF NOT EXISTS latitude CHARACTER VARYING(64),
ADD COLUMN IF NOT EXISTS longitude CHARACTER VARYING(64);

-- Add columns to Mobile Toilet Address table
ALTER TABLE upyog_rs_mobile_toilet_address_details
    ADD COLUMN IF NOT EXISTS latitude CHARACTER VARYING(64),
ADD COLUMN IF NOT EXISTS longitude CHARACTER VARYING(64);

