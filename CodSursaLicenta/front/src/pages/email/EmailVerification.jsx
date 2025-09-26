"use client"

import { useState, useRef, useEffect } from "react"
import { Mail, ArrowLeft, RefreshCw } from "react-feather"
import "./EmailVerification.css"
import { verifyEmail } from "../../api/api"


const EmailVerification = ({ email, onVerificationSuccess, onBackToLogin }) => {
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(600) // 5 minutes countdown
  const inputRefs = useRef([])

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value

    setVerificationCode(newCode)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newCode.every((digit) => digit !== "") && newCode.join("").length === 6) {
      handleVerification(newCode.join(""))
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("")
        const newCode = [...verificationCode]
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit
        })
        setVerificationCode(newCode)
        if (digits.length === 6) {
          handleVerification(newCode.join(""))
        }
      })
    }
  }

  const handleVerification = async (code) => {
    setIsLoading(true)
    setError("")

    try {
        // Apelează backend-ul pentru verificare
        await verifyEmail(code);

        // Success
        onVerificationSuccess?.();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Verification failed. Please try again."
        );
        setVerificationCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } finally {
        setIsLoading(false);
      }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError("")

    try {
      // Simulate API call to resend code
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reset timer
      setTimeLeft(300)
      alert("Verification code sent! Check your email.")
    } catch (err) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const handleManualSubmit = () => {
    const code = verificationCode.join("")
    if (code.length === 6) {
      handleVerification(code)
    }
  }

  return (
    <div className="verification-container">
      <div className="verification-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="verification-card">
        <button className="back-button" onClick={onBackToLogin}>
          <ArrowLeft size={20} />
          Back to Login
        </button>

        <div className="verification-header">
          <div className="mail-icon">
            <Mail size={48} />
          </div>
          <h1 className="verification-title">Check Your Email</h1>
          <p className="verification-subtitle">
            We've sent a 6-digit verification code to
            <br />
            <strong>{email}</strong>
          </p>
        </div>

        <div className="verification-form">
          <div className="code-inputs">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`code-input ${error ? "error" : ""}`}
                disabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="verify-button"
            onClick={handleManualSubmit}
            disabled={isLoading || verificationCode.join("").length !== 6}
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="spinning" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </div>

        <div className="verification-footer">
          <div className="timer">
            {timeLeft > 0 ? <p>Code expires in {formatTime(timeLeft)}</p> : <p className="expired">Code has expired</p>}
          </div>

          <div className="resend-section">
            <p>Didn't receive the code?</p>
            <button
              className="resend-button"
              onClick={handleResendCode}
              disabled={isResending || timeLeft > 240} // Allow resend after 1 minute
            >
              {isResending ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Sending...
                </>
              ) : (
                "Resend Code"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
