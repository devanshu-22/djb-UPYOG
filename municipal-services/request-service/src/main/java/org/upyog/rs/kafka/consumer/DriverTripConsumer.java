package org.upyog.rs.kafka.consumer;


import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.upyog.rs.repository.DriverTripRepository;
import org.upyog.rs.web.models.DriverTripRequest;

import java.util.HashMap;

@Slf4j
@Component
public class DriverTripConsumer {

    @Autowired
    private DriverTripRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(
            topics = "${kafka.topics.save.driver.trip}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void saveTrip(HashMap<String, Object> record) {
        try {
            DriverTripRequest request = objectMapper.convertValue(record, DriverTripRequest.class);
            repository.save(request.getDriverTrip());
            log.info("Driver trip saved for bookingNo: {}", request.getDriverTrip().getBookingNo());
        } catch (Exception e) {
            log.error("Error consuming save-driver-trip message", e);
        }
    }

    @KafkaListener(
            topics = "${kafka.topics.update.driver.trip}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void updateTrip(HashMap<String, Object> record) {
        try {
            DriverTripRequest request = objectMapper.convertValue(record, DriverTripRequest.class);
            repository.update(request.getDriverTrip());
            log.info("Driver trip updated for bookingNo: {}", request.getDriverTrip().getBookingNo());
        } catch (Exception e) {
            log.error("Error consuming update-driver-trip message", e);
        }
    }
}