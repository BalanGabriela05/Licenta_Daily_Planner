package com.example.demo.event;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.example.demo.calendar.Calendar;
import com.example.demo.user.User;



@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "events")
@EntityListeners(AuditingEntityListener.class)
public class Event {

    @Id
    @GeneratedValue
    private Integer id;
    private String title;
    private String description;
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;// 2025-03-06T14:30:00
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @ManyToOne
    @JoinColumn(nullable = false, name = "calendar_id")
    private Calendar calendar;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdDate;
    @LastModifiedDate
    @Column(insertable = false)
    private LocalDateTime lastModifiedDate;

    @Enumerated(EnumType.STRING)
    private PriorityLevel priority;
    @Enumerated(EnumType.STRING)
    private RecurrenceType recurrenceType;
    
    @ManyToOne
    @JoinColumn(nullable = false, name = "created_by_id")
    private User createdBy;

    // @CreatedBy
    // @Column(updatable = false, nullable = false)
    // private Integer createdBy;

    // @LastModifiedBy
    // @Column(insertable = false)
    // private Integer lastModifiedBy;
}
