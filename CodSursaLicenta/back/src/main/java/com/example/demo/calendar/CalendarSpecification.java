package com.example.demo.calendar;

import org.springframework.data.jpa.domain.Specification;

public class CalendarSpecification {
  
  public static Specification<Calendar> withOwnerId(Integer ownerId) {
    return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("owner").get("id"), ownerId);
  }
}
