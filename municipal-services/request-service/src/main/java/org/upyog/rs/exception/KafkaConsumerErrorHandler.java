package org.upyog.rs.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.listener.CommonLoggingErrorHandler;

public class KafkaConsumerErrorHandler extends CommonLoggingErrorHandler {
    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerErrorHandler.class);
}
