package com.gabriel.mylibrary.achievement;

import lombok.Getter;

@Getter
public enum AchievementDefinition {

  // === VOLUME & CONSISTÊNCIA ===
  FIRST_BOOK("Primeira Página Virada", "Completar o 1º livro", "VOLUME", 1),
  BOOKWORM("Rato de Biblioteca", "Completar 10 livros", "VOLUME", 10),
  CENTURION("Centurião", "Completar 100 livros", "VOLUME", 100),
  PAGE_TURNER("Virador de Páginas", "Ler 10.000 páginas no total", "VOLUME", 10000),
  IRON_READER("Leitor de Ferro", "Streak de 30 dias", "VOLUME", 30),
  HABIT_FORMED("Hábito Formado", "Streak de 7 dias", "VOLUME", 7),

  // === VELOCIDADE & INTENSIDADE ===
  SPEED_DEMON("Devorador", "Completar um livro em menos de 3 dias", "VELOCITY", 3),
  MARATHON("Maratonista", "Sessão de 3+ horas em um dia", "VELOCITY", 180),
  BINGE_READER("Compulsivo", "Completar 3 livros em uma semana", "VELOCITY", 3),

  // === DIVERSIDADE & EXPLORAÇÃO ===
  GENRE_EXPLORER("Explorador", "Ler em 5 gêneros diferentes", "DIVERSITY", 5),
  SAGA_SLAYER("Caçador de Sagas", "Completar uma saga inteira", "DIVERSITY", 1),
  NEW_VOICE("Descobridor", "Ler 10 autores pela 1ª vez", "DIVERSITY", 10),
  CONTRARIAN("Contrário", "Dar 1 estrela e 5 estrelas no mesmo mês", "DIVERSITY", 1),

  // === METAS & SUPERAÇÃO ===
  GOAL_CRUSHER("Esmagador de Metas", "Superar meta anual em 20%+", "GOALS", 1),
  COMEBACK_KID("De Volta ao Jogo", "Retomar leitura após 14+ dias sem ler", "GOALS", 14),
  DNF_ZERO("Sem Arrependimentos", "Ano completo sem nenhum livro DROPPED", "GOALS", 1);

  private final String name;
  private final String description;
  private final String category;
  private final int threshold;

  AchievementDefinition(String name, String description, String category, int threshold) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.threshold = threshold;
  }
}
