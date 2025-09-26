"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Calendar } from "react-feather"
import { login, register } from "../../api/api"
import { useNavigate } from "react-router-dom"
import EmailVerification from "../email/EmailVerification"
import "./Login.css"

const Login = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState("auth") // "auth" or "verification"
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [quote, setQuote] = useState({
    text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen Covey",
  })
  const [currentDate, setCurrentDate] = useState("")
  const [errors, setErrors] = useState({});

  const navigate = useNavigate()

  
  async function fetchQuoteOfTheDay() {
    const response = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://zenquotes.io/api/today"));
    const data = await response.json();
    const quoteData = JSON.parse(data.contents)[0];
    return {
      text: quoteData.q,
      author: quoteData.a,
    };
  }
  useEffect(() => {
    // Setează data curentă
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(now.toLocaleDateString("en-US", options));

    // Fetch quote of the day
    fetchQuoteOfTheDay()
      .then(setQuote)
      .catch(() => {
        // fallback dacă API-ul nu merge
        setQuote({
          text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
          author: "Stephen Covey",
        });
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  function validateEmail(email) {
  // Email cu punct după @ (ex: test@abc.com)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

  function validatePassword(password) {
  // Min 8 caractere,  un număr, 
  // return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  return /^(?=.*\d).{8,}$/.test(password);
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let newErrors = {};

    if (isSignup) {
      if (!formData.firstname.trim()) {
        newErrors.firstname = "First name is required.";
      }
      if (!formData.lastname.trim()) {
        newErrors.lastname = "Last name is required.";
      }
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters and a number.";
    }
    if (isSignup && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    setErrors({});

    try {
      let res
      if (isSignup) {
      
        res = await register({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
        })

        setRegisteredEmail(formData.email)
        setCurrentView("verification")
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          firstname: "",
          lastname: "",
        })
        return
      } else {
        res = await login({
          email: formData.email,
          password: formData.password,
        })
      }

      // const token = res.data.token
      const user = {
        id: res.data.userId,
        email: res.data.email,
        firstname: res.data.firstname,
      }
      // localStorage.setItem("jwt", token)
      localStorage.setItem("user", JSON.stringify(user))
      onLogin && onLogin(user)
      navigate("/dashboard")
    } catch (err) {
      setErrors({
        general:
          err.response?.status === 401
            ? "Incorrect email or password."
            : err.response?.data?.message || "An error occurred. Please try again."
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSuccess = () => {
    alert("Email verified successfully! You can now log in.")
    setCurrentView("login")
    setIsSignup(false)
    setFormData((prev) => ({
      ...prev,
      email: registeredEmail,
    }))
  }

  const handleBackToLogin = () => {
    setCurrentView("login")
    setIsSignup(false)
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstname: "",
      lastname: "",
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Show verification screen
  if (currentView === "verification") {
    return (
      <EmailVerification
        email={registeredEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToLogin={handleBackToLogin}
      />
    )
  }


  // Show auth screen (login/signup) with new design
  return (
    <div className="login-container">
      <div className="sky-background">
        <img
          src="/public/sky.jpg"
          alt="Purple sky with clouds"
          className="sky-image"
        />
      </div>

      <div className="login-content">
        <div className="left-content">
          <div className="app-branding">
            <Calendar className="app-logo" />
            <h1 className="app-name">Daily Planner</h1>
          </div>

          <div className="date-and-quote">
            <div className="today-date">{currentDate}</div>
            <div className="quote-container">
              <p className="quote-text">"{quote.text}"</p>
              <p className="quote-author">— {quote.author}</p>
            </div>
          </div>

          <div className="about-section">
            <h2>About Daily Planner</h2>
              <p>
                <b>Daily Planner</b> is your smart companion for a more organized and inspired life.<br /><br />
                Easily manage your schedule, set priorities – all powered by AI.<br /><br />
                Plan events, share calendars, and let Daily Planner help you focus on what matters most.<br /><br />
                <i>Stay organized. Stay motivated. Every day.</i>
              </p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Organize tasks and events</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Share calendars and collaborate</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Get AI suggestions</div>
              </div>
            </div>
          </div>
        </div>

        <div className="right-content">
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="auth-title">{isSignup ? "Create Account!" : "Welcome Back!"}</h1>
              <p className="auth-subtitle">
                {isSignup ? "Join us today! Please fill in your details." : "We missed you! Please enter your details."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {errors.general && <div className="error-message general-error">{errors.general}</div>}
              {isSignup && (
                <div className="form-field-row">
                  <div className="form-field half-width">
                    <label htmlFor="firstname" className="field-label">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={formData.firstname || ""}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className="field-input"
                      
                    />
                    {errors.firstname && <span className="error-bubble">{errors.firstname}</span>}
                  </div>
                  <div className="form-field half-width">
                    <label htmlFor="lastname" className="field-label">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={formData.lastname || ""}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className="field-input"
                      
                    />
                    {errors.lastname && <span className="error-bubble">{errors.lastname}</span>}
                  </div>
                </div>
              )}

              <div className="form-field">
                <label htmlFor="email" className="field-label">
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your Email"
                  className="field-input"
                  
                />
                {errors.email && <span className="error-bubble">{errors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter Password"
                    className="field-input"
                    
                  />
                  {errors.password && <span className="error-bubble">{errors.password}</span>}
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {isSignup && (
                <div className="form-field">
                  <label htmlFor="confirmPassword" className="field-label">
                    Confirm Password
                  </label>
                  <div className="password-field">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="field-input"
                      
                    />
                    {errors.confirmPassword && (
                      <span className="error-bubble">{errors.confirmPassword}</span>
                    )}
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="checkbox-custom"></span>
                  Remember me
                </label>
                <a href="#" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? "Please wait..." : isSignup ? "Create Account" : "Sign in"}
              </button>
            </form>

            <div className="auth-footer">
              <p className="switch-text">
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <button type="button" className="switch-button" onClick={toggleMode}>
                  {isSignup ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login