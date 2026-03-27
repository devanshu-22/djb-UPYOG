package org.upyog.rs.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class VendorUtil {
    private final RestTemplate restTemplate = new RestTemplate();

    public void validateVendor(String vendorId, String tenantId) {

        // TODO: call vendor search API
        // Example URL:
        // http://localhost:8086/vendor/v1/_search

        // For now (basic validation)
        if (vendorId == null || tenantId == null) {
            throw new RuntimeException("Invalid vendor or tenant");
        }

        // Later: call actual API and validate response
        log.info("Vendor validated: {}", vendorId);
    }
}
