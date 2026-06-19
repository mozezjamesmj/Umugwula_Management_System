import React from 'react';
import { COLORS } from '../../config/constants';

function Select({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.ink, marginBottom: 6, textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>
      <select {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid #E0E0E8`, fontSize: 14, outline: "none", boxSizing: "border-box", background: COLORS.cream }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default Select;
