package org.upyog.rs.web.models;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TripHistorySearchResult {
    private List<TripHistory> trips;
    private Integer count;
}
