package com.gabriel.mylibrary.common.pipes;

import com.squareup.javapoet.*;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.*;
import javax.tools.Diagnostic;
import java.io.IOException;
import java.util.Set;

@SupportedAnnotationTypes("com.gabriel.mylibrary.common.pipes.DatabaseEntity")
@SupportedSourceVersion(SourceVersion.RELEASE_21)
public class DatabaseEntityProcessor extends AbstractProcessor {

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    for (Element element : roundEnv.getElementsAnnotatedWith(DatabaseEntity.class)) {
      if (element.getKind() != ElementKind.CLASS) {
        processingEnv.getMessager().printMessage(
            Diagnostic.Kind.ERROR,
            "@DatabaseEntity só pode ser usado em classes.",
            element);
        continue;
      }

      TypeElement typeElement = (TypeElement) element;
      DatabaseEntity annotation = typeElement.getAnnotation(DatabaseEntity.class);

      String tableName = annotation.tableName().isBlank()
          ? typeElement.getSimpleName().toString().toLowerCase()
          : annotation.tableName();

      String packageName = processingEnv.getElementUtils()
          .getPackageOf(typeElement)
          .getQualifiedName()
          .toString();

      String className = typeElement.getSimpleName() + "_Generated";

      // Gera a classe com @Entity, @Table, @Getter, @Setter, @NoArgsConstructor
      TypeSpec generatedClass = TypeSpec.classBuilder(className)
          .addModifiers(Modifier.PUBLIC)
          .addAnnotation(Entity.class)
          .addAnnotation(AnnotationSpec.builder(Table.class)
              .addMember("name", "$S", tableName)
              .build())
          .addAnnotation(Getter.class)
          .addAnnotation(Setter.class)
          .addAnnotation(NoArgsConstructor.class)
          .superclass(TypeName.get(typeElement.asType()))
          .build();

      JavaFile javaFile = JavaFile.builder(packageName, generatedClass)
          .addFileComment("Arquivo gerado automaticamente por DatabaseEntityProcessor. Não edite.")
          .build();

      try {
        javaFile.writeTo(processingEnv.getFiler());
      } catch (IOException e) {
        processingEnv.getMessager().printMessage(
            Diagnostic.Kind.ERROR,
            "Erro ao gerar a classe " + className + ": " + e.getMessage(),
            element);
      }
    }
    return true;
  }
}
