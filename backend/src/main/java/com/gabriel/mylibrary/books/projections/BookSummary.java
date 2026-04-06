package com.gabriel.mylibrary.books.projections;

import java.util.Set;
import java.util.UUID;
import com.gabriel.mylibrary.common.enums.BookStatus;

public interface BookSummary {
    UUID getId();
    String getTitle();
    String getAuthor();
    String getCoverUrl();
    Integer getRating();
    Integer getPages();
    Integer getPagesRead();
    BookStatus getStatus();
    Set<CategorySummary> getCategories();

    interface CategorySummary {
        UUID getId();
        String getName();
    }
}
