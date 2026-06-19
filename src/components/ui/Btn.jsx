import React from 'react';
import { COLORS } from '../../config/constants';

function Btn({ children, onClick, variant = "primary", disabled, style }) {
  const bg = variant === "primary" ? COLORS.royal : variant === "danger" ? COLORS.danger : variant === "success" ? COLORS.success : "#EEF";
  const color = ["primary","danger","success"].includes(variant) ? COLORS.white : COLORS.ink;
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: disabled ? COLORS.muted : bg, color, border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", ...style }}>
      {children}
    </button>
  );
}

export default Btn;
