package com.gabriel.mylibrary.gamification;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.user.UserEntity;
import com.gabriel.mylibrary.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExperienceService {

  private final UserRepository userRepository;

  /**
   * Awards XP to a user, handling level-ups with carry-over.
   * Formula: xpForNextLevel = currentLevel * 100
   * totalExperience is a lifetime accumulator (never resets).
   * currentXp resets to 0 on each level-up (carrying over the remainder).
   */
  @Transactional
  public void rewardActivity(UUID userId, XpType type, int amount) {
    UserEntity user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Unable to process XP reward. No user found with the provided ID."));

    long xpGain = calculateXp(type, amount);
    user.setTotalExperience(user.getTotalExperience() + xpGain);

    long newCurrentXp = user.getCurrentXp() + xpGain;
    int currentLevel = user.getLevel();

    // Multi-level-up loop: each level costs (level * 100) XP
    while (true) {
      long threshold = (long) currentLevel * 100;
      if (newCurrentXp >= threshold) {
        newCurrentXp -= threshold;
        currentLevel++;
      } else {
        break;
      }
    }

    user.setCurrentXp(newCurrentXp);
    user.setLevel(currentLevel);
    userRepository.save(user);
  }

  private long calculateXp(XpType type, int amount) {
    return switch (type) {
      case PAGES_READ -> amount;           // +1 XP per page
      case BOOK_COMPLETED -> 100;          // +100 XP flat
      case DAILY_STREAK -> 50;             // +50 XP flat
      case ACHIEVEMENT_EARNED -> amount;   // variable, passed as amount
    };
  }
}
