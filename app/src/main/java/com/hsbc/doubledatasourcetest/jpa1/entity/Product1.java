package com.hsbc.doubledatasourcetest.jpa1.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "product")
@Data
public class Product1 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productName;

    private String category;

    private BigDecimal price;

    private Integer stock;

    private Timestamp createTime;
}
