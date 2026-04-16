package com.gabriel.mylibrary.bookClub.clubBookProgress;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClubBookProgressScheduler {

    private final ClubBookProgressService clubBookProgressService;

    /**
     * Runs daily at 02:00 server time.
     * Marks all progress records as UNFINISHED where:
     *   - the associated ClubBook has a non-null deadline
     *   - the deadline has passed (deadline < today)
     *   - the member status is still READING
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void markOverdueProgress() {
        log.info("[Scheduler] Running markOverdueProgressAsUnfinished job");
        int affected = clubBookProgressService.markAllOverdueAsUnfinished();
        log.info("[Scheduler] markOverdueProgressAsUnfinished job complete. Affected records: {}", affected);
    }
}
