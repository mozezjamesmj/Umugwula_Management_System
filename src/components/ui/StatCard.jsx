import React from 'react';
import { COLORS } from '../../config/constants';

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: COLORS.white, borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 16px rgba(0,0,0,.07)", borderLeft: `5px solid ${color || COLORS.royal}` }}>
      <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.ink }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default StatCard;
