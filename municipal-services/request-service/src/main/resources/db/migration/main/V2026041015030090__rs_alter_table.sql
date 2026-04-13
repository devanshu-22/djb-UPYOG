-- Add columns to Water Tanker Address table

ALTER TABLE upyog_rs_water_tanker_address_details
DROP CONSTRAINT IF EXISTS unique_applicant_address;

ALTER TABLE upyog_rs_water_tanker_address_details
 ADD CONSTRAINT unique_applicant_address UNIQUE (applicant_id);





