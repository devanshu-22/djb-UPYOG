package org.upyog.rs.service.impl;

import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.upyog.rs.config.RequestServiceConfiguration;
import org.upyog.rs.kafka.Producer;
import org.upyog.rs.repository.FillingPointRepository;
import org.upyog.rs.repository.FillingPointVendorMapRepository;
import org.upyog.rs.service.EnrichmentService;
import org.upyog.rs.service.FillingPointService;
import org.upyog.rs.util.FillingPointVendorMapEnrichmentUtil;
import org.upyog.rs.util.VendorUtil;
import org.upyog.rs.web.models.Address;
import org.upyog.rs.web.models.fillingpoint.*;
import org.upyog.rs.web.models.fillingpoint.vendor.FillingPointVendorMap;
import org.upyog.rs.web.models.fillingpoint.vendor.FillingPointVendorMapRequest;
import org.upyog.rs.web.models.waterTanker.WaterTankerBookingDetail;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class FillingPointServiceImpl implements FillingPointService {

    @Autowired
    private EnrichmentService enrichmentService;

    @Autowired
    private FillingPointRepository repository;

    @Autowired
    private Producer producer;

    @Autowired
    private RequestServiceConfiguration config;

    @Autowired
    private VendorUtil vendorUtil;

    @Autowired
    private FillingPointVendorMapEnrichmentUtil enrichmentUtil;

    @Autowired
    private FillingPointVendorMapRepository vendorMapRepository;


    @Override
    public List<FillingPoint> create(FillingPointRequest request) {

        enrichmentService.enrichCreateFillingPointRequest(request);

        for (FillingPoint fp : request.getFillingPoints()) {
            FillingPointKafkaRequest kafkaRequest = new FillingPointKafkaRequest();
            kafkaRequest.setRequestInfo(request.getRequestInfo());
            kafkaRequest.setFillingPoint(fp);
            producer.push(config.getSaveFillingPointTopic(), kafkaRequest);
        }

        return request.getFillingPoints();
    }

    @Override
    public List<FillingPoint> createFromWaterTankerRequest(FillingPointRequest request) {

        WaterTankerBookingDetail wt = request.getWaterTankerBookingDetail();
        FillingPointMetadata meta = wt.getFillingPointMetadata();
        Address address = wt.getAddress();

        FillingPoint fp = new FillingPoint();

        fp.setFillingPointName(meta.getName());
        fp.setEmergencyName(meta.getName());

        fp.setEeName(meta.getEeName());
        fp.setEeEmail(meta.getEeEmailId());
        fp.setEeMobile(meta.getEeMobileNumber());

        fp.setJeName(meta.getJeName());
        fp.setJeEmail(meta.getJeEmailId());
        fp.setJeMobile(meta.getJeMobileNumber());

        fp.setAeName(meta.getAeName());
        fp.setAeEmail(meta.getAeEmailId());
        fp.setAeMobile(meta.getAeMobileNumber());

        fp.setTenantId(wt.getTenantId());

        fp.setAddress(address);
        fp.getAddress().setType("FILLING-POINT"); // ← ADDED

        request.setFillingPoints(Collections.singletonList(fp));

        enrichmentService.enrichCreateFillingPointRequest(request);

        FillingPointKafkaRequest kafkaRequest = new FillingPointKafkaRequest();
        kafkaRequest.setRequestInfo(request.getRequestInfo());
        kafkaRequest.setFillingPoint(fp);
        producer.push(config.getSaveFillingPointTopic(), kafkaRequest);

        return request.getFillingPoints();
    }

    @Override
    public FillingPointResponse search(FillingPointSearchCriteria criteria) {

        List<FillingPoint> list = repository.search(criteria);
        Integer count = repository.count(criteria);

        for (FillingPoint fp : list) {

            if ("EE".equalsIgnoreCase(criteria.getDesignation())) {
                fp.setAeName(null);   fp.setAeEmail(null);   fp.setAeMobile(null);
                fp.setJeName(null);   fp.setJeEmail(null);   fp.setJeMobile(null);

            } else if ("AE".equalsIgnoreCase(criteria.getDesignation())) {
                fp.setEeName(null);   fp.setEeEmail(null);   fp.setEeMobile(null);
                fp.setJeName(null);   fp.setJeEmail(null);   fp.setJeMobile(null);

            } else if ("JE".equalsIgnoreCase(criteria.getDesignation())) {
                fp.setEeName(null);   fp.setEeEmail(null);   fp.setEeMobile(null);
                fp.setAeName(null);   fp.setAeEmail(null);   fp.setAeMobile(null);
            }
        }
        return new FillingPointResponse(
                null,
                list,
                count,
                criteria.getOffset(),
                criteria.getLimit()
        );
    }

    @Override
    public List<FillingPoint> update(FillingPointRequest request) {

        enrichmentService.enrichUpdateFillingPointRequest(request);

        for (FillingPoint fp : request.getFillingPoints()) {
            FillingPointKafkaRequest kafkaRequest = new FillingPointKafkaRequest();
            kafkaRequest.setRequestInfo(request.getRequestInfo());
            kafkaRequest.setFillingPoint(fp);
            producer.push(config.getUpdateFillingPointTopic(), kafkaRequest);
        }

        return request.getFillingPoints();
    }
    public List<FillingPointVendorMap> mapVendor(FillingPointVendorMapRequest request) {

        for (FillingPointVendorMap map : request.getMappings()) {

            vendorUtil.validateVendor(map.getVendorId(), map.getTenantId());

            if (vendorMapRepository.isVendorAlreadyMapped(map.getVendorId())) {
                throw new CustomException("VENDOR_ALREADY_MAPPED",
                        "Vendor is already mapped to a filling point");
            }
        }
        enrichmentUtil.enrichCreate(request);
        producer.push(config.getSaveFillingPointVendorMappingTopic(), request);
        return request.getMappings();
    }
}