package org.upyog.rs.web.controllers;

import digit.models.coremodels.RequestInfoWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.upyog.rs.service.impl.TripHistoryServiceImpl;
import org.upyog.rs.util.ResponseInfoFactory;
import org.upyog.rs.web.models.*;

import javax.validation.Valid;
import java.util.List;
@RestController
@RequestMapping("/v1/trip/history")
public class TripHistoryController {

    @Autowired
    private TripHistoryServiceImpl tripHistoryService;

    @Autowired
    private ResponseInfoFactory responseInfoFactory;

    @PostMapping("/_create")
    public ResponseEntity<TripHistoryResponse> create(@Valid @RequestBody TripHistoryRequest request) {
        List<TripHistory> trips = tripHistoryService.createTrip(request);
        TripHistoryResponse response = TripHistoryResponse.builder()
                .tripHistory(trips)
                .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(request.getRequestInfo(), true))
                .build();
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PostMapping("/_search")
    public ResponseEntity<TripHistoryResponse> search(
            @Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
            @ModelAttribute TripHistorySearchCriteria criteria) {

        TripHistorySearchResult result = tripHistoryService.searchTrips(criteria);

        TripHistoryResponse response = TripHistoryResponse.builder()
                .tripHistory(result.getTrips())
                .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(
                        requestInfoWrapper.getRequestInfo(), true))
                .totalCount(result.getCount())
                .offset(criteria.getOffset())
                .limit(criteria.getLimit())
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}