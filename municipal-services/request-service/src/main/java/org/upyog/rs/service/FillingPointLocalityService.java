package org.upyog.rs.service;

import org.egov.common.contract.request.RequestInfo;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocality;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalityRequest;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalitySearchCriteria;

import java.util.List;

public interface FillingPointLocalityService {
    List<FillingPointLocality> createMapping(FillingPointLocalityRequest request);
    List<FillingPointLocality> updateMapping(FillingPointLocalityRequest request);
    List<FillingPointLocality> searchMapping(FillingPointLocalitySearchCriteria criteria, RequestInfo requestInfo);
    }
