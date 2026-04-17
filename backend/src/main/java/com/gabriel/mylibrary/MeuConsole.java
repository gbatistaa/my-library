package com.gabriel.mylibrary;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.util.*;
import java.lang.reflect.Field;
import java.lang.reflect.Proxy;
import java.io.File;

public class MeuConsole {

  private static final Logger logger = LoggerFactory.getLogger(MeuConsole.class);
  private static final ObjectMapper objectMapper = new ObjectMapper()
      .enable(SerializationFeature.INDENT_OUTPUT);

  // Códigos ANSI para cores
  private static final String RESET = "\u001B[0m";
  private static final String RED = "\u001B[31m";
  private static final String GREEN = "\u001B[32m";
  private static final String YELLOW = "\u001B[33m";
  private static final String BLUE = "\u001B[34m";
  private static final String MAGENTA = "\u001B[35m";
  private static final String CYAN = "\u001B[36m";
  private static final String WHITE = "\u001B[37m";
  private static final String GRAY = "\u001B[90m";
  private static final String BOLD = "\u001B[1m";

  /**
   * Imprime qualquer objeto de forma colorida no terminal e salva em
   * objJavaLog.json
   *
   * @param objeto Objeto a ser impresso
   */
  public static void log(Object objeto) {
    logger.info(formatarValor(objeto));
    salvarNoJson(objeto);
  }

  /**
   * Imprime uma List de forma colorida e formatada e salva em objJavaLog.json
   *
   * @param lista List a ser impressa
   */
  public static void log(List<?> lista) {
    if (lista == null) {
      logger.info(CYAN + "null" + RESET);
      salvarNoJson(null);
      return;
    }

    if (lista.isEmpty()) {
      logger.info(BLUE + "[]" + RESET);
      salvarNoJson(lista);
      return;
    }

    StringBuilder sb = new StringBuilder();
    sb.append(BLUE).append("[ ").append(RESET);

    for (int i = 0; i < lista.size(); i++) {
      Object item = lista.get(i);
      sb.append(formatarValor(item));

      if (i < lista.size() - 1) {
        sb.append(GRAY).append(", ").append(RESET);
      }
    }

    sb.append(BLUE).append(" ]").append(RESET);
    logger.info(sb.toString());
    salvarNoJson(lista);
  }

  /**
   * Imprime uma List de forma expandida e salva em objJavaLog.json
   *
   * @param lista List a ser impressa
   */
  public static void logDetalhado(List<?> lista) {
    if (lista == null) {
      logger.info(CYAN + "null" + RESET);
      salvarNoJson(null);
      return;
    }

    if (lista.isEmpty()) {
      logger.info(BLUE + "[]" + RESET);
      salvarNoJson(lista);
      return;
    }

    StringBuilder sb = new StringBuilder();
    sb.append(BLUE).append("[").append(RESET).append("\n");

    for (int i = 0; i < lista.size(); i++) {
      Object item = lista.get(i);
      sb.append("  ");

      if (item != null && !isPrimitivo(item)) {
        sb.append(formatarObjeto(item));
      } else {
        sb.append(formatarValor(item));
      }

      if (i < lista.size() - 1) {
        sb.append(GRAY).append(",").append(RESET);
      }
      sb.append("\n");
    }

    sb.append(BLUE).append("]").append(RESET);
    logger.info(sb.toString());
    salvarNoJson(lista);
  }

  /**
   * Formata um valor individual com cor baseada em seu tipo
   */
  private static String formatarValor(Object valor) {
    if (valor == null) {
      return CYAN + "null" + RESET;
    }

    if (valor instanceof String) {
      return GREEN + "\"" + valor + "\"" + RESET;
    }

    if (valor instanceof Number) {
      return YELLOW + valor.toString() + RESET;
    }

    if (valor instanceof Boolean) {
      return MAGENTA + valor.toString() + RESET;
    }

    if (valor instanceof Character) {
      return GREEN + "'" + valor + "'" + RESET;
    }

    if (valor instanceof Map) {
      return formatarMap((Map<?, ?>) valor);
    }

    if (valor instanceof Collection) {
      return formatarColecaoCurta((Collection<?>) valor);
    }

    // Objetos customizados ou Proxies (Projections)
    if (!isPrimitivo(valor)) {
      return formatarObjeto(valor);
    }

    return WHITE + valor.toString() + RESET;
  }

