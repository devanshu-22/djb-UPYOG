ALTER TABLE eg_vehicle
    ADD COLUMN IF NOT EXISTS filling_point_id VARCHAR(64);


ALTER TABLE eg_vehicle_auditlog
    ADD COLUMN IF NOT EXISTS filling_point_id VARCHAR(64);

