import React, { useState } from 'react';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { COLORS, } from '../config/constants';
//import { } from '../config/constants'; // remove REG_FEE if unused elsewhere
import { fmt, monthLabel, getMonthsArray } from '../utils/helpers';

function Dashboard({ members, levies, expenses, meetings, attendance, isMobile }) {
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("finance");
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

const meetingsWithAtt = meetings.filter(m => attendance.some(a => String(a.meeting_id) === String(m.id)));
const avgPresent = meetingsWithAtt.length
  ? Math.round(meetingsWithAtt.reduce((sum, m) => sum + attendance.filter(a => String(a.meeting_id) === String(m.id) && a.present).length, 0) / meetingsWithAtt.length)
  : 0;

const memberLevies = selected
  ? levies.filter(l => String(l.member_id) === String(selected.id)).sort((a, b) => (a.month < b.month ? -1 : 1))
  : [];
const paidLevies = memberLevies.filter(l => l.status === "Paid");
const totalPaid = paidLevies.reduce((a, l) => a + Number(l.amount || 0), 0);
const curMonth = new Date().toISOString().slice(0, 7);
const curMonthPaid = paidLevies.some(l => l.month === curMonth);

const paidMonthSet = new Set();
paidLevies.forEach(l => {
  const count = Math.max(1, Number(l.monthsCount) || 1);
  getMonthsArray(l.month, count).forEach(m => paidMonthSet.add(m));
});

const allMonths = (() => {
  if (!selected) return [];
  const start = (selected.joined || curMonth).slice(0, 7);
  const [sy, sm] = start.split("-").map(Number);
  const [cy, cm] = curMonth.split("-").map(Number);
  const count = (cy - sy) * 12 + (cm - sm) + 1;
  if (count < 1) return [curMonth];
  return getMonthsArray(start, count);
})();

const monthlyRecords = allMonths.map(month => {
  const rec = memberLevies.find(l => l.month === month && l.status === "Paid");
  return { month, paid: paidMonthSet.has(month), date: rec ? rec.date : null, amount: rec ? Number(rec.amount || 0) : 0 };
});

const memberAtt = selected
  ? meetings.map(m => {
      const rec = attendance.find(a => String(a.meeting_id) === String(m.id) && String(a.member_id) === String(selected.id));
      return { meeting: m, tracked: !!rec, present: rec ? !!rec.present : false };
    })
  : [];
const attPresentCount = memberAtt.filter(a => a.tracked && a.present).length;
const attTrackedCount = memberAtt.filter(a => a.tracked).length;
  
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
        <StatCard label="Avg Meeting Attendance" value={avgPresent} sub={meetingsWithAtt.length ? `${meetingsWithAtt.length} meeting${meetingsWithAtt.length!==1?"s":""} tracked` : "No attendance tracked yet"} color="#7B1FA2" />
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
              <div key={member.id} onClick={() => { setSelected(member); setView("finance"); }} style={{ padding: 16, background: "#F8FAFC", borderRadius: 12, minHeight: 120, cursor: "pointer", transition: "background .15s", border: `1.5px solid transparent` }} onMouseEnter={e => { e.currentTarget.style.background = COLORS.accent + "22"; e.currentTarget.style.borderColor = COLORS.accent + "55"; }} onMouseLeave={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "transparent"; }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: COLORS.royal }}>{member.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: member.status === "Active" ? COLORS.success : COLORS.danger, fontWeight: 600 }}>{member.status}</span>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>Joined {member.joined}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {[
              { key: "finance", label: "💰 Financial Record" },
              { key: "attendance", label: "📊 Attendance" }
            ].map(t => (
              <button key={t.key} onClick={() => setView(t.key)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                background: view === t.key ? COLORS.royal : COLORS.cream,
                color: view === t.key ? COLORS.white : COLORS.muted,
                transition: "all .15s"
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {view === "finance" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: COLORS.ink }}>💰 Financial Record</h3>
                <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.success }}>Total Paid: {fmt(totalPaid)}</div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: COLORS.royal }}>
                    {["Month","Date","Amount","Status"].map(h => (
                      <th key={h} style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: .5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "16px 14px", textAlign: "center", color: COLORS.muted, fontSize: 14 }}>No levy records found.</td>
                    </tr>
                  ) : monthlyRecords.slice().reverse().map((r, i) => (
                    <tr key={r.month} style={{ background: i%2===0 ? COLORS.cream : COLORS.white }}>
                      <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{monthLabel(r.month)}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13 }}>{r.paid ? r.date : "-"}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700 }}>{r.paid ? fmt(r.amount) : "-"}</td>
                      <td style={{ padding: "10px 14px" }}><Badge text={r.paid ? "Paid" : "Unpaid"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
                <div style={{ background: COLORS.success + "22", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Months Paid</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.success }}>{paidMonthSet.size}</div>
                </div>
                <div style={{ background: COLORS.accent + "22", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Avg / Month</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.accent }}>{paidLevies.length ? fmt(Math.round(totalPaid / paidLevies.length)) : fmt(0)}</div>
                </div>
                <div style={{ background: (curMonthPaid ? COLORS.success : COLORS.danger) + "22", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>This Month</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: curMonthPaid ? COLORS.success : COLORS.danger }}>{curMonthPaid ? "Paid" : "Unpaid"}</div>
                </div>
              </div>
            </>
          )}

          {view === "attendance" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: COLORS.ink }}>📊 Attendance Record</h3>
                <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.success }}>Present {attPresentCount}/{attTrackedCount}</div>
              </div>

              {memberAtt.length === 0 ? (
                <div style={{ color: COLORS.muted, fontSize: 14, padding: "16px 0" }}>No meetings scheduled yet.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: COLORS.royal }}>
                      {["Meeting","Date","Time","Status"].map(h => (
                        <th key={h} style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: .5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {memberAtt.map((a, i) => (
                      <tr key={a.meeting.id} style={{ background: i%2===0 ? COLORS.cream : COLORS.white }}>
                        <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{a.meeting.title}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13 }}>{a.meeting.date}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13 }}>{a.meeting.time || "-"}</td>
                        <td style={{ padding: "10px 14px" }}><Badge text={a.tracked ? (a.present ? "Present" : "Absent") : "Not Tracked"} color={a.tracked ? (a.present ? COLORS.success : COLORS.danger) : COLORS.muted} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
                <div style={{ background: COLORS.success + "22", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Meetings</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>{memberAtt.length}</div>
                </div>
                <div style={{ background: COLORS.accent + "22", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Present</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.success }}>{attPresentCount}</div>
                </div>
                <div style={{ background: COLORS.danger + "22", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Absent</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.danger }}>{attTrackedCount - attPresentCount}</div>
                </div>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;
