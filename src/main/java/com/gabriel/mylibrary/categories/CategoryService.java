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

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

  private final CategoryRepository categoryRepository;
  private final CategoryMapper categoryMapper;

  @Transactional(readOnly = true)
  public List<CategoryDTO> findAll() {
    return categoryRepository.findAll()
        .stream()
        .map(categoryMapper::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public CategoryDTO findOne(UUID id) throws ResourceNotFoundException {
    return categoryRepository.findById(id)
        .map(categoryMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
  }

  @Transactional
  public CategoryDTO create(@Valid @RequestBody CreateCategoryDTO category) {
    CategoryEntity newCategory = categoryMapper.toEntity(category);
    if (categoryRepository.existsByTitle(category.getName())) {
      throw new ResourceConflictException("Category with this title already exists: " + category.getName());
    }

    CategoryEntity savedCategory = categoryRepository.save(newCategory);
    return categoryMapper.toDto(savedCategory);
  }

  @Transactional
  public CategoryDTO update(UUID id, @Valid @RequestBody UpdateCategoryDTO category) {
    CategoryEntity categoryEntity = categoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    categoryMapper.updateEntityFromDto(category, categoryEntity);
    CategoryEntity updatedCategory = categoryRepository.save(categoryEntity);
    return categoryMapper.toDto(updatedCategory);
  }

  @Transactional
  public void delete(UUID id) {
    if (!categoryRepository.existsById(id)) {
      throw new ResourceNotFoundException("Category not found with id: " + id);
    }
    categoryRepository.deleteById(id);
  }

}
