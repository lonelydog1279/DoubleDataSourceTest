package com.hsbc.doubledatasourcetest.jpa.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "products")
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productName;

    private String category;

    private BigDecimal price;

    private Integer stock;

    private Timestamp createTime;
}
