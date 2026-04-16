package org.upyog.rs.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.upyog.rs.repository.DriverTripReportRepository;
import org.upyog.rs.util.ResponseInfoFactory;
import org.upyog.rs.web.models.DriverTripReport;
import org.upyog.rs.web.models.DriverTripReportResponse;
import org.upyog.rs.web.models.DriverTripReportSearchCriteria;

import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class DriverTripReportServiceImpl {
    @Autowired
    private DriverTripReportRepository repository;

    @Autowired
    private ResponseInfoFactory responseInfoFactory;

    /**
     * Validates the search criteria, fetches paginated results and total count,
     * and returns a fully populated {@link DriverTripReportResponse}.
     *
     * @param requestInfo UPYOG standard RequestInfo
     * @param criteria    search / filter / pagination parameters
     * @return paginated report response
     */
    public DriverTripReportResponse getDriverTripReport(RequestInfo requestInfo,
                                                        DriverTripReportSearchCriteria criteria) {

        validateSearchCriteria(criteria);

        log.info("Fetching driver trip report for tenantId: {}, offset: {}, limit: {}",
                criteria.getTenantId(), criteria.getOffset(), criteria.getLimit());

        // 1. Get total count for pagination metadata
        Integer totalCount = repository.getDriverTripReportCount(criteria);

        // 2. Fetch paginated data
        List<DriverTripReport> reports = Collections.emptyList();
        if (totalCount > 0) {
            reports = repository.getDriverTripReport(criteria);
        }

        // 3. Enrich sr_no (sequential within the current page)
        int startSrNo = (criteria.getOffset() != null ? criteria.getOffset() : 0) + 1;
        for (int i = 0; i < reports.size(); i++) {
            reports.get(i).setSrNo(startSrNo + i);
        }

        log.info("Driver trip report fetched: totalCount={}, pageSize={}", totalCount, reports.size());

        ResponseInfo responseInfo = responseInfoFactory.createResponseInfoFromRequestInfo(requestInfo, true);

        return DriverTripReportResponse.builder()
                .responseInfo(responseInfo)
                .driverTripReports(reports)
                .totalCount(totalCount)
                .offset(criteria.getOffset())
                .limit(criteria.getLimit())
                .build();
    }

    // ── Validation ────────────────────────────────────────────────────────────

    private void validateSearchCriteria(DriverTripReportSearchCriteria criteria) {

        if (criteria == null) {
            throw new CustomException("INVALID_SEARCH_CRITERIA",
                    "Search criteria cannot be null.");
        }

        if (StringUtils.isBlank(criteria.getTenantId())) {
            throw new CustomException("INVALID_TENANT",
                    "tenantId is mandatory for driver trip report search.");
        }

        if (criteria.getLimit() != null && criteria.getLimit() > 200) {
            throw new CustomException("INVALID_LIMIT",
                    "Limit cannot exceed 200 records per page.");
        }

        if (criteria.getOffset() != null && criteria.getOffset() < 0) {
            throw new CustomException("INVALID_OFFSET",
                    "Offset cannot be negative.");
        }

        if (criteria.getFromDate() != null && criteria.getToDate() != null
                && criteria.getFromDate() > criteria.getToDate()) {
            throw new CustomException("INVALID_DATE_RANGE",
                    "fromDate cannot be greater than toDate.");
        }
    }
}
