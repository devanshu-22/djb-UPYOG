package org.upyog.rs.web.controllers;

import digit.models.coremodels.RequestInfoWrapper;
import javax.validation.Valid;
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

        // Normalize limit/offset
        int limit = (criteria.getLimit() != null && criteria.getLimit() > 0)
                ? Math.min(criteria.getLimit(), 100) : 10;
        int offset = (criteria.getOffset() != null && criteria.getOffset() >= 0)
                ? criteria.getOffset() : 0;
        criteria.setLimit(limit);
        criteria.setOffset(offset);

        Long totalCount = service.getCount(criteria);
        List<FillingPointLocality> mappings = service.searchMapping(criteria, requestInfoWrapper.getRequestInfo());

        boolean hasMore = (offset + mappings.size()) < totalCount;

        FillingPointLocalityResponse response = FillingPointLocalityResponse.builder()
                .fillingPointLocality(mappings)
                .totalCount(totalCount)
                .pageSize(limit)
                .hasMore(hasMore)
                .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(
                        requestInfoWrapper.getRequestInfo(), true))
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
