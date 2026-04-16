package org.upyog.rs.web.controllers;


import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.response.ResponseInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.upyog.rs.service.impl.DriverTripReportServiceImpl;
import org.upyog.rs.util.ResponseInfoFactory;
import org.upyog.rs.web.models.DriverTripReportRequest;
import org.upyog.rs.web.models.DriverTripReportResponse;
import org.upyog.rs.web.models.DriverTripReportSearchCriteria;

import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/v1/driver-trip-report")
public class DriverTripReportController {

    @Autowired
    private DriverTripReportServiceImpl driverTripReportService;

    @Autowired
    private ResponseInfoFactory responseInfoFactory;


    @PostMapping("/_search")
    public ResponseEntity<DriverTripReportResponse> searchDriverTripReportGet(
            @Valid @RequestBody DriverTripReportRequest requestBody,
            @RequestParam(value = "tenantId",      required = true)  String tenantId,
            @RequestParam(value = "bookingId",     required = false) String bookingId,
            @RequestParam(value = "bookingNo",     required = false) String bookingNo,
            @RequestParam(value = "driverId",      required = false) String driverId,
            @RequestParam(value = "vehicleId",     required = false) String vehicleId,
            @RequestParam(value = "vendorId",      required = false) String vendorId,
            @RequestParam(value = "tankerType",    required = false) String tankerType,
            @RequestParam(value = "currentStatus", required = false) String currentStatus,
            @RequestParam(value = "fromDate",      required = false) Long fromDate,
            @RequestParam(value = "toDate",        required = false) Long toDate,
            @RequestParam(value = "offset",        defaultValue = "0")  Integer offset,
            @RequestParam(value = "limit",         defaultValue = "50") Integer limit,
            @RequestParam(value = "sortBy",        defaultValue = "created_time") String sortBy,
            @RequestParam(value = "sortOrder",     defaultValue = "DESC") String sortOrder) {

        DriverTripReportSearchCriteria criteria = DriverTripReportSearchCriteria.builder()
                .tenantId(tenantId)
                .bookingId(bookingId)
                .bookingNo(bookingNo)
                .driverId(driverId)
                .vehicleId(vehicleId)
                .vendorId(vendorId)
                .tankerType(tankerType)
                .currentStatus(currentStatus)
                .fromDate(fromDate)
                .toDate(toDate)
                .offset(offset)
                .limit(limit)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .build();

        log.info("GET driver trip report search: tenantId={}, currentStatus={}, limit={}, offset={}",
                tenantId, currentStatus, limit, offset);

        DriverTripReportResponse response =
                driverTripReportService.getDriverTripReport(requestBody.getRequestInfo(), criteria);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}