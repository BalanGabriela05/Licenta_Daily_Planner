"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom";
import CalendarView from "../../components/calendar/CalendarView"
import TaskList from "../../components/tasks/TaskList"
import AddTaskModal from "../../components/tasks/AddTaskModal"
import UpdateTaskModal from "../../components/tasks/UpdateTaskModal"
import AIChat from "../../components/chat/AIChat"
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "react-feather"
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, format, subWeeks, subMonths } from "date-fns"
import { getUserCalendars, getSharedCalendars, getEventsByCalendar, deleteEvent, updateEvent, getEventsFromSharedCalendar } from "../../api/api";
import "./Dashboard.css"

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Dashboard = ({ user }) => {
  if (!user) return <div>Loading...</div>;

  const [viewMode, setViewMode] = useState("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [events, setEvents] = useState([])
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [mainCalendar, setMainCalendar] = useState(null);


  const query = useQuery();
  const calendarIdFromQuery = query.get("calendarId");
  const ownerNameFromQuery = query.get("ownerName");

  const fetchEventsForMainCalendar = async (calendarIdOverride) => {
    try {
      const [personalRes, sharedRes] = await Promise.all([
        getUserCalendars(),
        getSharedCalendars()
      ]);
      const calendars = [
        ...personalRes.data,
        ...sharedRes.data.map(cal => ({
          ...cal,
          id: cal.calendarId, // normalizează cheia pentru ușurință
          nameCalendar: cal.calendarName || cal.nameCalendar,
          color: cal.color,
        }))
      ];
      // console.log("Fetched calendars:", calendars);
      let mainCal;
      if (calendarIdOverride) {
        mainCal = calendars.find(cal =>
          String(cal.id) === String(calendarIdOverride)
        );
      }
      if (!mainCal) {
        mainCal = calendars.find(cal => cal.primary || cal.isPrimary);
      }
      setMainCalendar(mainCal);

      if (!mainCal) {
        setEvents([]);
        return;
      }
      // const eventsRes = await getEventsByCalendar(mainCal.id);
      let eventsRes;
      if (mainCal.ownerName) {
        // Calendar partajat
        eventsRes = await getEventsFromSharedCalendar(mainCal.id);
      } else {
        // Calendar personal
        eventsRes = await getEventsByCalendar(mainCal.id);
      }
      const parsedEvents = eventsRes.data.map(ev => ({
        ...ev,
        start: new Date(ev.startTime),
        end: new Date(ev.endTime),
        color: ev.priority === "HIGH"
          ? "#ff9a8b"
          : ev.priority === "MEDIUM"
          ? "#ffd3b6"
          : ev.priority === "LOW"
          ? "#98ddca"
          : "#dbb8ff",
      }));
      setEvents(parsedEvents);
    } catch (err) {
      setEvents([]);
      console.error("Error fetching events:", err);
    }
  };
  // const fetchEventsForMainCalendar = async (calendarIdOverride) => {
  //   try {
  //     const calendarsRes = await getUserCalendars();
  //     const calendars = calendarsRes.data;

  //     let mainCal;
  //     if (calendarIdOverride) {
  //       mainCal = calendars.find(cal => 
  //         String(cal.id) === String(calendarIdOverride) ||
  //         String(cal.calendarId) === String(calendarIdOverride)
  //       );
  //     }
  //     if (!mainCal) {
  //       mainCal = calendars.find(cal => cal.primary);
  //     }
  //     setMainCalendar(mainCal);

  //     if (!mainCal) {
  //       setEvents([]);
  //       return;
  //     }
  //     const eventsRes = await getEventsByCalendar(mainCal.id || mainCal.calendarId);
  //     const parsedEvents = eventsRes.data.map(ev => ({
  //       ...ev,
  //       start: new Date(ev.startTime),
  //       end: new Date(ev.endTime),
  //       color: ev.priority === "HIGH"
  //         ? "#ff9a8b"
  //         : ev.priority === "MEDIUM"
  //         ? "#ffd3b6"
  //         : ev.priority === "LOW"
  //         ? "#98ddca"
  //         : "#dbb8ff",
  //     }));
  //     setEvents(parsedEvents);
  //   } catch (err) {
  //     setEvents([]);
  //     console.error("Error fetching events:", err);
  //   }
  // };

// const fetchEventsForMainCalendar = async () => {
//   try {
//     const calendarsRes = await getUserCalendars();
//     const calendars = calendarsRes.data;
//     const mainCal = calendars.find(cal => cal.primary);
//     setMainCalendar(mainCal);
//     if (!mainCal) {
//       setEvents([]);
//       return;
//     }
//     const eventsRes = await getEventsByCalendar(mainCal.id);
//     const parsedEvents = eventsRes.data.map(ev => ({
//       ...ev,
//       start: new Date(ev.startTime),
//       end: new Date(ev.endTime),
//       color: ev.priority === "HIGH"
//         ? "#ff9a8b"
//         : ev.priority === "MEDIUM"
//         ? "#ffd3b6"
//         : ev.priority === "LOW"
//         ? "#98ddca"
//         : "#dbb8ff",

//     }));
//     setEvents(parsedEvents);
//   } catch (err) {
//     setEvents([]);
//     console.error("Error fetching events:", err);
//   }
// };

useEffect(() => {
  fetchEventsForMainCalendar(calendarIdFromQuery);
}, [calendarIdFromQuery]);

  const handlePrevious = () => {
    if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDayClick = (day) => {
    setSelectedDate(day)
  }

  const handleAddTask = (newTask) => {
    setEvents((prev) => [...prev, { ...newTask, id: prev.length + 1 }])
  }

  const handleUpdateTask = async (updatedTask) => {
    try { console.log("Updating task:", updatedTask);
      await updateEvent(updatedTask.id, updatedTask); // trimite update la backend
      fetchEventsForMainCalendar(calendarIdFromQuery); // refă fetch la evenimente după update
      setShowUpdateTaskModal(false);
      setSelectedTask(null);
    } catch (err) {
      alert("Error updating task!");
    }
  };
  const handleDeleteTask = async (task) => {
  if (window.confirm("Are you sure you want to delete this task?")) {
    try {
      await deleteEvent(task.id);
      fetchEventsForMainCalendar(calendarIdFromQuery); // refă fetch la evenimente după ștergere
    } catch (err) {
      alert("Error deleting task!");
    }
  }
};

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setShowUpdateTaskModal(true)
  }

  function expandRecurringEvent(event, periodStart, periodEnd) {
  const instances = [];
  let { start, end, recurrenceType } = event;
  if (!recurrenceType || recurrenceType === "NONE") {
    if (isWithinInterval(start, { start: periodStart, end: periodEnd })) {
      instances.push(event);
    }
    return instances;
  }

  let currentStart = new Date(start);
  let currentEnd = new Date(end);

  while (isBefore(currentStart, periodEnd)) {
    if (isAfter(currentEnd, periodStart) && isBefore(currentStart, periodEnd)) {
      instances.push({
        ...event,
        start: new Date(currentStart),
        end: new Date(currentEnd),
      });
    }
    switch (recurrenceType) {
      case "DAILY":
        currentStart = addDays(currentStart, 1);
        currentEnd = addDays(currentEnd, 1);
        break;
      case "WEEKLY":
        currentStart = addWeeks(currentStart, 1);
        currentEnd = addWeeks(currentEnd, 1);
        break;
      case "MONTHLY":
        currentStart = addMonths(currentStart, 1);
        currentEnd = addMonths(currentEnd, 1);
        break;
      case "YEARLY":
        currentStart = addYears(currentStart, 1);
        currentEnd = addYears(currentEnd, 1);
        break;
      default:
        return instances;
    }
  }
  return instances;
}
// Calculează perioada vizibilă în funcție de viewMode
const periodStart = viewMode === "week"
  ? startOfWeek(currentDate, { weekStartsOn: 1 })
  : startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });

