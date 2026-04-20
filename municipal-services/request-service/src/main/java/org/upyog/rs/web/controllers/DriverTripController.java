package org.upyog.rs.web.controllers;

import digit.models.coremodels.RequestInfoWrapper;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.egov.common.contract.response.ResponseInfo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.upyog.rs.constant.TripStatus;
import org.upyog.rs.service.DriverTripService;
import org.upyog.rs.util.ResponseInfoFactory;
import org.upyog.rs.web.models.DriverTrip;
import org.upyog.rs.web.models.DriverTripRequest;
import org.upyog.rs.web.models.DriverTripResponse;
import org.upyog.rs.web.models.mobileToilet.MobileToiletBookingResponse; // Example of existing response models

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/driver/v1")
public class DriverTripController {
    private static final String ROLE_DRIVER = "WT_DRIVER";

    @Autowired
    private DriverTripService driverTripService;

    @Autowired
    private ResponseInfoFactory responseInfoFactory;

    @PostMapping("/trip/_update")
    public ResponseEntity<DriverTripResponse> updateTrip(@Valid @RequestBody DriverTripRequest request) {

        boolean isDriver = request.getRequestInfo().getUserInfo().getRoles()
                .stream()
                .anyMatch(role -> ROLE_DRIVER.equalsIgnoreCase(role.getCode()));
        DriverTrip result;

        if (isDriver) {
            result = handleDriverAction(request);
        } else {
            result = driverTripService.updateTripByNonDriver(request);
        }

        ResponseInfo responseInfo = responseInfoFactory.createResponseInfoFromRequestInfo(request.getRequestInfo(), true);

        DriverTripResponse response = DriverTripResponse.builder()
                .driverTrip(result)
                .responseInfo(responseInfo)
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private DriverTrip handleDriverAction(DriverTripRequest request) {
        String rawStatus = request.getDriverTrip().getCurrentStatus();
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new CustomException("MISSING_STATUS",
                    "currentStatus is required for driver actions. Allowed: START, DIVERT, COMPLETE");
        }

        TripStatus action = TripStatus.from(rawStatus);

        switch (action) {
            case START:   return driverTripService.startTrip(request);
            case DIVERT:  return driverTripService.divertTrip(request);
            case COMPLETE: return driverTripService.completeTrip(request);
            default:
                throw new CustomException("INVALID_ACTION",
                        "Unhandled action: " + rawStatus);
        }
    }

//
//    @PostMapping("/trip/_history")
//    public ResponseEntity<DriverTripResponse> getTripHistory(
//            @RequestBody RequestInfoWrapper requestInfoWrapper,
//            @RequestParam String driverId) {
//
//        List<DriverTrip> history = driverTripService.getDriverHistory(driverId);
//
//        ResponseInfo responseInfo = responseInfoFactory.createResponseInfoFromRequestInfo(requestInfoWrapper.getRequestInfo(), true);
//
//        DriverTripResponse response = DriverTripResponse.builder()
//                .driverTrips(history)
//                .responseInfo(responseInfo)
//                .build();
//
//        return new ResponseEntity<>(response, HttpStatus.OK);
//    }
}