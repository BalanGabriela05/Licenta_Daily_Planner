"use client"

import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Calendar, Users, Grid, LogOut, ChevronRight, Menu } from "react-feather"
import "./Sidebar.css"
import { logout as apiLogout } from "../../api/api"

const Sidebar = ({ user, onLogout }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error("Logout error:", error)
    }
    localStorage.removeItem("user")

    if (onLogout) onLogout()
    navigate("/login", { replace: true })
  }

  if (!user || !user.firstname) return null

  return (
    <>
      <div className={`sidebar-toggle ${isOpen ? "open" : ""}`} onClick={toggleSidebar}>
        {isOpen ? <ChevronRight size={24} /> : <Menu size={24} />}
      </div>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Calendar size={20} className="logo-icon" />
            <h1>Daily Planner</h1>
          </div>
        </div>

        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={() => isMobile && setIsOpen(false)}
            >
              <Grid size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/calendars"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={() => isMobile && setIsOpen(false)}
            >
              <Calendar size={20} />
              <span>My Calendars</span>
            </NavLink>
            <NavLink
              to="/friends"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={() => isMobile && setIsOpen(false)}
            >
              <Users size={20} />
              <span>My Friends</span>
            </NavLink>

          </nav>
        </div>

        <div className="sidebar-footer">
          <NavLink to="/profile" className="user-profile" onClick={() => isMobile && setIsOpen(false)}>
            <div
              className="user-avatar"
              style={{
                backgroundColor: user.profileColor || "#9b7ebd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 18,
                width: 36,
                height: 36,
                borderRadius: "50%",
                textTransform: "uppercase",
              }}
            >
              {user.firstname ? user.firstname[0] : "U"}
            </div>
            <div className="user-info">
              <h3 className="user-name">{user.firstname}</h3>
            </div>
          </NavLink>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isMobile && isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  )
}

export default Sidebar
