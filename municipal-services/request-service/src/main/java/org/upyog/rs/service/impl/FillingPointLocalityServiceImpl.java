package org.upyog.rs.service.impl;

import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import org.upyog.rs.config.RequestServiceConfiguration;
import org.upyog.rs.kafka.Producer;
import org.upyog.rs.repository.FillingPointLocalityRepository;
import org.upyog.rs.service.EnrichmentService;
import org.upyog.rs.service.FillingPointLocalityService;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocality;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalityRequest;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalitySearchCriteria;

import java.util.List;

@Service
public class FillingPointLocalityServiceImpl implements FillingPointLocalityService {

    @Autowired
    private Producer producer;

    @Autowired
    private EnrichmentService enrichmentService;

    @Autowired
    private FillingPointLocalityRepository fillingPointLocalityRepository;

    @Autowired
    private RequestServiceConfiguration requestServiceConfiguration;

    @Override
    public List<FillingPointLocality> createMapping(FillingPointLocalityRequest request) {
        enrichmentService.enrichCreateRequest(request);
        producer.push(requestServiceConfiguration.getSaveFillingPointLocality(), request);

        return request.getFillingPointLocality();
    }

    @Override
    public List<FillingPointLocality> updateMapping(FillingPointLocalityRequest request) {
        enrichmentService.enrichUpdateRequest(request);
        producer.push(requestServiceConfiguration.getUpdateFillingPointLocality(), request);
        return request.getFillingPointLocality();
    }

    public List<FillingPointLocality> searchMapping(FillingPointLocalitySearchCriteria criteria, RequestInfo requestInfo) {
        if (ObjectUtils.isEmpty(criteria.getTenantId())) {
            throw new CustomException("EG_BS_ERR_001", "TenantId is mandatory for search");
        }

        return fillingPointLocalityRepository.getMappings(criteria);
    }
}
