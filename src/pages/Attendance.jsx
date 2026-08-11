import React, { useState, useEffect } from "react";
import { COLORS } from "../config/constants";
import Select from "../components/ui/Select";
import Btn from "../components/ui/Btn";
import Badge from "../components/ui/Badge";
import { dbService } from "../services/dbService";

function Attendance({ meetings, members, attendance, setAttendance, ismobile }) {
  const [meetingId, setMeetingId] = useState("");
  const [present, setPresent] = useState({});
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (meetings.length && !meetingId) setMeetingId(meetings[0].id);
  }, [meetings, meetingId]);

  useEffect(() => {
    const map = {};
    members.forEach(m => { map[String(m.id)] = false; });
    if (meetingId) {
      attendance
        .filter(a => String(a.meeting_id) === String(meetingId) && a.present)
        .forEach(a => { map[String(a.member_id)] = true; });
    }
    setPresent(map);
  }, [meetingId, members, attendance]);

  const meeting = meetings.find(m => String(m.id) === String(meetingId)) || null;
  const presentCount = Object.values(present).filter(Boolean).length;
  const totalMembers = members.length;

  const toggle = (id) => setPresent(prev => ({ ...prev, [String(id)]: !prev[String(id)] }));

  const markAll = (value) => {
    const map = {};
    members.forEach(m => { map[String(m.id)] = value; });
    setPresent(map);
  };

  const save = async () => {
    if (!meetingId) return alert("Select a meeting first.");
    const records = Object.entries(present)
      .filter(([, v]) => v)
      .map(([memberId]) => ({ meeting_id: meetingId, member_id: Number(memberId), present: true }));
    setSaving(true);
    try {
      await dbService.saveAttendance(meetingId, records);
      const stored = records.map(r => ({ ...r, id: Date.now() + Math.random() }));
      setAttendance(prev => prev.filter(a => String(a.meeting_id) !== String(meetingId)).concat(stored));
      showToast(`✅ Attendance saved: ${records.length} of ${totalMembers} members present.`);
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const summary = meetings.map(m => {
    const recs = attendance.filter(a => String(a.meeting_id) === String(m.id));
    const pCount = recs.filter(r => r.present).length;
    return { meeting: m, pCount, tracked: recs.length > 0 };
  });

  return (
    <div>
      {toast && <div style={{ background: COLORS.success, color: "#fff", padding: "12px 20px", borderRadius: 12, marginBottom: 16, fontWeight: 600 }}>{toast}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: COLORS.ink }}>Attendance</h2>
        {meetings.length > 0 && (
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="outline" onClick={() => markAll(true)} style={{ background: "#EEF", color: COLORS.ink, padding: "8px 16px", fontSize: 13 }}>✓ Mark All Present</Btn>
            <Btn variant="outline" onClick={() => markAll(false)} style={{ background: "#EEF", color: COLORS.ink, padding: "8px 16px", fontSize: 13 }}>Reset</Btn>
          </div>
        )}
      </div>

      {meetings.length === 0 ? (
        <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.06)", color: COLORS.muted }}>No meetings scheduled yet. Schedule a meeting to start tracking attendance.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: ismobile ? "1fr" : "1fr 1fr", gap: 20 }}>
          <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, color: COLORS.ink }}>🗓️ Mark Attendance</h3>
            <Select label="Meeting" value={meetingId} onChange={e => setMeetingId(e.target.value)} options={meetings.map(m => ({ value: m.id, label: `${m.title} — ${m.date}${m.time ? " " + m.time : ""}` }))} />
            {meeting && (
              <div style={{ background: COLORS.cream, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ink }}>{meeting.title}</div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{meeting.date}{meeting.time ? ` at ${meeting.time}` : ""}{meeting.venue ? ` · ${meeting.venue}` : ""}</div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: COLORS.muted }}>{presentCount} of {totalMembers} present</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: presentCount > 0 ? COLORS.success : COLORS.muted }}>
                {totalMembers ? Math.round((presentCount / totalMembers) * 100) : 0}%
              </div>
            </div>
            <div style={{ maxHeight: 340, overflowY: "auto", border: "1px solid #F0F0F5", borderRadius: 12 }}>
              {members.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #F0F0F5" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>{m.phone}</div>
                  </div>
                  <button onClick={() => toggle(m.id)} style={{
                    padding: "8px 16px", borderRadius: 99, cursor: "pointer", fontWeight: 700, fontSize: 12, minWidth: 92,
                    border: present[String(m.id)] ? "none" : "1.5px dashed #C5C9D6",
                    background: present[String(m.id)] ? COLORS.success + "22" : "#fff",
                    color: present[String(m.id)] ? COLORS.success : COLORS.muted
                  }}>
                    {present[String(m.id)] ? "✓ Present" : "Absent"}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <Btn onClick={save} disabled={saving} style={{ width: "100%" }}>{saving ? "Saving..." : "Save Attendance"}</Btn>
            </div>
          </div>

          <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, color: COLORS.ink }}>📊 Attendance Summary</h3>
            {summary.map(s => (
              <div key={s.meeting.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F0F0F5" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{s.meeting.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{s.meeting.date}{s.meeting.time ? ` at ${s.meeting.time}` : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {s.tracked ? (
                    <>
                      <Badge text="Tracked" color={COLORS.success} />
                      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{s.pCount} / {totalMembers} present</div>
                    </>
                  ) : (
                    <Badge text="Not tracked" color={COLORS.muted} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;
