package com.perfume.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

public class OrderNumberGenerator {

    private static final AtomicInteger counter = new AtomicInteger(1);

    public static String generate() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int seq = counter.getAndIncrement() % 10000;
        return String.format("PRF-%s-%04d", timestamp, seq);
    }
}
