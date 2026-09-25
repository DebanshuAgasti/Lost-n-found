package com.lostfound.ml.scorers;

import com.lostfound.config.MatchingEngineProperties;
import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.LostItem;
import org.springframework.stereotype.Component;

@Component
public class GeoProximityScorer {

    private final MatchingEngineProperties properties;
    private static final double EARTH_RADIUS_KM = 6371.0;

    public GeoProximityScorer(MatchingEngineProperties properties) {
        this.properties = properties;
    }

    public double calculateScore(LostItem lostItem, FoundItem foundItem) {
        Double lat1 = lostItem.getLatitude();
        Double lon1 = lostItem.getLongitude();
        Double lat2 = foundItem.getLatitude();
        Double lon2 = foundItem.getLongitude();

        // 1. If both coordinates are available, calculate Haversine distance
        if (lat1 != null && lon1 != null && lat2 != null && lon2 != null) {
            double distanceKm = haversine(lat1, lon1, lat2, lon2);
            double maxKm = properties.getMaxProximityKm();

            if (distanceKm <= 0.5) {
                return 1.0;
            }
            if (distanceKm >= maxKm) {
                return 0.0;
            }
            // Linear decay from 1.0 at 0.5km down to 0.0 at maxKm
            return 1.0 - ((distanceKm - 0.5) / (maxKm - 0.5));
        }

        // 2. Fall back to City matching if coordinates are missing
        String city1 = lostItem.getCity();
        String city2 = foundItem.getCity();

        if (city1 != null && !city1.trim().isEmpty() && city2 != null && !city2.trim().isEmpty()) {
            if (city1.trim().equalsIgnoreCase(city2.trim())) {
                return 0.85; // Strong indication when cities match
            } else {
                return 0.10; // Explicitly different cities
            }
        }

        // 3. Fall back to neutral score if location is unknown
        return 0.50;
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