const periodEnd = viewMode === "week"
  ? endOfWeek(currentDate, { weekStartsOn: 1 })
  : endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });

// Expandează toate evenimentele recurente pentru perioada vizibilă
const expandedEvents = events.flatMap(ev =>
  expandRecurringEvent(ev, periodStart, periodEnd)
);
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="greeting-section">
          <h1>Hi, {user.firstname.split(" ")[0]}</h1>
          <p className="greeting-message">Keep moving forward!</p>
        
          {/* Calendar Info Section */}
          {mainCalendar && (
            <div className="current-calendar-info">
              <div className="calendar-indicator">
                <div className="calendar-color-dot" style={{ backgroundColor: mainCalendar.color }}></div>
                <span className="calendar-name-text">{mainCalendar.nameCalendar}</span>
                <CalendarIcon size={16} className="calendar-icon" />
                {/* Afișează "created by" doar dacă există ownerNameFromQuery */}
                {ownerNameFromQuery && (
                  <span className="calendar-owner-text" style={{ marginLeft: 8, color: "#666", fontSize: 13 }}>
                    &nbsp;|&nbsp;created by {ownerNameFromQuery}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="calendar-controls">
          <div className="navigation-controls">
            <button className="nav-button" onClick={handlePrevious}>
              <ChevronLeft size={20} />
            </button>
            <button className="nav-button today-button" onClick={handleToday}>
              Today
            </button>
            <button className="nav-button" onClick={handleNext}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="view-controls">
            <button
              className={`view-button ${viewMode === "week" ? "active" : ""}`}
              onClick={() => setViewMode("week")}
            >
              Week
            </button>
            <button
              className={`view-button ${viewMode === "month" ? "active" : ""}`}
              onClick={() => setViewMode("month")}
            >
              Month
            </button>
          </div>

          <button className="add-task-button" onClick={() => setShowAddTaskModal(true)}>
            <Plus size={20} />
            Add task
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <CalendarView
          viewMode={viewMode}
          currentDate={currentDate}
          events={expandedEvents}
          onDayClick={handleDayClick}
          selectedDate={selectedDate}
        />

        <div className="tasks-section">
          <h2 className="section-title">
            {isSameDay(selectedDate, new Date())
              ? "Today's Tasks"
              : `Tasks for ${format(selectedDate, "MMMM d, yyyy")}`}
          </h2>
          <TaskList date={selectedDate} 
                    events={expandedEvents} 
                    onUpdateTask={handleEditTask}
                    onDeleteTask={handleDeleteTask} />
        </div>
      </div>

      {showAddTaskModal && mainCalendar && (
        <AddTaskModal  onClose={() => {
                        setShowAddTaskModal(false);
                        fetchEventsForMainCalendar(calendarIdFromQuery); // refă fetch la evenimente după adăugare
                      }}
                      currentDate={currentDate}
                      calendarId={mainCalendar.id || mainCalendar.calendarId}/>
      )}
      {showUpdateTaskModal && selectedTask && (
        <UpdateTaskModal
          onClose={() => {
            setShowUpdateTaskModal(false)
            setSelectedTask(null)
          }}
          onUpdateTask={handleUpdateTask}
          task={{ ...selectedTask, calendarId: selectedTask.calendarId ?? mainCalendar?.id
              ?? mainCalendar?.calendarId }}
        />
      )}
      <AIChat />
    </div>
  )
}

export default Dashboard
