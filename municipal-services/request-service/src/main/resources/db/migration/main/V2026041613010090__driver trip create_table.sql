-- Table for Trip Summary
CREATE TABLE IF NOT EXISTS eg_trip_history (
    tripId              varchar(64) PRIMARY KEY,
    tenantId            varchar(256) NOT NULL,
    driverId            varchar(64) NOT NULL,
    vehicleId           varchar(64),
    bookingNo           varchar(64),
    startTime           bigint,
    endTime             bigint,
    totalDistanceMeters numeric(12,2),
    businessService     varchar(64),
    status              varchar(64),
    additionalDetails   jsonb,

    createdBy           varchar(64),
    lastModifiedBy      varchar(64),
    createdTime         bigint,
    lastModifiedTime    bigint,

    CONSTRAINT uk_eg_trip_history UNIQUE (tripId, tenantId)
);

CREATE TABLE IF NOT EXISTS eg_trip_route_points (
    pointId             varchar(64) PRIMARY KEY,
    tripId              varchar(64) NOT NULL,
    lat                 numeric(10,8) NOT NULL,
    lng                 numeric(11,8) NOT NULL,
    rawLat              numeric(10,8),
    rawLng              numeric(11,8),
    accuracy            numeric(10,2),
    speed               numeric(10,2),
    bearing             numeric(10,2),
    provider            varchar(64),
    timestamp           varchar(64),
    epochMillis         bigint NULL,
    isPrecise           boolean,

    CONSTRAINT fk_trip_history_points FOREIGN KEY (tripId)
        REFERENCES eg_trip_history (tripId)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trip_history_driver ON eg_trip_history (driverId);
CREATE INDEX IF NOT EXISTS idx_trip_history_tenant ON eg_trip_history (tenantId);
CREATE INDEX IF NOT EXISTS idx_trip_points_tripId ON eg_trip_route_points (tripId);