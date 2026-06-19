import React from 'react';
import { COLORS } from '../../config/constants';

function Badge({ text, color }) {
  const map = { Paid: COLORS.success, Unpaid: COLORS.danger, Active: COLORS.success, Inactive: COLORS.muted };
  const bg = map[text] || color || COLORS.muted;
  return <span style={{ background: bg + "22", color: bg, padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{text}</span>;
}

export default Badge;
