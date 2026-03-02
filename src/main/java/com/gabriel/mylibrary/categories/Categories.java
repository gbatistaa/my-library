package com.gabriel.mylibrary.categories;

import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class Categories extends BaseEntity {
  @Column(name = "category_name", nullable = false, length = 50)
  private String name;

  @Column(name = "description", nullable = true)
  private String description;
}
