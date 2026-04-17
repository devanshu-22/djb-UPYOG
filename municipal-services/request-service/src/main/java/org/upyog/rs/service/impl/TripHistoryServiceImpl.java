package org.upyog.rs.service.impl;

import org.egov.common.contract.request.RequestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.upyog.rs.config.RequestServiceConfiguration;
import org.upyog.rs.kafka.Producer;
import org.upyog.rs.repository.TripHistoryRepository;
import org.upyog.rs.web.models.*;

import java.util.List;
import java.util.UUID;

@Service
public class TripHistoryServiceImpl {

    @Autowired
    private Producer producer;

    @Autowired
    private RequestServiceConfiguration config;

    @Autowired
        private TripHistoryRepository repository;

        public List<TripHistory> createTrip(TripHistoryRequest request) {
            enrichTripRequest(request);

            producer.push(config.getDriverTripHistortSave(), request);

            return request.getTripHistory();
        }

    private void enrichTripRequest(TripHistoryRequest request) {
        String uuid = request.getRequestInfo().getUserInfo().getUuid();
        Long currentTime = System.currentTimeMillis();

        AuditDetails auditDetails = AuditDetails.builder()
                .createdBy(uuid)
                .lastModifiedBy(uuid)
                .createdTime(currentTime)
                .lastModifiedTime(currentTime)
                .build();

        for (TripHistory trip : request.getTripHistory()) {
            String tripId = UUID.randomUUID().toString();
            trip.setTripId(tripId);
            trip.setAuditDetails(auditDetails);

            if (!CollectionUtils.isEmpty(trip.getRoutePoints())) {
                trip.getRoutePoints().forEach(point -> {
                    point.setPointId(UUID.randomUUID().toString());
                    point.setTripId(tripId);
                });
            }
        }
    }

    public TripHistorySearchResult searchTrips(TripHistorySearchCriteria criteria) {
        List<TripHistory> trips = repository.getTripHistory(criteria);
        Integer count = repository.getTripHistoryCount(criteria);

        return new TripHistorySearchResult(trips, count);
    }
    }
