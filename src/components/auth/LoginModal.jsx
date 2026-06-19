import React, { useState } from "react";
import { COLORS } from "../../config/constants";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Btn from "../ui/Btn";
import { dbService } from "../../services/dbService";

function LoginModal({ onLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await dbService.login(email, password);
      onLogin();
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Admin Login" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 14, color: COLORS.muted }}>
          Enter your admin credentials to access restricted areas.
        </div>
        
        {error && (
          <div style={{ background: COLORS.danger + "22", color: COLORS.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <Input 
          label="Email Address" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="admin@example.com"
        />
        
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Input 
            label="Password" 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••"
            style={{ paddingRight: 48 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 16,
              top: 42,
              border: "none",
              background: "transparent",
              color: COLORS.muted,
              cursor: "pointer",
              fontSize: 14,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14.12 14.12A9 9 0 0 0 21 12a9.66 9.66 0 0 0-2.27-3.05" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.88 9.88A9 9 0 0 0 3 12c1.2 1.35 2.8 2.54 4.53 3.34" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Btn onClick={handleLogin} style={{ flex: 1 }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Btn>
          <Btn variant="outline" onClick={onClose} style={{ background: "#EEF", color: COLORS.ink }}>
            Cancel
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

export default LoginModal;