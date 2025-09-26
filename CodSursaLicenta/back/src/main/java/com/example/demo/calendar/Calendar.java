package com.example.demo.calendar;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.example.demo.event.Event;
import com.example.demo.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "calendars")
@EntityListeners(AuditingEntityListener.class)
public class Calendar {
  @Id
  @GeneratedValue 
  private Integer id;
  private String nameCalendar;
  private String color;

  @ManyToOne
  @JoinColumn(nullable = false, name = "owner_id")
  private User owner;

  @OneToMany(mappedBy = "calendar", fetch = FetchType.EAGER)
  private List<Event> events ;

  @CreatedDate
  @Column(updatable = false, nullable = false)
  private LocalDateTime createdDate;
  @LastModifiedDate
  @Column(insertable = false)
  private LocalDateTime lastModifiedDate;

  @Column(name = "is_primary")
  private boolean isPrimary;


  public String getUsername() {
    return owner.fullName();
  }


}
