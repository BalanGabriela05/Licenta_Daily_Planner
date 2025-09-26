"use client"

import { useState, useEffect } from "react"
import { format, isSameDay } from "date-fns"
import { Edit2, Trash2 } from "react-feather"
import "./TaskList.css"

const TaskList = ({ date, events, onUpdateTask, onDeleteTask }) => {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    // Filter events for the current date
    const todayTasks = events.filter((event) => isSameDay(event.start, date))

    // Sort tasks by start time
    const sortedTasks = [...todayTasks].sort((a, b) => a.start - b.start)
    setTasks(sortedTasks)
  }, [date, events])

  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <div className="no-tasks">No tasks for today</div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="task-item" style={{ borderLeftColor: task.color }}>
            <div className="task-time">
              {format(task.start, "HH:mm")} - {format(task.end, "HH:mm")}
            </div>
            <div className="task-content">
              <div className="task-main">
                <h3 className="task-title">{task.title}</h3>
                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}
              </div>
              <div className="task-actions">
                <button className="task-edit-button" onClick={() => onUpdateTask(task)} title="Edit task">
                  <Edit2 size={16} />
                </button>
                <button
                  className="task-delete-button"
                  onClick={() => onDeleteTask && onDeleteTask(task)}
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default TaskList
