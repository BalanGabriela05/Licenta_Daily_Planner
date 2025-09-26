import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import MyCalendars from './pages/mycalendars/MyCalendars';
import MyFriends from './pages/myfriends/MyFriends';
import Profile from './pages/profile/Profile';
import Login from './pages/login/Login';
import { API } from "./api/api";

const PrivateRoute = ({ children, user, onLogout }) => {
  return user ? (
    <div className="app-container">
      <Sidebar user={user} onLogout={onLogout}/>
      <main className="main-content">{children}</main>
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

function AppRoutes({ user, setUser, onLogout }) {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
      if (location.pathname === "/login") {
        setLoading(false);
        return;
      }
      setLoading(true);
      API.get("/auth/me")
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          setLoading(false);
        });
    }, [location.pathname, setUser]);

    


  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={setUser} />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute user={user} onLogout={onLogout}>
            <Dashboard user={user} />
          </PrivateRoute>
        }
      />
      <Route
        path="/calendars"
        element={
          <PrivateRoute user={user} onLogout={onLogout}>
            <MyCalendars user={user}/>
          </PrivateRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <PrivateRoute user={user} onLogout={onLogout}>
            <MyFriends user={user} />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute user={user} onLogout={onLogout}>
            <Profile user={user} />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;