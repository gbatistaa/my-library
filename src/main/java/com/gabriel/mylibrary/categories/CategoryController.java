package com.gabriel.mylibrary.categories;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

  private final CategoryService categoryService;

  @GetMapping
  public ResponseEntity<List<CategoryDTO>> getAllCategories() {
    return ResponseEntity.ok(categoryService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable UUID id) {
    CategoryDTO category = categoryService.findOne(id);
    return ResponseEntity.ok(category);
  }

  @PostMapping
  public ResponseEntity<CategoryDTO> createCategory(@RequestBody CreateCategoryDTO category) {
    CategoryDTO savedCategory = categoryService.create(category);
    return ResponseEntity.ok(savedCategory);
  }

  @PutMapping("/{id}")
  public ResponseEntity<CategoryDTO> updateCategory(@PathVariable UUID id, @RequestBody UpdateCategoryDTO category) {
    CategoryDTO updatedCategory = categoryService.update(id, category);
    return ResponseEntity.ok(updatedCategory);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
    categoryService.delete(id);
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
  }
}
