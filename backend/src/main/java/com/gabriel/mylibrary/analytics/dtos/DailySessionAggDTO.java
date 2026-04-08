package com.gabriel.mylibrary.analytics.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.sql.Date;

@Data
@NoArgsConstructor
public class DailySessionAggDTO {
    private LocalDate sessionDate;
    private long totalPages;
    private long totalDuration;
    private long sessionCount;

    public DailySessionAggDTO(LocalDate sessionDate, long totalPages, long totalDuration, long sessionCount) {
        this.sessionDate = sessionDate;
        this.totalPages = totalPages;
        this.totalDuration = totalDuration;
        this.sessionCount = sessionCount;
    }

    public DailySessionAggDTO(Date sessionDate, long totalPages, long totalDuration, long sessionCount) {
        this.sessionDate = sessionDate.toLocalDate();
        this.totalPages = totalPages;
        this.totalDuration = totalDuration;
        this.sessionCount = sessionCount;
    }
}
