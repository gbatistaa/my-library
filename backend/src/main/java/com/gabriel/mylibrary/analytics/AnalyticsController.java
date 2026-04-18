package com.gabriel.mylibrary.analytics;

import com.gabriel.mylibrary.analytics.dtos.AnalyticsSummaryDTO;
import com.gabriel.mylibrary.analytics.dtos.AnalyticsTrendDTO;
import com.gabriel.mylibrary.analytics.dtos.AnalyticsDistributionDTO;
import com.gabriel.mylibrary.stats.dtos.HeatmapDTO;
import com.gabriel.mylibrary.user.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDTO> getSummary(
            @AuthenticationPrincipal UserEntity user,
            @RequestParam(defaultValue = "MONTH") String period) {
        return ResponseEntity.ok(analyticsService.getSummary(user.getId(), period));
    }

    @GetMapping("/trends")
    public ResponseEntity<AnalyticsTrendDTO> getTrends(
            @AuthenticationPrincipal UserEntity user,
            @RequestParam(defaultValue = "PAGES") String metric,
            @RequestParam(defaultValue = "MONTH") String period) {
        return ResponseEntity.ok(analyticsService.getTrends(user.getId(), metric, period));
    }

    @GetMapping("/distribution")
    public ResponseEntity<AnalyticsDistributionDTO> getDistribution(
            @AuthenticationPrincipal UserEntity user) {
        return ResponseEntity.ok(analyticsService.getDistribution(user.getId()));
    }

    @GetMapping("/heatmap")
    public ResponseEntity<HeatmapDTO> getHeatmap(
            @AuthenticationPrincipal UserEntity user,
            @RequestParam(defaultValue = "0") int year) {
        if (year == 0) {
            year = java.time.LocalDate.now().getYear();
        }
        return ResponseEntity.ok(analyticsService.getHeatmap(user.getId(), year));
    }
}
