package org.upyog.rs.constant;

public enum TripStatus {
    START,
    DIVERT,
    COMPLETE;

    public static TripStatus from(String value) {
        try {
            return TripStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new org.egov.tracer.model.CustomException(
                    "INVALID_TRIP_STATUS",
                    "Invalid trip status: " + value + ". Allowed: START, DIVERT, COMPLETE"
            );
        }
    }
}
