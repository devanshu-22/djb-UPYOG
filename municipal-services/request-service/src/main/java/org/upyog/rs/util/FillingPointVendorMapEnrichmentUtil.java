package org.upyog.rs.util;

import org.springframework.stereotype.Component;
import org.upyog.rs.web.models.AuditDetails;
import org.upyog.rs.web.models.fillingpoint.vendor.FillingPointVendorMapRequest;

import java.util.UUID;
@Component
public class FillingPointVendorMapEnrichmentUtil {

    public void enrichCreate(FillingPointVendorMapRequest request) {

        request.getMappings().forEach(map -> {

            String uuid = UUID.randomUUID().toString();
            long time = System.currentTimeMillis();

            map.setId(uuid);

            AuditDetails audit = AuditDetails.builder()
                    .createdBy(request.getRequestInfo().getUserInfo().getUuid())
                    .lastModifiedBy(request.getRequestInfo().getUserInfo().getUuid())
                    .createdTime(time)
                    .lastModifiedTime(time)
                    .build();

            map.setAuditDetails(audit);
        });
    }
}
