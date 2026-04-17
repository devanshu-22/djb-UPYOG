package org.upyog.rs.web.controllers;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.response.ResponseInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.upyog.rs.service.FillingPointService;
import org.upyog.rs.util.ResponseInfoFactory;
import org.upyog.rs.web.models.fillingpoint.*;
import org.upyog.rs.web.models.fillingpoint.vendor.FillingPointVendorMap;
import org.upyog.rs.web.models.fillingpoint.vendor.FillingPointVendorMapRequest;
import org.upyog.rs.web.models.fillingpoint.vendor.FillingPointVendorMapResponse;

import javax.validation.Valid;
import java.util.List;
@Slf4j
@RestController
@RequestMapping("/wt/filling-point")
public class FillingPointController {

    @Autowired
    private FillingPointService service;

    @Autowired
    private ResponseInfoFactory responseInfoFactory;

    @PostMapping("/_create")
    public ResponseEntity<FillingPointResponse> create(
            @RequestBody FillingPointRequest request) {

        List<FillingPoint> result;

        // Frontend water tanker flow
        if (request.getWaterTankerBookingDetail() != null) {
            result = service.createFromWaterTankerRequest(request);
        } else {
            // Direct API call
            result = service.create(request);
        }

        ResponseInfo responseInfo = responseInfoFactory
                .createResponseInfoFromRequestInfo(request.getRequestInfo(), true);

        FillingPointResponse response = FillingPointResponse.builder()
                .responseInfo(responseInfo)
                .fillingPoints(result)
                .build();

        return ResponseEntity.ok(response);

    }

    @PostMapping("/_search")
    public ResponseEntity<FillingPointResponse> search(
            @RequestBody FillingPointSearchRequest request,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {

        request.getCriteria().setLimit(limit);
        request.getCriteria().setOffset(offset);

        FillingPointResponse response = service.search(request.getCriteria());

        ResponseInfo responseInfo = responseInfoFactory
                .createResponseInfoFromRequestInfo(request.getRequestInfo(), true);

        response.setResponseInfo(responseInfo);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/_update")
    public ResponseEntity<FillingPointResponse> update(
            @RequestBody FillingPointRequest request) {

        List<FillingPoint> result = service.update(request);

        ResponseInfo responseInfo = responseInfoFactory
                .createResponseInfoFromRequestInfo(request.getRequestInfo(), true);

        FillingPointResponse response = FillingPointResponse.builder()
                .responseInfo(responseInfo)
                .fillingPoints(result)
                .build();

        return ResponseEntity.ok(response);
    }


    @PostMapping("/vendor/_map")
    public ResponseEntity<FillingPointVendorMapResponse> mapVendor(
            @Valid @RequestBody FillingPointVendorMapRequest request) {

        log.info("Received vendor mapping request with {} records", request.getMappings().size());

        List<FillingPointVendorMap> result = service.mapVendor(request);

        ResponseInfo responseInfo = responseInfoFactory
                .createResponseInfoFromRequestInfo(request.getRequestInfo(), true);

        return ResponseEntity.ok(
                FillingPointVendorMapResponse.builder()
                        .responseInfo(responseInfo)
                        .mappings(result)
                        .build()
        );
    }
}
