package org.upyog.rs.repository.rowMapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import org.upyog.rs.web.models.AdditionalDetails;
import org.upyog.rs.web.models.AuditDetails;
import org.upyog.rs.web.models.RoutePoint;
import org.upyog.rs.web.models.TripHistory;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
@Component
public class TripHistoryRowMapper implements ResultSetExtractor<List<TripHistory>> {

    private final ObjectMapper objectMapper = new ObjectMapper();
    @Override
    public List<TripHistory> extractData(ResultSet rs) throws SQLException, DataAccessException {
        Map<String, TripHistory> tripMap = new LinkedHashMap<>();

        while (rs.next()) {
            String currentTripId = rs.getString("tripId");
            TripHistory currentTrip = tripMap.get(currentTripId);

            if (currentTrip == null) {

                AdditionalDetails additionalDetails = null;
                String additionalDetailsStr = rs.getString("additionaldetails");

                if (additionalDetailsStr != null) {
                    try {
                        additionalDetails = objectMapper.readValue(additionalDetailsStr, AdditionalDetails.class);
                    } catch (Exception e) {
                        throw new RuntimeException("Error parsing additionalDetails JSON", e);
                    }
                }

                AuditDetails auditDetails = AuditDetails.builder()
                        .createdBy(rs.getString("createdby"))
                        .lastModifiedBy(rs.getString("lastmodifiedby"))
                        .createdTime(rs.getLong("createdtime"))
                        .lastModifiedTime(rs.getLong("lastmodifiedtime"))
                        .build();

                currentTrip = TripHistory.builder()
                        .tenantId(rs.getString("tenantId"))
                        .tripId(rs.getString("tripId"))
                        .driverId(rs.getString("driverId"))
                        .vehicleId(rs.getString("vehicleId"))
                        .bookingNo(rs.getString("bookingNo"))
                        .startTime(rs.getLong("startTime"))
                        .endTime(rs.getLong("endTime"))
                        .totalDistanceMeters(rs.getDouble("totalDistanceMeters"))
                        .businessService(rs.getString("businessService"))
                        .status(rs.getString("status"))
                        .additionalDetails(additionalDetails)
                        .auditDetails(auditDetails)
                        .routePoints(new ArrayList<>())
                        .build();
                tripMap.put(currentTripId, currentTrip);
            }

            RoutePoint point = RoutePoint.builder()
                    .pointId(rs.getString("pointId"))
                    .lat(rs.getDouble("lat"))
                    .lng(rs.getDouble("lng"))
                    .rawLat(rs.getDouble("rawLat"))
                    .rawLng(rs.getDouble("rawLng"))
                    .accuracy(rs.getDouble("accuracy"))
                    .speed(rs.getDouble("speed"))
                    .tripId(rs.getString("tripid"))
                    .bearing(rs.getDouble("bearing"))
                    .provider(rs.getString("provider"))
                    .timestamp(rs.getString("timestamp"))
                    .epochMillis(rs.getLong("epochMillis"))
                    .isPrecise(rs.getBoolean("isPrecise"))
                    .build();

            if (point.getPointId() != null) {
                currentTrip.getRoutePoints().add(point);
            }
        }
        return new ArrayList<>(tripMap.values());
    }
}