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

  @Transactional
  public void rewardActivity(UUID userId, XpType type, int amount) {
    UserEntity user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

    long xpGain = calculateXp(type, amount);
    user.setTotalExperience(user.getTotalExperience() + xpGain);
    user.setLevel(calculateLevel(user.getTotalExperience()));
    userRepository.save(user);
  }

  private long calculateXp(XpType type, int amount) {
    return switch (type) {
      case PAGES_READ -> amount;           // +1 XP per page
      case BOOK_COMPLETED -> 100;          // +100 XP flat bonus
      case DAILY_STREAK -> 50;             // +50 XP flat bonus
    };
  }

  static int calculateLevel(long totalXp) {
    return (int) Math.floor(Math.sqrt(totalXp) / 10) + 1;
  }
}
