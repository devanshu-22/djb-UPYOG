CREATE TABLE IF NOT EXISTS eg_vendor_work_order (
    id                  VARCHAR(64)  PRIMARY KEY,
    tenant_id           varchar(64) NULL,
    name                VARCHAR(256) NULL,
    vendor_id           VARCHAR(64)  NOT NULL,
    valid_from          BIGINT       NOT NULL,
    valid_to            BIGINT       NOT NULL,
    mobileNumber        varchar(64) NULL,
    alternateNumber     varchar(20) NULL,
    emailId             varchar(64) NULL,
    servicetype         varchar(64) null,
    created_by          VARCHAR(64),
    last_modified_by    VARCHAR(64),
    created_time        BIGINT,
    last_modified_time  BIGINT
    );