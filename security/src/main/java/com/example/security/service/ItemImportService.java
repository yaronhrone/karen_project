package com.example.security.service;

import com.example.security.model.Item;
import com.example.security.model.ItemImportResult;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Service
public class ItemImportService {
    @Autowired
    private ItemService itemService;
    @Value("${aws.s3.bucket}")
    private String s3Bucket;
    @Value("${aws.s3.region}")
    private String s3Region;

    private static final Set<String> VALID_CATEGORIES = Set.of("chocolate", "cake", "cookie");

    // Expected header row: name, description, price, category, veg, image_url
    // (image_url may be blank - product gets created with no photo, same as
    // the existing seed placeholders).
    public ItemImportResult importItemsFromCsv(InputStream csvInput) throws IOException {
        ItemImportResult result = new ItemImportResult();

        CSVParser parser = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreSurroundingSpaces(true)
                .setTrim(true)
                .build()
                .parse(new InputStreamReader(csvInput, StandardCharsets.UTF_8));

        for (CSVRecord record : parser) {
            // +2: 1-indexed, plus the header row itself, so this matches the
            // row number Yaron would actually see if he opened the CSV in a
            // spreadsheet app.
            int rowNumber = (int) record.getRecordNumber() + 1;
            try {
                importRow(record, rowNumber, result);
            } catch (Exception e) {
                // A single malformed row (missing column, etc.) should not
                // abort the rest of the import.
                result.addError(rowNumber, "שגיאה לא צפויה: " + e.getMessage());
            }
        }

        return result;
    }

    private void importRow(CSVRecord record, int rowNumber, ItemImportResult result) {
        String name = getField(record, "name");
        if (name == null || name.isBlank()) {
            result.addError(rowNumber, "שם מוצר חסר");
            return;
        }

        String category = getField(record, "category");
        if (category == null || !VALID_CATEGORIES.contains(category)) {
            result.addError(rowNumber, "קטגוריה לא תקינה (" + category + ") - חייבת להיות אחת מ-chocolate/cake/cookie");
            return;
        }

        BigDecimal price;
        try {
            price = new BigDecimal(getField(record, "price"));
            if (price.signum() <= 0) {
                result.addError(rowNumber, "מחיר חייב להיות חיובי");
                return;
            }
        } catch (Exception e) {
            result.addError(rowNumber, "מחיר לא תקין (" + getField(record, "price") + ")");
            return;
        }

        String description = getField(record, "description");
        boolean veg = "true".equalsIgnoreCase(getField(record, "veg")) || "1".equals(getField(record, "veg"));
        // Was: downloaded whatever URL the row gave and re-uploaded it to
        // Cloudinary (a network fetch that could fail on its own, e.g. a
        // Google Drive share link). Now the URL is stored as-is - it's
        // already meant to be a stable S3 URL (see the admin UI's own
        // guidance), so there's nothing to re-host.
        String imageUrl = getField(record, "image_url");
        String imageKey = s3KeyIfOurBucket(imageUrl);

        Item item = new Item();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setCategory(category);
        item.setVeg(veg);
        item.setImage((imageUrl == null || imageUrl.isBlank()) ? null : imageUrl);
        item.setDeleteImgId(imageKey);

        // itemService.createItem's return value is the real signal - it can
        // fail for reasons that don't throw (name already taken, the
        // internal items-service call rejected, ...), so it has to be
        // checked rather than assuming the row was created.
        String createResult = itemService.createItem(item);
        if (createResult != null && createResult.contains("created")) {
            result.incrementCreated();
        } else {
            result.addError(rowNumber, "יצירת המוצר נכשלה: " + createResult);
        }
    }

    private String getField(CSVRecord record, String column) {
        return record.isMapped(column) ? record.get(column) : null;
    }

    // If the given image URL is already hosted in our own S3 bucket,
    // extract its object key so a later admin delete can also remove the
    // file from S3 - same field a Cloudinary public_id used to live in.
    // Any other URL (or none) just leaves this null, matching S3Service's
    // graceful no-op on a null/blank key.
    private String s3KeyIfOurBucket(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }
        String prefix = "https://" + s3Bucket + ".s3." + s3Region + ".amazonaws.com/";
        return imageUrl.startsWith(prefix) ? imageUrl.substring(prefix.length()) : null;
    }
}
