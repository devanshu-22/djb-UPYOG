package org.upyog.rs.web.controllers;

import digit.models.coremodels.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.upyog.rs.service.FillingPointLocalityService;
import org.upyog.rs.util.ResponseInfoFactory;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocality;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalityRequest;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalityResponse;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalitySearchCriteria;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/filling-point/locality/v1")
public class FillingPointLocalityController {

    @Autowired
    private ResponseInfoFactory responseInfoFactory;

    @Autowired
    private FillingPointLocalityService service;

    @PostMapping("/_create")
    public ResponseEntity<FillingPointLocalityResponse> create(@Valid @RequestBody FillingPointLocalityRequest request) {
        List<FillingPointLocality> mapping = service.createMapping(request);
        FillingPointLocalityResponse response = FillingPointLocalityResponse.builder()
                .fillingPointLocality(mapping)
                .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(request.getRequestInfo(), true))
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/_update")
    public ResponseEntity<FillingPointLocalityResponse> update(@Valid @RequestBody FillingPointLocalityRequest request) {
        List<FillingPointLocality> mapping = service.updateMapping(request);
        FillingPointLocalityResponse response = FillingPointLocalityResponse.builder()
                .fillingPointLocality(mapping)
                .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(request.getRequestInfo(), true))
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/_search")
    public ResponseEntity<FillingPointLocalityResponse> search(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                                               @Valid @ModelAttribute FillingPointLocalitySearchCriteria criteria) {

        List<FillingPointLocality> mappings = service.searchMapping(criteria, requestInfoWrapper.getRequestInfo());

        FillingPointLocalityResponse response = FillingPointLocalityResponse.builder()
                .fillingPointLocality(mappings)
                .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(requestInfoWrapper.getRequestInfo(), true))
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
