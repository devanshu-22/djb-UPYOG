package org.upyog.rs.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.upyog.rs.constant.RequestServiceConstants;
import org.upyog.rs.constant.TripStatus;
import org.upyog.rs.kafka.Producer;
import org.upyog.rs.repository.DriverTripRepository;
import org.upyog.rs.service.DriverTripService;
import org.upyog.rs.util.RequestServiceUtil;
import org.upyog.rs.web.models.DriverTrip;
import org.upyog.rs.web.models.DriverTripRequest;
import org.egov.common.contract.request.Role;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DriverTripServiceImpl implements DriverTripService {

    @Autowired
    private Producer producer;

    @Autowired
    private DriverTripRepository repository;

    @Override
    public DriverTrip startTrip(DriverTripRequest request) {
        DriverTrip trip = request.getDriverTrip();
        String userUuid = request.getRequestInfo().getUserInfo().getUuid();

        DriverTrip existingTrip = repository.findByBookingNo(trip.getBookingNo());

        if (existingTrip != null) {
            TripStatus status = TripStatus.from(existingTrip.getCurrentStatus());
            if (status == TripStatus.START || status == TripStatus.DIVERT) {
                throw new CustomException("TRIP_ALREADY_ACTIVE",
                        "An active trip already exists for booking: " + trip.getBookingNo()
                                + ". Current status: " + existingTrip.getCurrentStatus());
            }
        }

        trip.setId(RequestServiceUtil.getRandonUUID());
        trip.setAuditDetails(RequestServiceUtil.getAuditDetails(userUuid, true));
        trip.setCurrentStatus(TripStatus.START.name());

        producer.push(RequestServiceConstants.KAFKA_SAVE_DRIVER_TRIP_TOPIC, request);
        return trip;
    }

    @Override
    public DriverTrip divertTrip(DriverTripRequest request) {
        DriverTrip updateReq = request.getDriverTrip();
        String userUuid  = request.getRequestInfo().getUserInfo().getUuid();

        DriverTrip existing = requireActiveTrip(updateReq.getBookingNo());

        TripStatus status = TripStatus.from(existing.getCurrentStatus());

        // Divert is only allowed from STARTED or an existing DIVERTED state
        if (status == TripStatus.COMPLETE) {
            throw new CustomException("TRIP_ALREADY_COMPLETED",
                    "Cannot divert a completed trip for booking: " + updateReq.getBookingNo());
        }

        existing.setCurrentStatus(TripStatus.DIVERT.name());
        existing.setDivertLat(updateReq.getDivertLat());
        existing.setDivertLong(updateReq.getDivertLong());
        existing.setDivertFileStoreId(updateReq.getDivertFileStoreId());
        existing.setDivertRemark(updateReq.getDivertRemark());
        existing.setAuditDetails(RequestServiceUtil.getAuditDetails(userUuid, false));

        log.info("Diverting trip for bookingNo={}", existing.getBookingNo());

        repository.updateDivert(existing);
        repository.saveTripHistory(existing);

        request.setDriverTrip(existing);
        producer.push(RequestServiceConstants.KAFKA_UPDATE_DRIVER_TRIP_TOPIC, request);
        return existing;
    }

    private DriverTrip requireActiveTrip(String bookingNo) {
        DriverTrip trip = repository.findByBookingNo(bookingNo);
        if (trip == null) {
            throw new CustomException("TRIP_NOT_FOUND",
                    "No active trip found for booking: " + bookingNo);
        }
        return trip;
    }

    @Override
    public DriverTrip completeTrip(DriverTripRequest request) {
        DriverTrip updateReq = request.getDriverTrip();
        String userUuid = request.getRequestInfo().getUserInfo().getUuid();

        DriverTrip existingTrip = requireActiveTrip(updateReq.getBookingNo());

        TripStatus status = TripStatus.from(existingTrip.getCurrentStatus());


        // Complete is allowed from STARTED or DIVERTED
        if (status == TripStatus.COMPLETE) {
            throw new CustomException("TRIP_ALREADY_COMPLETED",
                    "Trip is already completed for booking: " + updateReq.getBookingNo());
        }

        // KM validation
        if (existingTrip.getInitialKM() != null && updateReq.getFinalKM() != null) {
            if (updateReq.getFinalKM() < existingTrip.getInitialKM()) {
                throw new CustomException("INVALID_KM",
                        "Final KM (" + updateReq.getFinalKM()
                                + ") cannot be less than Initial KM (" + existingTrip.getInitialKM() + ")");
            }
            existingTrip.setFinalKM(updateReq.getFinalKM());
            existingTrip.setTotalKM(updateReq.getFinalKM() - existingTrip.getInitialKM());
        }


        existingTrip.setCurrentStatus(TripStatus.COMPLETE.name());
        existingTrip.setEndLatitude(updateReq.getEndLatitude());
        existingTrip.setEndLongitude(updateReq.getEndLongitude());
        existingTrip.setEndFileStoreId(updateReq.getEndFileStoreId());
        existingTrip.setRemark(updateReq.getRemark());
        existingTrip.setAuditDetails(RequestServiceUtil.getAuditDetails(userUuid, false));

        log.info("Completing trip for bookingNo={}, totalKM={}", existingTrip.getBookingNo(), existingTrip.getTotalKM());


        repository.update(existingTrip);
        repository.saveTripHistory(existingTrip);

        request.setDriverTrip(existingTrip);
        producer.push(RequestServiceConstants.KAFKA_UPDATE_DRIVER_TRIP_TOPIC, request);

        return existingTrip;
    }

    @Override
    public DriverTrip updateTripByNonDriver(DriverTripRequest request) {
        DriverTrip updateReq = request.getDriverTrip();
        String userUuid = request.getRequestInfo().getUserInfo().getUuid();
        DriverTrip existingTrip = requireActiveTrip(updateReq.getBookingNo());

        existingTrip.setJefilestoreId(updateReq.getJefilestoreId());
        existingTrip.setRemarkUpdatedByRole(updateReq.getRemarkUpdatedByRole());
        existingTrip.setPhotoUpdatedByRole(getNonDriverRoles(request));
        existingTrip.setCurrentStatus(TripStatus.COMPLETE.name());
        existingTrip.setAuditDetails(RequestServiceUtil.getAuditDetails(userUuid, false));
        log.info("Non-driver update for bookingNo={}, roles={}", existingTrip.getBookingNo(), existingTrip.getPhotoUpdatedByRole());

        existingTrip.setRemarkUpdatedByRole(updateReq.getRemarkUpdatedByRole());

        repository.updateByNonDriver(existingTrip);

        request.setDriverTrip(existingTrip);
        producer.push(RequestServiceConstants.KAFKA_UPDATE_DRIVER_TRIP_TOPIC, request);

        return existingTrip;
    }

    private String getNonDriverRoles(DriverTripRequest request) {
        List<Role> roles = request.getRequestInfo().getUserInfo().getRoles();

        return roles.stream()
                .map(Role::getCode)
                .collect(Collectors.joining(","));
    }
}