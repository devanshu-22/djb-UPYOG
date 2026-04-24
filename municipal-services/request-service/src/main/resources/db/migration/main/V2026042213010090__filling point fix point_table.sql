DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE contype = 'p'
        AND conrelid = 'upyog_rs_water_tanker_filling_point_fixed_point_mapping'::regclass
    ) THEN
        ALTER TABLE upyog_rs_water_tanker_filling_point_fixed_point_mapping
        ADD CONSTRAINT pk_fixed_point PRIMARY KEY (fixed_pt_name);
    END IF;
END $$;