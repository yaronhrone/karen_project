package com.example.karen_project.repository.mapper;

import com.example.karen_project.model.Items;
import org.springframework.jdbc.core.RowMapper;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ItemMapper implements RowMapper<Items> {
    @Override
    public Items mapRow(ResultSet rs, int rowNum) throws SQLException {
        Items item = new Items();
        item.setId(rs.getInt("id"));
        item.setName( rs.getString("name"));
        item.setDescription(rs.getString("description"));
        item.setVeg(rs.getBoolean("isVeg"));
        item.setImage(rs.getString("image"));
        item.setPrice(rs.getBigDecimal(("price")));
        item.setCategory(rs.getString("category"));
        item.setDeleteImgId(rs.getString("delete_img_id"));

        return item;
    }
}