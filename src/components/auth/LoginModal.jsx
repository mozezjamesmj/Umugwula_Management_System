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
            style={{
              position: "absolute",
              right: 16,
              top: 42,
              border: "none",
              background: "transparent",
              color: COLORS.muted,
              cursor: "pointer",
              fontSize: 14,
              padding: 0
            }}
          >
            {showPassword ? "Hide" : "Show"}
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