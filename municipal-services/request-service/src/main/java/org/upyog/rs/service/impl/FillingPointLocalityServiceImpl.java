package org.upyog.rs.service.impl;

import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import org.upyog.rs.config.RequestServiceConfiguration;
import org.upyog.rs.kafka.Producer;
import org.upyog.rs.repository.FillingPointLocalityRepository;
import org.upyog.rs.service.EnrichmentService;
import org.upyog.rs.service.FillingPointLocalityService;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocality;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalityRequest;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalitySearchCriteria;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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
    @Transactional
    public List<FillingPointLocality> updateMapping(FillingPointLocalityRequest request) {
        enrichmentService.enrichUpdateRequest(request);
        List<FillingPointLocality> newLocalities = request.getFillingPointLocality();

        Set<String> fillingPointIds = newLocalities.stream()
                .map(FillingPointLocality::getFillingPointId)
                .collect(Collectors.toSet());

        for (String fillingPointId : fillingPointIds) {
            fillingPointLocalityRepository.deleteByFillingPointId(fillingPointId);
        }
        fillingPointLocalityRepository.saveAll(newLocalities);
        return newLocalities;
    }

    @Override
    public List<FillingPointLocality> searchMapping(FillingPointLocalitySearchCriteria criteria, RequestInfo requestInfo) {

        return fillingPointLocalityRepository.searchMapping(criteria);
    }

    @Override
    public Long getCount(FillingPointLocalitySearchCriteria criteria) {

        return fillingPointLocalityRepository.getCount(criteria);
    }
}
