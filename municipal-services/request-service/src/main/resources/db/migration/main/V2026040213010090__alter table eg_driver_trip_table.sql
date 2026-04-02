ALTER TABLE eg_driver_trip
    ADD COLUMN IF NOT EXISTS photo_updated_by_role VARCHAR(250),
    ADD COLUMN IF NOT EXISTS remark_updated_by_role VARCHAR(50),
    ADD COLUMN IF NOT EXISTS jeFileStoreId VARCHAR(100);