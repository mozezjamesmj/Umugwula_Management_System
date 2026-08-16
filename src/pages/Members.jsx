import React, { useState } from "react";
import { COLORS } from "../config/constants";
import { fmt, today, monthLabel } from "../utils/helpers";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Btn from "../components/ui/Btn";
import Badge from "../components/ui/Badge";
import { dbService } from "../services/dbService";

function Members({ members, setMembers, levies, regFee, isMobile }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", gender: "Male", joined: today(), status: "Active" });
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filteredMembers = members.filter(m =>
    (m.name || "").toLowerCase().includes(query.toLowerCase()) ||
    (m.phone || "").includes(query) ||
    (m.email || "").toLowerCase().includes(query.toLowerCase())
  );

  const save = async () => {
  if (!form.name ||  !form.phone) return alert("Name and phone are required.");

  const phoneExists = members.some(
    m => m.phone.trim() === form.phone.trim()
  );
  if (phoneExists) {
    alert("⚠️ Account already exists with this phone number.");
    return;
  }

  try {
    const newMemberData = {
        ...form,
        reg_fee_paid: true,
        reg_fee_amount: regFee,
        reg_fee_date: today()
      };
    const savedMember = await dbService.addMember(newMemberData);

    setMembers(prev => [...prev, savedMember]);
    setModal(false);
    setForm({ name: "", phone: "", email: "", gender: "Male", joined: today(), status: "Active" });
    showToast(`✅ ${form.name} registered successfully.`);
  } catch (err) {
    console.error("Error saving member:", err);
    if (err.code === "23505") {
      alert("⚠️ Account already exists with this phone number.");
    } else {
      alert("Failed to save member to database.");
    }
  }
};

  const getLevyStatus = (memberId) => {
    const cur = new Date().toISOString().slice(0,7);
    const paid = levies.filter(l=>String(l.member_id)===String(memberId)&&l.status==="Paid").map(l=>l.month);
    return paid.includes(cur) ? "Paid" : "Unpaid";
  };

  const memberLevies = selected
    ? levies.filter(l => String(l.member_id) === String(selected.id)).sort((a, b) => (a.month < b.month ? -1 : 1))
    : [];
  const paidLevies = memberLevies.filter(l => l.status === "Paid");
  const totalPaid = paidLevies.reduce((a, l) => a + Number(l.amount || 0), 0);
  const curMonth = new Date().toISOString().slice(0, 7);
  const curMonthPaid = paidLevies.some(l => l.month === curMonth);

  return (
    <div>
      {toast && <div style={{ background: COLORS.success, color: "#fff", padding: "12px 20px", borderRadius: 12, marginBottom: 16, fontWeight: 600 }}>{toast}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, "column" : "row", gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: COLORS.ink }}>Members ({members.length})</h2>
        <Btn onClick={() => setModal(true)}>+ Register Member</Btn>
      </div>

      <div style={{ background: COLORS.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F0F5" }}>
          <Input label="Search Members" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, phone, or email..." />
        </div>
        <div className="table-container no-scrollbar"></div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? "auto" : 600 }}>
          <thead>
            <tr style={{ background: COLORS.royal }}>
              {["Name","Gender","Phone","Email","Joined","Reg Fee","Levy","Status"].map(h => (
                <th key={h} style={{ color: "#fff", padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, letterSpacing: .5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "24px 16px", textAlign: "center", color: COLORS.muted, fontSize: 14 }}>
                  {members.length === 0 ? "No members registered yet." : `No members match "${query}".`}
                </td>
              </tr>
            ) : filteredMembers.map((m, i) => (
              <tr key={m.id} onClick={() => setSelected(m)} style={{ background: i%2===0 ? COLORS.cream : COLORS.white, cursor: "pointer", transition: "background .15s" }} onMouseEnter={e => { e.currentTarget.style.background = COLORS.accent + "22"; }} onMouseLeave={e => { e.currentTarget.style.background = i%2===0 ? COLORS.cream : COLORS.white; }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{m.name}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{m.gender || "-"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{m.phone}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{m.email}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{m.joined}</td>
                <td style={{ padding: "12px 16px" }}><Badge text={m.reg_fee_paid ? "Paid" : "Unpaid"} /></td>
                <td style={{ padding: "12px 16px" }}><Badge text={getLevyStatus(m.id)} /></td>
                <td style={{ padding: "12px 16px" }}><Badge text={m.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: COLORS.ink }}>💰 Financial Record</h3>
            <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.success }}>Total Paid: {fmt(totalPaid)}</div>
          </div>

          {memberLevies.length === 0 ? (
            <div style={{ color: COLORS.muted, fontSize: 14, padding: "16px 0" }}>No levy payments recorded yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: COLORS.royal }}>
                  {["Month","Date","Amount","Status"].map(h => (
                    <th key={h} style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: .5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {memberLevies.map((l, i) => (
                  <tr key={l.id} style={{ background: i%2===0 ? COLORS.cream : COLORS.white }}>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{monthLabel(l.month)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13 }}>{l.date}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700 }}>{fmt(l.amount)}</td>
                    <td style={{ padding: "10px 14px" }}><Badge text={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
            <div style={{ background: COLORS.success + "22", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Months Paid</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.success }}>{paidLevies.length}</div>
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
        </Modal>
      )}

      {modal && (
        <Modal title="Register New Member" onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>


            <div style={{ background: COLORS.accent + "22", border: `1.5px solid ${COLORS.accent}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: COLORS.ink, fontSize: 14 }}>📋 Registration Fee: {fmt(regFee)}</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>This fee is recorded as paid upon registration.</div>
          </div>


            <Input label="Full Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Adaeze Okonkwo" />
            <Select label="Gender *" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} options={[{value:"Male",label:"Male"},{value:"Female",label:"Female"}]} />
            <Input label="Phone Number *" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="e.g. 08012345678" />
            <Input label="Email Address" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="e.g. member@mail.com" />
            <Input label="Date Joined" type="date" value={form.joined} onChange={e=>setForm({...form,joined:e.target.value})} />
            <Select label="Status" value={form.status} onChange={e=>setForm({...form,status:e.target.value})} options={[{value:"Active",label:"Active"},{value:"Inactive",label:"Inactive"}]} />
            <div style={{ display: "flex", gap: 12, marginTop: 8,"column" : "row" }}>
              <Btn onClick={save} style={{ flex: 1 }}>Register & Record Fee</Btn>
              <Btn variant="outline" onClick={() => setModal(false)} style={{ background: "#EEF", color: COLORS.ink }}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


export default Members;
