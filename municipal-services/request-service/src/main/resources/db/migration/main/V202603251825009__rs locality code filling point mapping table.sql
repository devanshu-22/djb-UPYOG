CREATE TABLE IF NOT EXISTS filling_point_locality_mapping (
    filling_point_id VARCHAR(64) NOT NULL,
    locality_code VARCHAR(64) NOT NULL,

    createdby VARCHAR(64),
    lastmodifiedby VARCHAR(64),
    createdtime BIGINT NOT NULL,
    lastmodifiedtime BIGINT,

    CONSTRAINT pk_filling_point_locality
    PRIMARY KEY (filling_point_id, locality_code)
    );