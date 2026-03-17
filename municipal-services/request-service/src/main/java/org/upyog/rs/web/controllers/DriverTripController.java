package org.upyog.rs.web.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.egov.common.contract.response.ResponseInfo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.upyog.rs.service.DriverTripService;
import org.upyog.rs.util.ResponseInfoFactory;
import org.upyog.rs.web.models.DriverTrip;
import org.upyog.rs.web.models.DriverTripRequest;
import org.upyog.rs.web.models.DriverTripResponse;
import org.upyog.rs.web.models.mobileToilet.MobileToiletBookingResponse; // Example of existing response models

import java.util.List;

@RestController
@RequestMapping("/driver/v1")
public class DriverTripController {

    @Autowired
    private DriverTripService driverTripService;

    @Autowired
    private ResponseInfoFactory responseInfoFactory;

    @PostMapping("/trip/_update")
    public ResponseEntity<DriverTripResponse> updateTrip(@RequestBody DriverTripRequest request) {
        DriverTrip result;

        if (request.getDriverTrip().getCurrentStatus().equalsIgnoreCase("START")) {
            result = driverTripService.startTrip(request);
        } else {
            result = driverTripService.completeTrip(request);
        }

        ResponseInfo responseInfo = responseInfoFactory.createResponseInfoFromRequestInfo(request.getRequestInfo(), true);

        DriverTripResponse response = DriverTripResponse.builder()
                .driverTrip(result)
                .responseInfo(responseInfo)
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}