  private static String formatarColecaoCurta(Collection<?> colecao) {
    StringBuilder sb = new StringBuilder();
    sb.append(BLUE + "[ " + RESET);
    int count = 0;
    for (Object item : colecao) {
      if (count >= 5)
        break;
      sb.append(formatarValor(item));
      if (count < Math.min(colecao.size(), 5) - 1)
        sb.append(GRAY + ", " + RESET);
      count++;
    }
    if (colecao.size() > 5)
      sb.append(GRAY + "... " + RESET).append(WHITE + "(" + colecao.size() + " items)" + RESET);
    sb.append(BLUE + " ]" + RESET);
    return sb.toString();
  }

  private static String formatarMap(Map<?, ?> map) {
    StringBuilder sb = new StringBuilder();
    sb.append(GRAY + "{" + RESET);
    List<String> entries = new ArrayList<>();
    map.forEach((k, v) -> {
      entries.add(CYAN + k + RESET + ": " + formatarValor(v));
    });
    sb.append(String.join(GRAY + ", " + RESET, entries));
    sb.append(GRAY + "}" + RESET);
    return sb.toString();
  }

  /**
   * Formata um objeto customizado mostrando seus atributos
   */
  private static String formatarObjeto(Object objeto) {
    if (objeto == null)
      return CYAN + "null" + RESET;

    StringBuilder sb = new StringBuilder();
    Class<?> classe = objeto.getClass();

    // Se for um Proxy (comum em Projections do Spring Data JPA)
    if (Proxy.isProxyClass(classe)) {
      sb.append(BOLD + "ProjectionProxy" + RESET).append(" ");
      return sb.toString() + formatarProxy(objeto);
    }

    sb.append(BOLD + classe.getSimpleName() + RESET);
    sb.append(" ");
    sb.append(GRAY + "{" + RESET);

    Field[] fields = classe.getDeclaredFields();
    List<String> atributos = new ArrayList<>();

    for (Field field : fields) {
      // Pular campos estáticos ou sintéticos
      if (java.lang.reflect.Modifier.isStatic(field.getModifiers()) || field.isSynthetic())
        continue;

      field.setAccessible(true);
      try {
        String nome = field.getName();
        Object valor = field.get(objeto);
        String valorFormatado = formatarValor(valor);
        atributos.add(CYAN + nome + RESET + ": " + valorFormatado);
      } catch (IllegalAccessException e) {
        atributos.add(CYAN + field.getName() + RESET + ": " + RED + "[erro]" + RESET);
      }
    }

    sb.append(String.join(GRAY + ", " + RESET, atributos));
    sb.append(GRAY + "}" + RESET);

    return sb.toString();
  }

  private static String formatarProxy(Object proxy) {
    // Para proxies, tentamos chamar os métodos getters
    StringBuilder sb = new StringBuilder();
    sb.append(GRAY + "{" + RESET);
    List<String> atributos = new ArrayList<>();

    for (java.lang.reflect.Method method : proxy.getClass().getMethods()) {
      if (method.getName().startsWith("get") && method.getParameterCount() == 0
          && !method.getName().equals("getClass")) {
        try {
          String nome = method.getName().substring(3);
          nome = nome.substring(0, 1).toLowerCase() + nome.substring(1);
          Object valor = method.invoke(proxy);
          atributos.add(CYAN + nome + RESET + ": " + formatarValor(valor));
        } catch (Exception e) {
          // Ignora erros ao invocar métodos
        }
      }
    }

    sb.append(String.join(GRAY + ", " + RESET, atributos));
    sb.append(GRAY + "}" + RESET);
    return sb.toString();
  }

  /**
   * Verifica se o valor é um tipo primitivo ou wrapper
   */
  private static boolean isPrimitivo(Object valor) {
    return valor instanceof String ||
        valor instanceof Number ||
        valor instanceof Boolean ||
        valor instanceof Character;
  }

