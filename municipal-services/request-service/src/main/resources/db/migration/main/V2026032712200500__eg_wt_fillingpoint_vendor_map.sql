CREATE TABLE IF NOT EXISTS eg_wt_fillingpoint_vendor_map (
                                               id UUID PRIMARY KEY,
                                               tenant_id VARCHAR(64) NOT NULL,
                                               filling_point_id UUID NOT NULL,
                                               vendor_id UUID NOT NULL,
                                               createdby VARCHAR(64),
                                               lastmodifiedby VARCHAR(64),
                                               createdtime BIGINT,
                                               lastmodifiedtime BIGINT
);