package com.gabriel.mylibrary.books.googleBooks;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.gabriel.mylibrary.books.googleBooks.dto.GoogleBookVolumeDTO;
import com.gabriel.mylibrary.books.googleBooks.dto.GoogleVolumeResponse;
import com.gabriel.mylibrary.books.googleBooks.dto.GoogleVolumeResponse.IndustryIdentifier;
import com.gabriel.mylibrary.books.googleBooks.dto.GoogleVolumeResponse.VolumeInfo;
import com.gabriel.mylibrary.common.errors.GoogleBooksException;
import com.gabriel.mylibrary.common.errors.UnprocessableContentException;

@Service
public class DefaultGoogleBooksClientService implements GoogleBooksClientService {

  private static final Logger log = LoggerFactory.getLogger(DefaultGoogleBooksClientService.class);
  private static final int DESCRIPTION_MAX_LENGTH = 2000;

  private final RestClient googleBooksRestClient;
  private final GoogleBooksProperties props;

  public DefaultGoogleBooksClientService(RestClient googleBooksRestClient, GoogleBooksProperties props) {
    this.googleBooksRestClient = googleBooksRestClient;
    this.props = props;
  }

  @Override
  public Optional<GoogleBookVolumeDTO> fetchByVolumeId(String googleBooksId) {
    try {
      GoogleVolumeResponse response = googleBooksRestClient.get()
          .uri(uriBuilder -> uriBuilder
              .path("/volumes/{id}")
              .queryParamIfPresent("key", props.hasApiKey() ? Optional.of(props.apiKey()) : Optional.empty())
              .build(googleBooksId))
          .retrieve()
          .body(GoogleVolumeResponse.class);

      if (response == null) {
        return Optional.empty();
      }

      return Optional.of(toVolumeDto(response));
    } catch (HttpClientErrorException.NotFound e) {
      return Optional.empty();
    } catch (RestClientResponseException e) {
      HttpStatusCode status = e.getStatusCode();
      log.warn("Google Books API returned {} for volume {}", status, googleBooksId);
      throw new GoogleBooksException(
          "Failed to reach Google Books (status " + status.value() + ").", e);
    } catch (ResourceAccessException e) {
      log.warn("Google Books API network failure for volume {}: {}", googleBooksId, e.getMessage());
      throw new GoogleBooksException("Google Books API is unreachable.", e);
    }
  }

  private GoogleBookVolumeDTO toVolumeDto(GoogleVolumeResponse response) {
    VolumeInfo info = response.volumeInfo();
    if (info == null) {
      throw new UnprocessableContentException("Google Books volume payload is missing volumeInfo.");
    }

    String title = requireNonBlank(info.title(), "title");
    String author = joinAuthorsOrFail(info.authors());
    Integer pages = requirePositivePageCount(info.pageCount());

    return new GoogleBookVolumeDTO(
        response.id(),
        title,
        author,
        pages,
        extractIsbn(info.industryIdentifiers()),
        extractCoverUrl(info),
        truncate(info.description(), DESCRIPTION_MAX_LENGTH),
        info.publishedDate(),
        info.publisher(),
        info.language(),
        normalizeCategories(info.categories()));
  }

  private String requireNonBlank(String value, String field) {
    if (value == null || value.isBlank()) {
      throw new UnprocessableContentException("Google Books volume is missing required field: " + field + ".");
    }
    return value;
  }

  private String joinAuthorsOrFail(List<String> authors) {
    if (authors == null || authors.isEmpty()) {
      throw new UnprocessableContentException("Google Books volume is missing required field: author.");
    }
    return String.join(", ", authors);
  }

  private Integer requirePositivePageCount(Integer pageCount) {
    if (pageCount == null || pageCount < 1) {
      throw new UnprocessableContentException("Google Books volume is missing a valid page count.");
    }
    return pageCount;
  }

  private String extractIsbn(List<IndustryIdentifier> identifiers) {
    if (identifiers == null || identifiers.isEmpty()) {
      return null;
    }
    return identifiers.stream()
        .filter(id -> "ISBN_13".equals(id.type()))
        .map(IndustryIdentifier::identifier)
        .findFirst()
        .orElseGet(() -> identifiers.stream()
            .filter(id -> "ISBN_10".equals(id.type()))
            .map(IndustryIdentifier::identifier)
            .findFirst()
            .orElse(null));
  }

  private String extractCoverUrl(VolumeInfo info) {
    if (info.imageLinks() == null) {
      return null;
    }
    String url = info.imageLinks().thumbnail() != null
        ? info.imageLinks().thumbnail()
        : info.imageLinks().smallThumbnail();
    if (url == null) {
      return null;
    }
    return url.startsWith("http://") ? "https://" + url.substring("http://".length()) : url;
  }

  private Set<String> normalizeCategories(List<String> categories) {
    if (categories == null || categories.isEmpty()) {
      return Set.of();
    }
    Set<String> normalized = new LinkedHashSet<>();
    for (String category : categories) {
      if (category == null) {
        continue;
      }
      String trimmed = category.trim().toLowerCase(Locale.ROOT);
      if (!trimmed.isEmpty()) {
        normalized.add(trimmed);
      }
    }
    return normalized;
  }

  private String truncate(String value, int max) {
    if (value == null) {
      return null;
    }
    return value.length() <= max ? value : value.substring(0, max);
  }
}
