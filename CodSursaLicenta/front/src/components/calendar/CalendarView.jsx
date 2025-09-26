"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from "date-fns"
import "./CalendarView.css"

const CalendarView = ({ viewMode, currentDate, events, onDayClick, selectedDate }) => {
  const [weekDays, setWeekDays] = useState([])
  const [monthDays, setMonthDays] = useState([])

  useEffect(() => {
    // Calculate week days
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    setWeekDays(eachDayOfInterval({ start, end }))

    // Calculate month days (full weeks view)
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
    setMonthDays(eachDayOfInterval({ start: startDate, end: endDate }))
  }, [currentDate])

  // Week View: 24h labels and events
  const renderWeekView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)

    // Group events by day
    const eventsByDay = weekDays.map(day =>
      events.filter(event => isSameDay(event.start, day))
    )

    return (
      <div className="week-view">
        <div className="time-info">{format(currentDate, 'MMMM yyyy')}</div>

        {/* Days header */}
        <div className="week-days-header">
          <div className="time-header-spacer"></div>
          {weekDays.map(day => (
            <div
              key={day.toString()}
              className={`week-day-header ${isSameDay(day, new Date()) ? 'today' : ''} ${isSameDay(day, selectedDate) ? 'selected' : ''}`}
              onClick={() => onDayClick && onDayClick(day)}
            >
              <div className="day-name">{format(day, 'EEE')}</div>
              <div className={`day-number ${isSameDay(day, new Date()) ? 'current-day' : ''}`}>{format(day, 'd')}</div>
            </div>
          ))}
        </div>

        {/* Time grid + events */}
        <div className="time-grid">
          <div className="time-labels">
            {hours.map(hour => (
              <div key={hour} className="time-label">
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className="days-grid">
            {weekDays.map((day, dayIndex) => (
              <div
                key={day.toString()}
                className={`day-column ${isSameDay(day, selectedDate) ? 'selected' : ''}`}
                onClick={() => onDayClick && onDayClick(day)}
              >
                <div className="day-events">
                  {/* Hour cells */}
                  {hours.map(hour => (
                    <div key={hour} className="hour-cell"></div>
                  ))}

                  {/* Render events */}
                  {eventsByDay[dayIndex].map((event, idx) => {
                    const startHour = event.start.getHours() + event.start.getMinutes()/60
                    const endHour = event.end.getHours() + event.end.getMinutes()/60
                    const duration = endHour - startHour
                    const top = (startHour) * 60 // from 00:00 baseline
                    const height = duration * 60

                    // Overlapping
                    const overlapping = eventsByDay[dayIndex].filter(e => {
                      const s = e.start.getHours() + e.start.getMinutes()/60
                      const eH = e.end.getHours() + e.end.getMinutes()/60
                      return startHour < eH && endHour > s
                    })
                    const width = 100 / overlapping.length
                    const left = overlapping.indexOf(event) * width

                    return (
                      <div
                        key={event.id}
                        className="event-item"
                        style={{ top: `${top}px`, height: `${height}px`, left: `${left}%`, width: `${width}%`, backgroundColor: event.color }}
                      >
                        <div className="event-title">{event.title}</div>
                        <div className="event-time">
                          {format(event.start, 'H:mm')} - {format(event.end, 'H:mm')}
                        </div>
                      </div>
                    )
                  })}

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Month View
  const renderMonthView = () => {
    const headers = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    return (
      <div className="month-view">
        <div className="month-header">
          <h2>{format(currentDate,'MMMM yyyy')}</h2>
        </div>
        <div className="month-grid">
          <div className="month-weekdays">
            {headers.map(d => <div key={d} className="month-weekday">{d}</div>)}
          </div>
          <div className="month-days">
            {monthDays.map((day,i) => {
              const dayEvents = events.filter(ev => isSameDay(ev.start,day))
              const isToday = isSameDay(day,new Date())
              const isCurrent = isSameMonth(day,currentDate)
              const isSelected = selectedDate && isSameDay(day,selectedDate)
              return (
                <div
                  key={i}
                  className={`month-day ${isToday?'today':''} ${isCurrent?'':'other-month'} ${isSelected?'selected':''}`}
                  onClick={() => onDayClick && onDayClick(day)}
                >
                  <div className={`month-day-number ${isToday?'current-day':''}`}>{format(day,'d')}</div>
                  <div className="month-day-events">
                    {dayEvents.slice(0,3).map(ev=>(
                      <div key={ev.id} className="month-event" style={{backgroundColor:ev.color}} title={`${ev.title} (${format(ev.start,'H:mm')} - ${format(ev.end,'H:mm')})`}>
                        <span className="month-event-title">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length>3 && <div className="month-more-events">+{dayEvents.length-3} more</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-view">
      {viewMode === "week" && renderWeekView()}
      {viewMode === "month" && renderMonthView()}
    </div>
  )
}

export default CalendarView
