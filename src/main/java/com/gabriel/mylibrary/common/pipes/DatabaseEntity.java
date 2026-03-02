package com.gabriel.mylibrary.common.pipes;

import java.lang.annotation.*;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.CLASS)
public @interface DatabaseEntity {
  /**
   * Nome da tabela no banco de dados.
   * Exemplo: @DatabaseEntity(tableName = "categories")
   */
  String tableName() default "";
}
