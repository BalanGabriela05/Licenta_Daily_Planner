"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Calendar, X, Share2 } from "react-feather"
import { getPersonalCalendars, getSharedCalendars, createCalendar, deleteCalendar, updateCalendar, getFriends, getSharedFriends, shareCalendar, unshareCalendar, updatePermission } from "../../api/api"
import "./MyCalendars.css"

const MyCalendars = ({user}) => {
  const [personalCalendars, setPersonalCalendars] = useState([])
  const [sharedCalendars, setSharedCalendars] = useState([])

  useEffect(() => {
    // Fetch personal calendars
    getPersonalCalendars().then((res) => {
      setPersonalCalendars(res.data)
      console.log("Personal Calendars:", res.data)
    })

    // Fetch shared calendars
    getSharedCalendars().then((res) => {
      setSharedCalendars(res.data)
      console.log("Shared Calendars:", res.data)
    })

    // Fetch friends for sharing
    getFriends().then((res) => {
    // Transformează fiecare prieten într-un obiect pentru sharing
    setAvailableFriends(res.data.map(friend => ({
      id: friend.senderId === user.id ? friend.receiverId : friend.senderId, // <-- trebuie să fie id-ul userului prieten!
      name: friend.senderId === user.id ? friend.receiverName : friend.senderName,
      avatar: friend.avatar || (friend.senderId === user.id ? friend.receiverName[0] : friend.senderName[0]),
      permission: "view",
      selected: false,
    })));
  });
}, []);

  // Navigate to calendar VIEW
  const navigate = useNavigate();
  const handleViewCalendar = (calendarId) => {
    navigate(`/dashboard?calendarId=${calendarId}`);
  };

  const [showShareModal, setShowShareModal] = useState(false)
  const [calendarToShare, setCalendarToShare] = useState(null)


  const handleSubmitShare = () => {
    // Get selected friends
    const selectedFriends = availableFriends.filter((friend) => friend.selected)
    console.log("Sharing calendar with:", selectedFriends)

    // Here you would make API call to share calendar
    // shareCalendar(calendarToShare.id, selectedFriends);

    setShowShareModal(false)

    // Reset friend selections
    setAvailableFriends(
      availableFriends.map((friend) => ({
        ...friend,
        selected: false,
        permission: "view",
      })),
    )
  }

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentCalendar, setCurrentCalendar] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6c5ce7",
    friends: [],
  })
  const [availableFriends, setAvailableFriends] = useState([])

  const handleDeleteCalendar = async (id) => {
  try {
    await deleteCalendar(id);
    setPersonalCalendars(personalCalendars.filter((cal) => cal.id !== id));
  } catch (err) {
    alert("Eroare la ștergerea calendarului!");
  }
};

  //Create Calendar Modal
  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    try {
      const calendarRequest = {
        nameCalendar: formData.name,
        color: formData.color,
      };
      const res = await createCalendar(calendarRequest);
      // Poți adăuga calendarul nou în listă sau poți refetch-ui toate calendarele
      setPersonalCalendars([
        ...personalCalendars,
        {
          id: res.data,
          nameCalendar: formData.name,
          color: formData.color,
        },
      ]);
      setShowCreateModal(false);
      setFormData({ name: "", description: "", color: "#6c5ce7", friends: [] });
    } catch (err) {
      alert("Error creating calendar!");
    }
  };

  const handleEditCalendar = (calendar) => {
    setCurrentCalendar(calendar)
    setFormData({
      name: calendar.nameCalendar,
      color: calendar.color,
    })

    // Reset friend selection
    setAvailableFriends(
      availableFriends.map((friend) => ({
        ...friend,
        selected: false,
        permission: "view",
      })),
    )

    setShowEditModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleColorSelect = (color) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }))
  }


  // const handleFriendSelection = (friendId) => {
  //   setAvailableFriends(
  //     availableFriends.map((friend) => (friend.id === friendId ? { ...friend, selected: !friend.selected } : friend)),
  //   )
  // }

  const handleSubmitEdit = async (e) => {
  e.preventDefault();
  try {
    const calendarRequest = {
      nameCalendar: formData.name,
      color: formData.color,
    };
    await updateCalendar(currentCalendar.id, calendarRequest);
    // Actualizează local lista
    const updatedCalendars = personalCalendars.map((cal) =>
      cal.id === currentCalendar.id
        ? { ...cal, nameCalendar: formData.name, color: formData.color }
        : cal
    );
    setPersonalCalendars(updatedCalendars);
    setShowEditModal(false);
  } catch (err) {
    alert("Error updating calendar!");
  }
};

