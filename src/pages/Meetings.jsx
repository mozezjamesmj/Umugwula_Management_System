import React, { useState } from "react";
import { COLORS } from "../config/constants";
import { today } from "../utils/helpers";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Btn from "../components/ui/Btn";

function Meetings({ meetings, setMeetings, members }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", date: today(), time: "", venue: "", notes: "" });
  const [toast, setToast] = useState("");
  const [sendModal, setSendModal] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const save = () => {
    if (!form.title || !form.date || !form.time) return alert("Title, date, and time are required.");
    const newMeeting = { ...form, id: Date.now() };
    setMeetings(prev => [...prev, newMeeting]);
    setModal(false);
    setForm({ title: "", date: today(), time: "", venue: "", notes: "" });
    showToast(`✅ Meeting '${form.title}' scheduled.`);
  };

  const sendReminder = (meeting) => {
    const memberPhones = members.map(m => m.phone).join(', ');
    alert(`Simulating WhatsApp reminder for meeting '${meeting.title}' to members: ${memberPhones}`);
    setSendModal(null);
    showToast(`📲 Reminder sent for '${meeting.title}'.`);
  };

  return (
    <div>
      {toast && <div style={{ background: COLORS.success, color: "#fff", padding: "12px 20px", borderRadius: 12, marginBottom: 16, fontWeight: 600 }}>{toast}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: COLORS.ink }}>Meetings ({meetings.length})</h2>
        <Btn onClick={() => setModal(true)}>+ Schedule Meeting</Btn>
      </div>

      <div style={{ background: COLORS.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: COLORS.royal }}>
              {["Title","Date","Time","Venue","Notes","Actions"].map(h => (
                <th key={h} style={{ color: "#fff", padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, letterSpacing: .5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meetings.map((m, i) => (
              <tr key={m.id} style={{ background: i%2===0 ? COLORS.cream : COLORS.white }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{m.title}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{m.date}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{m.time}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{m.venue}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{m.notes}</td>
                <td style={{ padding: "12px 16px" }}>
                  <Btn variant="outline" onClick={() => setSendModal(m)} style={{ padding: "4px 8px", fontSize: 11 }}>Remind All</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Schedule New Meeting" onClose={() => setModal(false)}>
          <Input label="Title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Monthly General Meeting" />
          <Input label="Date *" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
          <Input label="Time *" type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} />
          <Input label="Venue" value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} placeholder="e.g. Community Hall" />
          <Input label="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="e.g. Attendance is compulsory" />
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn onClick={save} style={{ flex: 1 }}>Schedule Meeting</Btn>
            <Btn variant="outline" onClick={() => setModal(false)} style={{ background: "#EEF", color: COLORS.ink }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {sendModal && (
        <Modal title="Send Meeting Reminder" onClose={() => setSendModal(null)}>
          <div style={{ fontSize: 14, color: COLORS.ink, marginBottom: 20 }}>
            Send a WhatsApp reminder to all members for the meeting: <span style={{ fontWeight: 700 }}>{sendModal.title}</span> on <span style={{ fontWeight: 700 }}>{sendModal.date}</span> at <span style={{ fontWeight: 700 }}>{sendModal.time}</span>?
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

export default Meetings;
