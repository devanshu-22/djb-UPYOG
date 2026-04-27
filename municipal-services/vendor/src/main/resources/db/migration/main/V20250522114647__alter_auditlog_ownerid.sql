ALTER TABLE eg_vendor_auditlog
ADD COLUMN IF NOT EXISTS  ownerid character varying(64);