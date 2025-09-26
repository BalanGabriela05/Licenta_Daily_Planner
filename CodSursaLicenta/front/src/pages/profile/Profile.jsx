"use client"

import { useState } from "react"
import { Edit2, Save, X, Eye, EyeOff, MapPin, Calendar, User } from "react-feather"
import { changePassword } from "../../api/api"; // asigură-te că ai importul

import "./Profile.css"

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState({
    firstname: user?.firstname || "John",
    lastname: user?.lastname || "Doe",
    email: user?.email || "john.doe@example.com",
    location: "Romania",
    birthday: "15/03", // DD/MM format without year
    profileColor: "#9b7ebd",
  })

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const colorOptions = [
    "#9b7ebd", // Purple
    "#6c5ce7", // Violet
    "#ff6b6b", // Red
    "#4ecdc4", // Teal
    "#45b7d1", // Blue
    "#96ceb4", // Green
    "#feca57", // Yellow
    "#ff9ff3", // Pink
    "#54a0ff", // Light Blue
    "#5f27cd", // Dark Purple
  ]

  const countries = [
    "Romania",
    "United States",
    "United Kingdom",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Canada",
    "Australia",
    "Japan",
    "Other",
  ]

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleColorSelect = (color) => {
    setProfileData((prev) => ({
      ...prev,
      profileColor: color,
    }))
  }

  const handleSaveProfile = () => {
    // Save profile logic here
    setIsEditingProfile(false)
    alert("Profile updated successfully!")
  }

const handleSavePassword = async (e) => {
  e.preventDefault();
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    alert("New passwords don't match!");
    return;
  }
  if (passwordData.newPassword.length < 8) {
    alert("Password must be at least 8 characters long!");
    return;
  }
  try {
    await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmationPassword: passwordData.confirmPassword,
    });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangingPassword(false);
    alert("Password changed successfully!");
  } catch (err) {
    alert(
      err.response?.data?.message ||
        "Failed to change password. Please check your current password."
    );
  }
};

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const getInitials = () => {
    return profileData.firstname.charAt(0).toUpperCase()
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {/* <p>Manage your personal information and preferences</p> */}
        </div>

        <div className="profile-content">
          {/* Profile Avatar Section */}
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <div className="profile-avatar" style={{ backgroundColor: profileData.profileColor }}>
                {getInitials()}
              </div>
              {isEditingProfile && (
                <div className="color-selector">
                  <p className="color-label">Choose avatar color:</p>
                  <div className="color-options">
                    {colorOptions.map((color) => (
                      <div
                        key={color}
                        className={`color-option ${profileData.profileColor === color ? "selected" : ""}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              <button
                className="edit-button"
                onClick={() => {
                  if (isEditingProfile) {
                    handleSaveProfile()
                  } else {
                    setIsEditingProfile(true)
                  }
                }}
              >
                {isEditingProfile ? <Save size={18} /> : <Edit2 size={18} />}
                {isEditingProfile ? "Save" : "Edit"}
              </button>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="field-label">
                  <User size={16} />
                  First Name
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="firstname"
                    value={profileData.firstname}
                    onChange={handleProfileChange}
                    className="field-input"
                  />
                ) : (
                  <div className="field-value">{profileData.firstname}</div>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  <User size={16} />
                  Last Name
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="lastname"
                    value={profileData.lastname}
                    onChange={handleProfileChange}
                    className="field-input"
                  />
                ) : (
                  <div className="field-value">{profileData.lastname}</div>
                )}
              </div>

              <div className="form-field full-width">
                <label className="field-label">
                  <User size={16} />
                  Email Address
                </label>
                <div className="field-value disabled">
                  {profileData.email}
                  <span className="field-note">Email cannot be changed</span>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <MapPin size={16} />
                  Location
                </label>
                {isEditingProfile ? (
                  <select
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    className="field-input"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="field-value">{profileData.location}</div>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Calendar size={16} />
                  Birthday
                </label>
                {isEditingProfile ? (
                  <div className="birthday-inputs">
                    <select
                      name="birthdayDay"
                      value={profileData.birthday.split("/")[0]}
                      onChange={(e) => {
                        const day = e.target.value
                        const month = profileData.birthday.split("/")[1] || "01"
                        setProfileData((prev) => ({
                          ...prev,
                          birthday: `${day}/${month}`,
                        }))
                      }}
                      className="field-input birthday-select"
                    >
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = String(i + 1).padStart(2, "0")
                        return (
                          <option key={day} value={day}>
                            {i + 1}
                          </option>
                        )
                      })}
                    </select>
                    <select
                      name="birthdayMonth"
                      value={profileData.birthday.split("/")[1]}
                      onChange={(e) => {
                        const month = e.target.value
                        const day = profileData.birthday.split("/")[0] || "01"
                        setProfileData((prev) => ({
                          ...prev,
                          birthday: `${day}/${month}`,
                        }))
                      }}
                      className="field-input birthday-select"
                    >
                      <option value="">Month</option>
                      <option value="01">January</option>
                      <option value="02">February</option>
                      <option value="03">March</option>
                      <option value="04">April</option>
                      <option value="05">May</option>
                      <option value="06">June</option>
                      <option value="07">July</option>
                      <option value="08">August</option>
                      <option value="09">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                ) : (
                  <div className="field-value">
                    {profileData.birthday && profileData.birthday !== "/"
                      ? (() => {
                          const [day, month] = profileData.birthday.split("/")
                          const monthNames = [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ]
                          const monthName = monthNames[Number.parseInt(month) - 1]
                          return `${Number.parseInt(day)} ${monthName}`
                        })()
                      : "Not set"}
                  </div>
                )}
              </div>
            </div>

            {isEditingProfile && (
              <div className="form-actions">
                <button className="cancel-button" onClick={() => setIsEditingProfile(false)}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Security</h2>
              <button className="edit-button" onClick={() => setIsChangingPassword(!isChangingPassword)}>
                {isChangingPassword ? <X size={18} /> : <Edit2 size={18} />}
                {isChangingPassword ? "Cancel" : "Change Password"}
              </button>
            </div>

            {isChangingPassword ? (
              <form onSubmit={handleSavePassword} className="password-form">
                <div className="form-field">
                  <label className="field-label">Current Password</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="field-input"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("current")}
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">New Password</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="field-input"
                      required
                    />
                    <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("new")}>
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Confirm New Password</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="field-input"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">
                    <Save size={16} />
                    Save Password
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
