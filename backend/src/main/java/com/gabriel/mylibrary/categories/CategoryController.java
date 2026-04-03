package com.gabriel.mylibrary.categories;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.categories.dtos.CategoryDTO;
import com.gabriel.mylibrary.categories.dtos.CreateCategoryDTO;
import com.gabriel.mylibrary.categories.dtos.UpdateCategoryDTO;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

  private final CategoryService categoryService;

  @GetMapping
  public ResponseEntity<List<CategoryDTO>> getAllCategories(@AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(categoryService.findAll(user.getId()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable UUID id, @AuthenticationPrincipal UserEntity user) {
    CategoryDTO category = categoryService.findOne(id, user.getId());
    return ResponseEntity.ok(category);
  }

  @PostMapping
  public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CreateCategoryDTO category,
      @AuthenticationPrincipal UserEntity user) {
    CategoryDTO savedCategory = categoryService.create(category, user.getId());
    return ResponseEntity.ok(savedCategory);
  }

  @PutMapping("/{id}")
  public ResponseEntity<CategoryDTO> updateCategory(@PathVariable UUID id, @Valid @RequestBody UpdateCategoryDTO category,
      @AuthenticationPrincipal UserEntity user) {
    CategoryDTO updatedCategory = categoryService.update(id, user.getId(), category);
    return ResponseEntity.ok(updatedCategory);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteCategory(@PathVariable UUID id, @AuthenticationPrincipal UserEntity user) {
    categoryService.delete(id, user.getId());
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
  }
}
