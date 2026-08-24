package com.example.security.model;

import java.util.ArrayList;
import java.util.List;

public class ItemImportResult {
    private int created = 0;
    private List<RowError> errors = new ArrayList<>();

    public void incrementCreated() {
        created++;
    }

    public void addError(int row, String message) {
        errors.add(new RowError(row, message));
    }

    public int getCreated() {
        return created;
    }

    public List<RowError> getErrors() {
        return errors;
    }

    public static class RowError {
        private int row;
        private String message;

        public RowError() {
        }

        public RowError(int row, String message) {
            this.row = row;
            this.message = message;
        }

        public int getRow() {
            return row;
        }

        public void setRow(int row) {
            this.row = row;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
