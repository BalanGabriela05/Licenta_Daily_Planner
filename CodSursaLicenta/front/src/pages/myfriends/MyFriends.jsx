"use client"

import { useState, useEffect } from "react"
import { Search, UserPlus, X, UserMinus } from "react-feather"
import { sendFriendRequest, getFriends, getReceivedPendingRequests, respondToFriendRequest, deleteFriend } from "../../api/api"
import "./MyFriends.css"

const MyFriends = ({user}) => {
  const [activeTab, setActiveTab] = useState("friends")
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [friendEmail, setFriendEmail] = useState("");

  const [searchQuery, setSearchQuery] = useState("")
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [showConfirmUnfriend, setShowConfirmUnfriend] = useState(null)
  console.log("User in MyFriends:", user); // Verifică dacă userul este corect
  if (!user || !user.id) {
    return <div>Loading...</div>;
  }

  // Elimină prieteniile cu tine însuți
  const validFriends = friends.filter(
    friend => !(friend.senderId === user.id && friend.receiverId === user.id)
  );

  // extracts the friend's display data based on the logged-in user
  const getFriendDisplayData = (friend) => {
    // Compară după id, nu după email!
    if (friend.senderId === user.id) {
      return { name: friend.receiverName, email: friend.receiverEmail };
    } else {
      return { name: friend.senderName, email: friend.senderEmail };
    }
  };
  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => {
    const { name, email } = getFriendDisplayData(friend);
    return (
      (name && name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (email && email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Api calls to fetch friends and friend requests
  useEffect(() => {
    if (!user || !user.id) return;
    getFriends().then(res => {
      console.log("FRIENDS:", res.data); // vezi ce primești pentru prieteni
      
      setFriends(res.data);
    });
    getReceivedPendingRequests().then(res => {
      console.log("FRIEND REQUESTS:", res.data); // vezi ce primești pentru cereri
      setFriendRequests(res.data);
    });
  }, [user]);

  // UNFRIEND handler
  const handleUnfriend = async (id) => {
    try {
      await deleteFriend(id);
      // Refetch friends după ștergere
      getFriends().then(res => setFriends(res.data));
      setShowConfirmUnfriend(null);
    } catch (err) {
      alert("Error deleting friend!");
    }
  };
  // ADD friend request handler
  const handleAddFriend = async (e) => {
    e.preventDefault();
    try {
      await sendFriendRequest(friendEmail);
      alert("Friend request sent!");
      setShowAddFriendModal(false);
      setFriendEmail("");
      // Poți refetch-ui cererile dacă vrei
      getReceivedPendingRequests().then(res => setFriendRequests(res.data));
    } catch (err) {
      alert("Error sending friend request!");
    }
  };

  // RESPOND to friend request handler
  const handleRespondToRequest = async (id, accept) => {
  try {
      await respondToFriendRequest(id, accept);
      // Refetch requests și friends după răspuns
      getReceivedPendingRequests().then(res => setFriendRequests(res.data));
      getFriends().then(res => setFriends(res.data));
    } catch (err) {
      alert("Error responding to friend request!");
    }
  };

  return (
    <div className="my-friends-page">
      <header className="page-header">
        <h1>My Friends</h1>
        <button className="add-friend-button" onClick={() => setShowAddFriendModal(true)}>
          <UserPlus size={20} />
          Add Friend
        </button>
      </header>

      <div className="friends-container">
        <div className="tabs">
          <button className={`tab ${activeTab === "friends" ? "active" : ""}`} onClick={() => setActiveTab("friends")}>
            Friends
          </button>
          <button
            className={`tab ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Friend Requests
            {friendRequests.length > 0 && <span className="tab-badge">{friendRequests.length}</span>}
          </button>
        </div>

        {activeTab === "friends" && (
          <>
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search friends by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-search" onClick={() => setSearchQuery("")}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="friends-list">
              {filteredFriends.length === 0 ? (
                <div className="no-friends">
                  {searchQuery
                    ? "No friends match your search"
                    : "You have no friends yet. Add some friends to get started!"}
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const { name, email } = getFriendDisplayData(friend);
                  
                  return (
                    <div key={friend.id} className="friend-card">
                      <div className="friend-info">
                        <div className="friend-avatar" style={{ backgroundColor: getRandomColor(friend.id) }}>
                          {name && name[0].toUpperCase()}
                        </div>
                        <div className="friend-details">
                          <h3 className="friend-name">{name}</h3>
                          <p className="friend-email">{email}</p>
                          <p className="friend-calendars">
                            {friend.sharedCalendars === 0
                              ? "No shared calendars"
                              : friend.sharedCalendars === 1
                                ? "1 shared calendar"
                                : `${friend.sharedCalendars} shared calendars`}
                          </p>
                        </div>
                      </div>
                      <div className="friend-actions">
                        {/* <div className="friend-status">
                          <span className={`status-indicator ${friend.isOnline ? "online" : "offline"}`}></span>
                          <span className="status-text">{friend.isOnline ? "Online" : "Offline"}</span>
                        </div> */}
                        <button
                          className="friend-action-button unfriend"
                          onClick={() => setShowConfirmUnfriend(friend.id)}
                        >
                          <UserMinus size={16} />
                          Unfriend
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === "requests" && (
          <div className="friend-requests">
            {friendRequests.length === 0 ? (
              <div className="no-requests">You have no friend requests</div>
            ) : (
              friendRequests.map((request) => (
                <div key={request.id} className="friend-request-card">
                  <div className="friend-info">
                    <div className="friend-avatar" style={{ backgroundColor: getRandomColor(request.id) }}>
                      {request.senderName && request.senderName[0].toUpperCase()}
                    </div>
                    <div className="friend-details">
                      <h3 className="friend-name">{request.senderName}</h3>
                      <p className="friend-email">{request.senderEmail}</p>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button className="request-action-button accept"
                    onClick={() => handleRespondToRequest(request.id, true)}>Accept</button>

                    <button className="request-action-button decline"
                    onClick={() => handleRespondToRequest(request.id, false)}>Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showAddFriendModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Add Friend</h2>
              <button className="close-button" onClick={() => setShowAddFriendModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="add-friend-form" onSubmit={handleAddFriend}>
              <div className="form-group">
                <label htmlFor="friendEmail">Friend's Email</label>
                    <input
                      type="email"
                      id="friendEmail"
                      placeholder="Enter email address"
                      required
                      value={friendEmail}
                      onChange={e => setFriendEmail(e.target.value)}
                    />
              </div>

              {/* <div className="form-group">
                <label htmlFor="friendMessage">Message (Optional)</label>
                <textarea id="friendMessage" placeholder="Add a personal message" rows="3"></textarea>
              </div> */}

              <div className="form-actions">
                {/* <button type="button" className="cancel-button" onClick={() => setShowAddFriendModal(false)}>
                  Cancel
                </button> */}
                <button type="submit" className="submit-button">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmUnfriend && (
        <div className="modal-overlay">
          <div className="modal-container confirm-modal">
            <div className="modal-header">
              <h2>Confirm Unfriend</h2>
              <button className="close-button" onClick={() => setShowConfirmUnfriend(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="confirm-content">
              <p>Are you sure you want to remove this friend? This action cannot be undone.</p>
              <p>Any shared calendars will no longer be accessible to them.</p>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={() => setShowConfirmUnfriend(null)}>
                Cancel
              </button>
              <button type="button" className="delete-button" onClick={() => handleUnfriend(showConfirmUnfriend)}>
                Unfriend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to generate random colors based on ID
const getRandomColor = (id) => {
  const colors = ["#6c5ce7", "#ff6b6b", "#1dd1a1", "#feca57", "#54a0ff"]
  return colors[id % colors.length]
}

export default MyFriends
