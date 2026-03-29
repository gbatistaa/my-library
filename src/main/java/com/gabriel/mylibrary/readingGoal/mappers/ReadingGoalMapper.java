package com.gabriel.mylibrary.readingGoal.mappers;

import com.gabriel.mylibrary.readingGoal.ReadingGoalEntity;
import com.gabriel.mylibrary.readingGoal.dtos.CreateReadingGoalDTO;
import com.gabriel.mylibrary.readingGoal.dtos.ReadingGoalDTO;
import com.gabriel.mylibrary.readingGoal.dtos.UpdateReadingGoalDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReadingGoalMapper {

  ReadingGoalEntity toEntity(CreateReadingGoalDTO dto);

  ReadingGoalDTO toDto(ReadingGoalEntity entity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  void updateEntityFromDto(UpdateReadingGoalDTO dto, @MappingTarget ReadingGoalEntity entity);
}
