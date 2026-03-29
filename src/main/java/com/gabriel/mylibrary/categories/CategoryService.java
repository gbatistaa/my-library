package com.gabriel.mylibrary.categories;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import com.gabriel.mylibrary.categories.dtos.CategoryDTO;
import com.gabriel.mylibrary.categories.dtos.CreateCategoryDTO;
import com.gabriel.mylibrary.categories.dtos.UpdateCategoryDTO;
import com.gabriel.mylibrary.categories.mappers.CategoryMapper;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

  private final CategoryRepository categoryRepository;
  private final CategoryMapper categoryMapper;
  private final EntityManager entityManager;

  @Transactional(readOnly = true)
  public List<CategoryDTO> findAll(UUID userId) {
    return categoryRepository.findAllByUserId(userId)
        .stream()
        .map(categoryMapper::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public CategoryDTO findOne(UUID id, UUID userId) throws ResourceNotFoundException {
    return categoryRepository.findByIdAndUserId(id, userId)
        .map(categoryMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
  }

  @Transactional
  public CategoryDTO create(@RequestBody CreateCategoryDTO category, UUID userId) {
    CategoryEntity newCategory = categoryMapper.toEntity(category);
    if (categoryRepository.existsByNameAndUserId(category.getName(), userId)) {
      throw new ResourceConflictException("Category with this name already exists: " + category.getName());
    }

    UserEntity userRef = entityManager.getReference(UserEntity.class, userId);
    newCategory.setUser(userRef);

    CategoryEntity savedCategory = categoryRepository.save(newCategory);
    return categoryMapper.toDto(savedCategory);
  }

  @Transactional
  public CategoryDTO update(UUID id, UUID userId, @RequestBody UpdateCategoryDTO category) {
    CategoryEntity categoryEntity = categoryRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    categoryMapper.updateEntityFromDto(category, categoryEntity);
    CategoryEntity updatedCategory = categoryRepository.save(categoryEntity);
    return categoryMapper.toDto(updatedCategory);
  }

  @Transactional
  public void delete(UUID id, UUID userId) {
    CategoryEntity category = categoryRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    categoryRepository.delete(category);
  }

}
