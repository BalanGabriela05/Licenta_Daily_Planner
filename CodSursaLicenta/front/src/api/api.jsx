import axios from 'axios';

// Creează o instanță Axios configurată cu baza back-end-ului
const API = axios.create({
  baseURL: 'http://localhost:8088/api/v1',
  withCredentials: true,
});


// Interceptor pentru adăugarea token-ului la fiecare request
API.interceptors.request.use(config => {
  // const token = localStorage.getItem('jwt');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

// Interceptor pentru tratarea erorilor 401 (token expirat/invalida)
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      if (window.location.pathname !== "/login") {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Funcții de autentificare
export const register = (data) => API.post('/auth/register', data);
export const login    = (data) => API.post('/auth/authenticate', data);
// ...existing code...

export const logout = () => API.post('/auth/logout');

// code for email verification
export const verifyEmail = (token) =>
  API.get(`/auth/activate-account?token=${token}`); 

// personal caelndar + events
export const getUserCalendars = () => API.get('/calendars/owner');
export const getCalendarById = (calendarId) => API.get(`/calendars/${calendarId}`);

export const getEventsByCalendar = (calendarId) => API.get(`/events/calendar/${calendarId}`);

//add event
export const saveEvent = (data) => API.post('/events', data);

//update event
export const updateEvent = (eventId, data) => API.put(`/events/${eventId}`, data);
//delete event
export const deleteEvent = (eventId) => API.delete(`/events/${eventId}`);


// mycalendars page
// Calendarele proprii (owner)
export const getPersonalCalendars = () => API.get("/calendars/owner");

// Calendarele partajate cu userul
export const getSharedCalendars = () => API.get("/calendar-share"); 

//create calendar
export const createCalendar = (calendarData) => API.post("/calendars", calendarData);

//edit + delete calendar
export const deleteCalendar = (calendarId) => API.delete(`/calendars/${calendarId}`);

export const updateCalendar = (calendarId, calendarData) => API.put(`/calendars/${calendarId}`, calendarData);

//event from shared calendar
export const getEventsFromSharedCalendar = (calendarId) => API.get(`/calendar-share/events/${calendarId}`);

// add friend
export const sendFriendRequest = (friendEmail) => API.post("/friends", { receiverEmail: friendEmail });
// get friends
export const getFriends = () => API.get("/friends");
// get friend requests
export const getReceivedPendingRequests = () => API.get("/friends/received-pending");

// respond to friend request
export const respondToFriendRequest = (id, accept) =>
  API.post(`/friends/${id}/respond?accept=${accept}`);

// unfriend
export const deleteFriend = (id) => API.delete(`/friends/${id}`);

// Calendar share with Friends
// Share calendar cu un prieten
export const shareCalendar = (calendarId, friendId, permission) =>
  API.post("/calendar-share", { calendarId, friendId, permission });

// Unshare calendar de la un prieten
export const unshareCalendar = (calendarId, friendId) =>
  API.delete("/calendar-share", { params: { calendarId, friendId } });

// Obține prietenii cu care calendarul este deja partajat
export const getSharedFriends = (calendarId) =>
  API.get(`/calendar-share/shared-friends?calendarId=${calendarId}`);
//update share permission
export const updatePermission = (calendarId, friendId, permission) =>
  API.patch("/calendar-share", null, {
    params: { calendarId, friendId, permission }
  });


//CHATBOT
// Trimite un mesaj la AI Chatbot
export const sendChatMessage = (message) =>
  API.post("/chatbot", { message });

// Șterge istoricul conversației cu AI
export const clearChatHistory = () =>
  API.delete("/chatbot/history");

//password
export const changePassword = (data) => API.patch('/users', data);

export { API };