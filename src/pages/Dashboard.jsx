import React from 'react';
import StatCard from '../components/ui/StatCard';
import { COLORS, } from '../config/constants';
//import { } from '../config/constants'; // remove REG_FEE if unused elsewhere
import { fmt, monthLabel } from '../utils/helpers';

function Dashboard({ members, levies, expenses, isMobile }) {
  const totalCollected = levies.filter(l=>l.status==="Paid").reduce((a,l)=>a + Number(l.amount || 0), 0);
  const totalExpenses = expenses.reduce((a,e)=>a + Number(e.amount || 0), 0);
  const totalRegFees = members
  .filter(m => m.reg_fee_paid)
  .reduce((sum, m) => sum + Number(m.reg_fee_amount || 0), 0);
  const balance = totalCollected + totalRegFees - totalExpenses;

  const unpaidCount = members.filter(m => {
  const paid = levies
    .filter(l => String(l.member_id) === String(m.id) && l.status === "Paid")
    .map(l => l.month);
  const cur = new Date().toISOString().slice(0, 7);
  return !paid.includes(cur);
}).length;

const maleMemberIds = new Set(members.filter(m => m.gender === "Male").map(m => String(m.id)));
const femaleMemberIds = new Set(members.filter(m => m.gender === "Female").map(m => String(m.id)));

const maleLevyTotal = levies
  .filter(l => l.status === "Paid" && maleMemberIds.has(String(l.member_id)))
  .reduce((a, l) => a + l.amount, 0);

const femaleLevyTotal = levies
  .filter(l => l.status === "Paid" && femaleMemberIds.has(String(l.member_id)))
  .reduce((a, l) => a + l.amount, 0);
  
  return (
      <div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Association Balance" value={fmt(balance)} sub="Registration + Levy − Expenses" color={COLORS.royal} />
        <StatCard label="Total Members" value={members.length} sub={`${members.filter(m=>m.status==="Active").length} active`} color={COLORS.accent} />
        <StatCard label="Levy Collected" value={fmt(totalCollected)} sub="All time" color={COLORS.success} />
        <StatCard label="Total Expenses" value={fmt(totalExpenses)} sub="All time" color={COLORS.danger} />
        <StatCard label="Unpaid This Month" value={unpaidCount} sub="Members with pending levy" color={COLORS.gold} />
        <StatCard label="Male Levy Collected" value={fmt(maleLevyTotal)} sub={`${members.filter(m=>m.gender==="Male").length} male member${members.filter(m=>m.gender==="Male").length!==1?"s":""}`} color="#1565C0" />
        <StatCard label="Female Levy Collected" value={fmt(femaleLevyTotal)} sub={`${members.filter(m=>m.gender==="Female").length} female member${members.filter(m=>m.gender==="Female").length!==1?"s":""}`} color="#AD1457" />
      </div>
 
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
        gap: 20 
      }}>
        <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, color: COLORS.ink }}>Recent Levy Payments</h3>
          {levies.slice(-5).reverse().map(l => (
            <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0F0F5" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{l.memberName}</div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>{monthLabel(l.month)}{l.monthsCount > 1 ? ` (×${l.monthsCount})` : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: COLORS.success }}>{fmt(l.amount)}</div>
                <div style={{ fontSize: 11, color: COLORS.muted }}>{l.date}</div>
              </div>
            </div>
          ))}
        </div>
 
        <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, color: COLORS.ink }}>Recent Expenses</h3>
          {expenses.slice(-5).reverse().map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0F0F5" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{e.reason}</div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>{e.category}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: COLORS.danger }}>{fmt(e.amount)}</div>
                <div style={{ fontSize: 11, color: COLORS.muted }}>{e.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontSize: 15, color: COLORS.ink }}>Registered Members</h3>
          <div style={{ fontSize: 13, color: COLORS.muted }}>{members.length} total member{members.length !== 1 ? "s" : ""}</div>
        </div>
        {members.length === 0 ? (
          <div style={{ color: COLORS.muted, fontSize: 14 }}>No registered members yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0,1fr))", gap: 16 }}>
            {members.map(member => (
              <div key={member.id} style={{ padding: 16, background: "#F8FAFC", borderRadius: 12, minHeight: 120 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{member.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: member.status === "Active" ? COLORS.success : COLORS.danger, fontWeight: 600 }}>{member.status}</span>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>Joined {member.joined}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
