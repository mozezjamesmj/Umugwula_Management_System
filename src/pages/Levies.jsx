import React, { useState } from "react";
import { COLORS, LEVY_AMOUNT } from "../config/constants";
//import { fmt, monthLabel, today } from "../utils/helpers";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Btn from "../components/ui/Btn";
import Badge from "../components/ui/Badge";
import { dbService } from "../services/dbService";
import { fmt, monthLabel, today, getMonthsArray } from "../utils/helpers";

function Levies({ members, levies, setLevies, ismobile }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ memberId: "", month: new Date().toISOString().slice(0,7), monthsCount: 1, date: today() });
  const [toast, setToast] = useState("");
  const [sendModal, setSendModal] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(); d.setMonth(d.getMonth() + i);
    const val = d.toISOString().slice(0,7);
    monthOptions.push({ value: val, label: monthLabel(val) });
  }

 const save = async () => {
  if (!form.memberId) {
    alert("Select a member.");
    return;
  }

  const memberName = members.find(m => String(m.id) === String(form.memberId))?.name;
  const monthsToRecord = getMonthsArray(form.month, form.monthsCount);

  try {
    const insertedLevies = [];
    for (const month of monthsToRecord) {
      const levyData = {
        member_id: form.memberId,
        member_name: memberName,
        month,
        months_count: 1,
        amount: LEVY_AMOUNT,
        date: form.date,
        status: "Paid"
      };
      const newLevy = await dbService.addLevy(levyData);
      insertedLevies.push(newLevy);
    }

    setLevies(prev => [...prev, ...insertedLevies]);
    setModal(false);
    setForm({
      memberId: "",
      month: new Date().toISOString().slice(0, 7),
      monthsCount: 1,
      date: today()
    });
    showToast(`✅ Levy of ${fmt(LEVY_AMOUNT * monthsToRecord.length)} recorded for ${memberName} (${monthsToRecord.length} month${monthsToRecord.length > 1 ? "s" : ""}).`);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

  const sendReminder = (l) => {
    alert(`Simulating WhatsApp reminder to ${l.memberName} for ${monthLabel(l.month)} levy.`);
    setSendModal(null);
    showToast(`📲 Reminder sent to ${l.memberName}.`);
  };

  return (
    <div>
      {toast && <div style={{ background: COLORS.success, color: "#fff", padding: "12px 20px", borderRadius: 12, marginBottom: 16, fontWeight: 600 }}>{toast}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: COLORS.ink }}>Levy Payments ({levies.length})</h2>
        <Btn onClick={() => setModal(true)}>+ Record Levy</Btn>
      </div>

      <div style={{ background: COLORS.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: COLORS.royal }}>
              {["Member","Month","Amount","Date","Status","Actions"].map(h => (
                <th key={h} style={{ color: "#fff", padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, letterSpacing: .5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {levies.map((l, i) => (
              <tr key={l.id} style={{ background: i%2===0 ? COLORS.cream : COLORS.white }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{l.member_name}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{monthLabel(l.month)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{fmt(l.amount)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{l.date}</td>
                <td style={{ padding: "12px 16px" }}><Badge text={l.status} /></td>
                <td style={{ padding: "12px 16px" }}>
                  {l.status === "Unpaid" && (
                    <Btn variant="outline" onClick={() => setSendModal(l)} style={{ padding: "4px 8px", fontSize: 11 }}>Remind</Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Record New Levy Payment" onClose={() => setModal(false)}>
          <Select
            label="Member"
            value={form.memberId}
            onChange={e=>setForm({...form,memberId:e.target.value})}
            options={[
              { value: "", label: "Select Member" },
              ...members.map(m => ({
                value: m.id,
                label: `${m.name} — ${m.phone}`
              }))
            ]}
          />
          <Select label="Month" value={form.month} onChange={e=>setForm({...form,month:e.target.value})} options={monthOptions} />
          <Input label="Number of Months" type="number" value={form.monthsCount} onChange={e=>setForm({...form,monthsCount:parseInt(e.target.value)})} min="1" />
          <Input label="Payment Date" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
          <div style={{ background: COLORS.accent + "22", border: `1.5px solid ${COLORS.accent}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, marginTop: 16 }}>
            <div style={{ fontWeight: 700, color: COLORS.ink, fontSize: 14 }}>₦{form.monthsCount * LEVY_AMOUNT} will be recorded.</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>This is {form.monthsCount} month(s) of levy at {fmt(LEVY_AMOUNT)}/month.</div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn onClick={save} style={{ flex: 1 }}>Record Levy Payment</Btn>
            <Btn variant="outline" onClick={() => setModal(false)} style={{ background: "#EEF", color: COLORS.ink }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {sendModal && (
        <Modal title="Send Levy Reminder" onClose={() => setSendModal(null)}>
          <div style={{ fontSize: 14, color: COLORS.ink, marginBottom: 20 }}>
            Send a WhatsApp reminder to <span style={{ fontWeight: 700 }}>{sendModal.memberName}</span> for the <span style={{ fontWeight: 700 }}>{monthLabel(sendModal.month)}</span> levy?
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn variant="success" onClick={() => sendReminder(sendModal)} style={{ flex: 1 }}>📲 Confirm & Send</Btn>
            <Btn variant="outline" onClick={() => setSendModal(null)} style={{ background: "#EEF", color: COLORS.ink }}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Levies;