//SHARE ADD/ADDED FRIENDS IN PERSONAL CALENDAR
  const fetchSharedFriends = async (calendarId) => {
    const sharedRes = await getSharedFriends(calendarId);
    const sharedFriends = sharedRes.data; // [{id, permission}, ...]

    setAvailableFriends(prev =>
      prev.map(friend => {
        const shared = sharedFriends.find(f => f.id === friend.id);
        return {
          ...friend,
          selected: !!shared,
          permission: shared ? shared.permission.toLowerCase() : "view", // setează permisiunea corectă
          pendingUpdate: false // vezi punctul 2
        };
      })
    );
  };

// click ADD/ADDED
  const handleFriendSelection = async (friendId) => {
    const friend = availableFriends.find(f => f.id === friendId);
    if (!friend.selected) {
      await shareCalendar(calendarToShare.id, friendId, friend.permission.toUpperCase());
    } else {
      await unshareCalendar(calendarToShare.id, friendId);
    }
    // Refă fetch la shared friends după acțiune
    // const sharedRes = await getSharedFriends(calendarToShare.id);
    // const sharedFriendIds = sharedRes.data;
    // setAvailableFriends(prev =>
    //   prev.map(f => ({
    //     ...f,
    //     selected: sharedFriendIds.includes(f.id),
    //   }))
    // );
    await fetchSharedFriends(calendarToShare.id);
  };

  const handleShareCalendar = async (calendar) => {
    setCalendarToShare(calendar);
    setShowShareModal(true);
    await fetchSharedFriends(calendar.id);
  };

  const handleFriendPermissionChange = (friendId, permission) => {
    setAvailableFriends(availableFriends.map(friend => {
      if (friend.id === friendId) {
        // Dacă e deja added și permisiunea diferă de cea inițială, marchează pendingUpdate
        const pendingUpdate = friend.selected && friend.permission !== permission;
        return { ...friend, permission, pendingUpdate };
      }
      return friend;
    }));
  };

  const handleUpdatePermission = async (friendId, permission) => {
    await updatePermission(calendarToShare.id, friendId, permission.toUpperCase());
    // Refă fetch la shared friends ca să resetezi pendingUpdate
    await fetchSharedFriends(calendarToShare.id);
  };

  return (
    <div className="my-calendars-page">
      <header className="page-header">
        <h1>Personal Calendars</h1>
        <button className="create-calendar-button" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Create Calendar
        </button>
      </header>

      <div className="calendars-section">
        <div className="calendar-cards">
          {personalCalendars.map((calendar) => (
            <div key={calendar.id} className="calendar-card">
              <div className="calendar-card-header">
                <div className="calendar-color-and-name">
                  <div className="calendar-color" style={{ backgroundColor: calendar.color }}></div>
                  <h3 className="calendar-name">{calendar.nameCalendar}</h3>
                </div>
                <div className="calendar-badge">Owner</div>
              </div>
              <div className="calendar-actions">
                <button className="calendar-action-button view"  onClick={() => 
                  handleViewCalendar(calendar.id)}>
                  <Calendar size={16} />
                  View
                </button>
                {!calendar.primary && (
                  <button className="calendar-action-button share" onClick={() => handleShareCalendar(calendar)}>
                    <Share2 size={16} />
                    Share
                  </button>
                )}
                {!calendar.primary && (
                  <button className="calendar-action-button edit" onClick={() => handleEditCalendar(calendar)}>
                    <Edit2 size={16} />
                  </button>
                )}
                {!calendar.primary && (
                  <button className="calendar-action-button delete" onClick={() => handleDeleteCalendar(calendar.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <header className="page-header shared-header">
        <h1>Shared Calendars</h1>
      </header>

      <div className="calendars-section">
        <div className="calendar-cards">
          {sharedCalendars.map((calendar) => (
            <div key={calendar.calendarId} className="calendar-card">
              <div className="calendar-card-header">
                <div className="calendar-color-and-name">
                  <div className="calendar-color" style={{ backgroundColor: calendar.color }}></div>
                  <h3 className="calendar-name">{calendar.calendarName}</h3>
                </div>
                <div className="calendar-badge">{calendar.permission === "EDIT" ? "Can Edit" : "View Only"}</div>
              </div>
              <p className="calendar-description">Created by {calendar.ownerName}</p>
              <div className="calendar-actions">
                <button className="calendar-action-button view"  onClick={() =>
                  navigate(
                    `/dashboard?calendarId=${calendar.calendarId}&ownerName=${encodeURIComponent(calendar.ownerName)}`
                  )
                }>
                  <Calendar size={16} />
                  View 
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Create New Calendar</h2>
              <button className="close-button" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="calendar-form" onSubmit={handleSubmitCreate}>
              <div className="form-group">
                <label htmlFor="calendarName">Calendar Name</label>
                <input
                  type="text"
                  id="calendarName"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter calendar name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Calendar Color</label>
                <div className="color-options">
                  {["#B5828C", "#E5989B", "#B3C8CF", "#89A8B2", "#C1CFA1", "#A5B68D", "#E16A54", "#F39E60"].map((color) => (
                    <div
                      key={color}
                      className={`color-option ${formData.color === color ? "selected" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                {/* <button type="button" className="cancel-button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button> */}
                <button type="submit" className="submit-button">
                  Create Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && currentCalendar && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit Calendar</h2>
              <button className="close-button" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="calendar-form" onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label htmlFor="name">Calendar Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter calendar name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Calendar Color</label>
                <div className="color-options">
                  {["#B5828C", "#E5989B", "#B3C8CF", "#89A8B2", "#C1CFA1", "#A5B68D", "#E16A54", "#F39E60"].map((color) => (
                    <div
                      key={color}
                      className={`color-option ${formData.color === color ? "selected" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                {/* <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button> */}
                <button type="submit" className="submit-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Share Calendar</h2>
              <button className="close-button" onClick={() => setShowShareModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="calendar-form">
              {calendarToShare && (
                <div className="share-calendar-info">
                  <div className="calendar-preview">
                    <div className="calendar-color" style={{ backgroundColor: calendarToShare.color }}></div>
                    <h3>{calendarToShare.nameCalendar}</h3>
                  </div>
                  <p className="share-description">Select friends to share this calendar with:</p>
                </div>
              )}

              <div className="form-group">
                <label>Share with Friends</label>
                <div className="friend-list">
                  {availableFriends.map((friend) => (
                    <div key={friend.id} className="friend-item">
                      <div className="friend-info">
                        <div className="friend-avatar" style={{ backgroundColor: "#1dd1a1" }}>
                          {friend.avatar}
                        </div>
                        <div className="friend-name">{friend.name}</div>
                      </div>
                      <div className="friend-actions">
                        <select
                          className="permission-select"
                          value={friend.permission}
                          onChange={(e) => handleFriendPermissionChange(friend.id, e.target.value)}
                        >
                          <option value="view">view</option>
                          <option value="edit">edit</option>
                        </select>
                        <button
                          type="button"
                          className={`friend-add-button ${friend.selected ? (friend.pendingUpdate ? "update" : "added") : ""}`}
                          onClick={() => {
                            if (friend.selected && friend.pendingUpdate) {
                              handleUpdatePermission(friend.id, friend.permission);
                            } else {
                              handleFriendSelection(friend.id);
                            }
                          }}
                        >
                          {friend.selected
                            ? (friend.pendingUpdate ? "Update" : "Added")
                            : "Add"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                {/* <button type="button" className="cancel-button" onClick={() => setShowShareModal(false)}>
                  Cancel
                </button> */}
                <button type="button" className="submit-button" onClick={handleSubmitShare}>
                  Share Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to generate random colors based on ID
const getRandomColor = (id) => {
  const colors = ["#B5828C", "#E5989B", "#B3C8CF", "#89A8B2", "#C1CFA1", "#A5B68D", "#A888B5", "#8174A0"]
  return colors[id % colors.length]
}

export default MyCalendars
