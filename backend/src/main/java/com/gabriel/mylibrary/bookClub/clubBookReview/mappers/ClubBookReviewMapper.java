package com.gabriel.mylibrary.bookClub.clubBookReview.mappers;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.gabriel.mylibrary.bookClub.clubBookReview.ClubBookReviewEntity;
import com.gabriel.mylibrary.bookClub.clubBookReview.dtos.ClubBookReviewDTO;
import com.gabriel.mylibrary.bookClub.clubBookReview.dtos.UpdateClubBookReviewDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ClubBookReviewMapper {

  @Mapping(target = "clubBookId", source = "clubBook.id")
  @Mapping(target = "userId", source = "user.id")
  ClubBookReviewDTO toDto(ClubBookReviewEntity entity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  void updateFromDto(UpdateClubBookReviewDTO dto, @MappingTarget ClubBookReviewEntity entity);
}
