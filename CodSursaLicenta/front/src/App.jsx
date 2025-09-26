import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  
  };

  return (
    <Router>
      <AppRoutes user={user} setUser={setUser} onLogout={handleLogout} />
    </Router>
  );
}

export default App;