  /**
   * Salva o objeto em formato JSON no arquivo objJavaLog.json
   */
  private static void salvarNoJson(Object objeto) {
    try {
      // Localiza a pasta do projeto e o caminho do arquivo
      String path = "src/main/java/com/samu/objJavaLog.json";
      File file = new File(path);

      // Prepara o objeto para ser serializável (converte Proxies/Projections para
      // Map)
      Object serializavel = prepararParaJson(objeto);

      // Escreve no arquivo (sobrescrevendo o conteúdo anterior)
      objectMapper.writeValue(file, serializavel);

    } catch (Exception e) {
      logger.error("Erro ao salvar no arquivo JSON: " + e.getMessage());
    }
  }

  /**
   * Converte objetos complexos (como Proxies do Hibernate/Spring Data) em Maps
   * para que o Jackson consiga serializar corretamente.
   */
  private static Object prepararParaJson(Object obj) {
    if (obj == null)
      return null;
    if (isPrimitivo(obj))
      return obj;

    if (obj instanceof Collection) {
      List<Object> list = new ArrayList<>();
      for (Object item : (Collection<?>) obj) {
        list.add(prepararParaJson(item));
      }
      return list;
    }

    if (obj instanceof Map) {
      Map<Object, Object> map = new LinkedHashMap<>();
      ((Map<?, ?>) obj).forEach((k, v) -> map.put(k, prepararParaJson(v)));
      return map;
    }

    if (Proxy.isProxyClass(obj.getClass())) {
      return converterProxyParaMap(obj);
    }

    return obj;
  }

  private static Map<String, Object> converterProxyParaMap(Object proxy) {
    Map<String, Object> map = new LinkedHashMap<>();
    for (java.lang.reflect.Method method : proxy.getClass().getMethods()) {
      if (method.getName().startsWith("get") && method.getParameterCount() == 0
          && !method.getName().equals("getClass")) {
        try {
          String nome = method.getName().substring(3);
          nome = Character.toLowerCase(nome.charAt(0)) + nome.substring(1);
          map.put(nome, prepararParaJson(method.invoke(proxy)));
        } catch (Exception e) {
        }
      }
    }
    return map;
  }

  // ===== EXEMPLO DE USO =====

  static class Pessoa {
    String nome;
    int idade;
    String email;

    public Pessoa(String nome, int idade, String email) {
      this.nome = nome;
      this.idade = idade;
      this.email = email;
    }

    @Override
    public String toString() {
      return "Pessoa{" +
          "nome='" + nome + '\'' +
          ", idade=" + idade +
          ", email='" + email + '\'' +
          '}';
    }
  }

  static class Produto {
    String descricao;
    double preco;
    boolean disponivel;

    public Produto(String descricao, double preco, boolean disponivel) {
      this.descricao = descricao;
      this.preco = preco;
      this.disponivel = disponivel;
    }
  }

  public static void main(String[] args) {
    System.out.println(BOLD + "\n=== EXEMPLO 1: Lista com valores primitivos ===" + RESET);
    List<Object> lista1 = new ArrayList<>();
    lista1.add("João Silva");
    lista1.add(25);
    lista1.add(true);
    lista1.add(3.14);
    MeuConsole.log(lista1);

    System.out.println(BOLD + "\n=== EXEMPLO 2: Lista com objetos customizados ===" + RESET);
    List<Pessoa> lista2 = new ArrayList<>();
    lista2.add(new Pessoa("Maria", 30, "maria@email.com"));
    lista2.add(new Pessoa("João", 28, "joao@email.com"));
    MeuConsole.log(lista2);

    System.out.println(BOLD + "\n=== EXEMPLO 3: Lista detalhada (expandida) ===" + RESET);
    MeuConsole.logDetalhado(lista2);

    System.out.println(BOLD + "\n=== EXEMPLO 4: Lista com tipos mistos ===" + RESET);
    List<Object> lista3 = new ArrayList<>();
    lista3.add("Produto: Notebook");
    lista3.add(new Produto("Laptop Dell", 3500.00, true));
    lista3.add(42);
    lista3.add(new Pessoa("Carlos", 35, "carlos@email.com"));
    lista3.add(false);
    MeuConsole.log(lista3);

    System.out.println(BOLD + "\n=== EXEMPLO 5: Lista vazia ===" + RESET);
    MeuConsole.log(new ArrayList<>());

    System.out.println(BOLD + "\n=== EXEMPLO 6: Lista com null ===" + RESET);
    MeuConsole.log(null);
  }
}
