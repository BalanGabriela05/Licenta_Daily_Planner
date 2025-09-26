import { useState, useEffect, useMemo } from "react"
import { X } from "react-feather"
import { format } from "date-fns"
import "./AddTaskModal.css"

const UpdateTaskModal = ({ onClose, onUpdateTask, task }) => {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    priority: "medium",
    recurrence: "none",
    color: "#dbb8ff",
  })

  useEffect(() => {
    if (task) {
      setTaskData({
        title: task.title || "",
        description: task.description || "",
        date: format(task.start, "yyyy-MM-dd"),
        startTime: format(task.start, "HH:mm"),
        endTime: format(task.end, "HH:mm"),
        priority: (task.priority || "medium").toLowerCase(),
        recurrence: (task.recurrenceType || "none").toLowerCase(),
        color: task.color || "#dbb8ff",
      })
    }
  }, [task])

  // Helper: convert time string to minutes
  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Generate time options (every 15 minutes)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        options.push({ value: timeString, label: displayTime })
      }
    }
    return options
  }

  const allTimeOptions = useMemo(() => generateTimeOptions(), [])

  // Filter valid end times based on start time
  const validEndTimes = useMemo(() => {
    if (!taskData.startTime) return allTimeOptions
    const startMinutes = timeToMinutes(taskData.startTime)
    return allTimeOptions.filter((option) => timeToMinutes(option.value) > startMinutes)
  }, [taskData.startTime, allTimeOptions])

  // Filter valid start times based on end time
  const validStartTimes = useMemo(() => {
    if (!taskData.endTime) return allTimeOptions
    const endMinutes = timeToMinutes(taskData.endTime)
    return allTimeOptions.filter((option) => timeToMinutes(option.value) < endMinutes)
  }, [taskData.endTime, allTimeOptions])

  const handleChange = (e) => {
    const { name, value } = e.target
    let color = taskData.color
    const newTaskData = { ...taskData, [name]: value }

    if (name === "priority") {
      if (value === "high") color = "#ff9a8b"
      else if (value === "medium") color = "#ffd3b6"
      else if (value === "low") color = "#98ddca"
      newTaskData.color = color
    }

    // Smart time adjustment
    if (name === "startTime") {
      const startMinutes = timeToMinutes(value)
      const endMinutes = timeToMinutes(taskData.endTime)
      if (startMinutes >= endMinutes) {
        // Set endTime to 1 hour after startTime
        const newEndMinutes = startMinutes + 60
        const newEndHours = Math.floor(newEndMinutes / 60) % 24
        const newEndMins = newEndMinutes % 60
        newTaskData.endTime = `${newEndHours.toString().padStart(2, "0")}:${newEndMins
          .toString()
          .padStart(2, "0")}`
      }
    }

    if (name === "endTime") {
      const endMinutes = timeToMinutes(value)
      const startMinutes = timeToMinutes(taskData.startTime)
      if (endMinutes <= startMinutes) {
        // Set startTime to 1 hour before endTime
        const newStartMinutes = Math.max(0, endMinutes - 60)
        const newStartHours = Math.floor(newStartMinutes / 60)
        const newStartMins = newStartMinutes % 60
        newTaskData.startTime = `${newStartHours.toString().padStart(2, "0")}:${newStartMins
          .toString()
          .padStart(2, "0")}`
      }
    }

    setTaskData(newTaskData)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Create start and end date objects for the same day
    const startDateTime = new Date(`${taskData.date}T${taskData.startTime}`)
    const endDateTime = new Date(`${taskData.date}T${taskData.endTime}`)

    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      alert("End time must be after start time.")
      return
    }

    const updatedTask = {
      id: task.id,
      title: taskData.title,
      description: taskData.description,
      startTime: `${taskData.date}T${taskData.startTime}`,
      endTime: `${taskData.date}T${taskData.endTime}`,
      calendarId: task.calendarId,
      priority: taskData.priority ? taskData.priority.toUpperCase() : undefined,
      recurrenceType: taskData.recurrence ? taskData.recurrence.toUpperCase() : undefined,
      color: taskData.color,
    }

    onUpdateTask(updatedTask)
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Update Task</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              placeholder="Task title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={taskData.description}
              onChange={handleChange}
              placeholder="Task description"
              rows="3"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input type="date" id="date" name="date" value={taskData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <select
                id="startTime"
                name="startTime"
                value={taskData.startTime}
                onChange={handleChange}
                required
                className="time-select"
              >
                {validStartTimes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <select
                id="endTime"
                name="endTime"
                value={taskData.endTime}
                onChange={handleChange}
                required
                className="time-select"
              >
                {validEndTimes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={taskData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="recurrence">Recurrence</label>
              <select id="recurrence" name="recurrence" value={taskData.recurrence} onChange={handleChange}>
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-options readonly">
              {[
                { color: "#98ddca", priority: "low" },
                { color: "#ffd3b6", priority: "medium" },
                { color: "#ff9a8b", priority: "high" },
              ].map(({ color, priority }) => (
                <div
                  key={color}
                  className={`color-option${taskData.priority === priority ? " selected" : ""}`}
                  style={{ backgroundColor: color, pointerEvents: "none" }}
                  title={priority.charAt(0).toUpperCase() + priority.slice(1)}
                ></div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateTaskModal