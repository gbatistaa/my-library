package com.gabriel.mylibrary.books.googleBooks;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withResourceNotFound;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.gabriel.mylibrary.books.googleBooks.dto.GoogleBookVolumeDTO;
import com.gabriel.mylibrary.common.errors.GoogleBooksException;
import com.gabriel.mylibrary.common.errors.UnprocessableContentException;

class DefaultGoogleBooksClientServiceTest {

  private static final String BASE_URL = "https://books.test/v1";
  private static final String VOLUME_ID = "zyTCAlFPjgYC";

  private MockRestServiceServer server;
  private DefaultGoogleBooksClientService client;

  @BeforeEach
  void setUp() {
    RestClient.Builder builder = RestClient.builder().baseUrl(BASE_URL);
    server = MockRestServiceServer.bindTo(builder).build();
    RestClient restClient = builder.build();
    GoogleBooksProperties props = new GoogleBooksProperties(BASE_URL, null, 5000);
    client = new DefaultGoogleBooksClientService(restClient, props);
  }

  @Test
  void fetchByVolumeId_mapsAllFieldsAndNormalizesCategories() {
    String body = """
        {
          "id": "%s",
          "volumeInfo": {
            "title": "The Lord of the Rings",
            "authors": ["J.R.R. Tolkien", "Christopher Tolkien"],
            "pageCount": 1178,
            "industryIdentifiers": [
              {"type": "ISBN_10", "identifier": "0618640150"},
              {"type": "ISBN_13", "identifier": "9780618640157"}
            ],
            "imageLinks": {"thumbnail": "http://books.google.com/cover.jpg"},
            "description": "An epic high-fantasy novel.",
            "publishedDate": "1954",
            "publisher": "Allen & Unwin",
            "language": "en",
            "categories": ["Fiction", " Fantasy ", "fiction"]
          }
        }
        """.formatted(VOLUME_ID);

    server.expect(requestTo(BASE_URL + "/volumes/" + VOLUME_ID))
        .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

    Optional<GoogleBookVolumeDTO> result = client.fetchByVolumeId(VOLUME_ID);

    assertThat(result).isPresent();
    GoogleBookVolumeDTO dto = result.get();
    assertThat(dto.googleBooksId()).isEqualTo(VOLUME_ID);
    assertThat(dto.title()).isEqualTo("The Lord of the Rings");
    assertThat(dto.author()).isEqualTo("J.R.R. Tolkien, Christopher Tolkien");
    assertThat(dto.pages()).isEqualTo(1178);
    assertThat(dto.isbn()).isEqualTo("9780618640157");
    assertThat(dto.coverUrl()).isEqualTo("https://books.google.com/cover.jpg");
    assertThat(dto.categories()).containsExactlyInAnyOrder("fiction", "fantasy");
    server.verify();
  }

  @Test
  void fetchByVolumeId_returnsEmptyOn404() {
    server.expect(requestTo(BASE_URL + "/volumes/missing"))
        .andRespond(withResourceNotFound());

    assertThat(client.fetchByVolumeId("missing")).isEmpty();
    server.verify();
  }

  @Test
  void fetchByVolumeId_wraps5xxInGoogleBooksException() {
    server.expect(requestTo(BASE_URL + "/volumes/" + VOLUME_ID))
        .andRespond(withServerError());

    assertThatThrownBy(() -> client.fetchByVolumeId(VOLUME_ID))
        .isInstanceOf(GoogleBooksException.class);
    server.verify();
  }

  @Test
  void fetchByVolumeId_rejectsVolumeWithoutPageCount() {
    String body = """
        {
          "id": "%s",
          "volumeInfo": {
            "title": "No Pages",
            "authors": ["Anon"]
          }
        }
        """.formatted(VOLUME_ID);

    server.expect(requestTo(BASE_URL + "/volumes/" + VOLUME_ID))
        .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

    assertThatThrownBy(() -> client.fetchByVolumeId(VOLUME_ID))
        .isInstanceOf(UnprocessableContentException.class);
    server.verify();
  }
}
