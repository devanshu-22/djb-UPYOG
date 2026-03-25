
ALTER TABLE upyog_rs_water_tanker_filling_point
    ADD COLUMN IF NOT EXISTS filling_point_id VARCHAR(255);


ALTER TABLE upyog_rs_water_tanker_applicant_details
    ADD COLUMN IF NOT EXISTS fixed_point_id VARCHAR(255);


CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_mobile_number
    ON upyog_rs_water_tanker_applicant_details (mobile_number);


CREATE SEQUENCE IF NOT EXISTS seq_fxp_common
START WITH 1
INCREMENT BY 1;