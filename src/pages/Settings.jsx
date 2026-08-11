import React, { useState } from "react";
import { COLORS } from "../config/constants";
import { fmt } from "../utils/helpers";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Btn from "../components/ui/Btn";
import Badge from "../components/ui/Badge";
import { dbService } from "../services/dbService";

function Settings({ members, setMembers, levies, setLevies, levyAmount, setLevyAmount, regFee, setRegFee, ismobile }) {
  const [toast, setToast] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [levyDraft, setLevyDraft] = useState(levyAmount);
  const [regFeeDraft, setRegFeeDraft] = useState(regFee);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await dbService.deleteMember(toDelete.id);
      setMembers(prev => prev.filter(m => m.id !== toDelete.id));
      setLevies(prev => prev.filter(l => String(l.member_id) !== String(toDelete.id)));
      setToDelete(null);
      showToast(`🗑️ ${toDelete.name} deleted.`);
    } catch (err) {
      console.error("Error deleting member:", err);
      alert("Failed to delete member. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const saveFees = () => {
    const newLevy = Math.max(0, Number(levyDraft) || 0);
    const newReg = Math.max(0, Number(regFeeDraft) || 0);
    setLevyAmount(newLevy);
    setRegFee(newReg);
    setLevyDraft(newLevy);
    setRegFeeDraft(newReg);
    showToast(`✅ Levy fee set to ${fmt(newLevy)} and registration fee set to ${fmt(newReg)}.`);
  };

  return (
    <div>
      {toast && <div style={{ background: COLORS.success, color: "#fff", padding: "12px 20px", borderRadius: 12, marginBottom: 16, fontWeight: 600 }}>{toast}</div>}

      <div style={{ display: "grid", gridTemplateColumns: ismobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 28 }}>
        <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, color: COLORS.ink }}>💰 Levy Fee</h3>
          <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>Amount recorded per month for each member.</div>
          <Input label="Levy Amount (per month)" type="number" min="0" value={levyDraft} onChange={e => setLevyDraft(e.target.value)} />
        </div>

        <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, color: COLORS.ink }}>📋 Registration Fee</h3>
          <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>Amount recorded when a new member registers.</div>
          <Input label="Registration Fee" type="number" min="0" value={regFeeDraft} onChange={e => setRegFeeDraft(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <Btn onClick={saveFees} variant="success">
          Save Fee Settings
        </Btn>
      </div>

      <div style={{ background: COLORS.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid #F0F0F5" }}>
          <h3 style={{ margin: 0, fontSize: 15, color: COLORS.ink }}>🗑️ Manage Members</h3>
          <div style={{ fontSize: 13, color: COLORS.muted }}>{members.length} total</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: ismobile ? "auto" : 600 }}>
          <thead>
            <tr style={{ background: COLORS.royal }}>
              {["Name","Phone","Status","Action"].map(h => (
                <th key={h} style={{ color: "#fff", padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, letterSpacing: .5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.id} style={{ background: i%2===0 ? COLORS.cream : COLORS.white }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{m.name}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{m.phone}</td>
                <td style={{ padding: "12px 16px" }}><Badge text={m.status} /></td>
                <td style={{ padding: "12px 16px" }}>
                  <Btn variant="danger" onClick={() => setToDelete(m)} style={{ padding: "6px 12px", fontSize: 12 }}>Delete</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toDelete && (
        <Modal title="Delete Member" onClose={() => setToDelete(null)}>
          <div style={{ fontSize: 14, color: COLORS.ink, marginBottom: 20 }}>
            Delete <span style={{ fontWeight: 700 }}>{toDelete.name}</span> permanently?<br />
            <span style={{ fontSize: 12, color: COLORS.muted }}>All their levy payment records will also be removed.</span>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn variant="danger" onClick={confirmDelete} disabled={deleting} style={{ flex: 1 }}>
              {deleting ? "Deleting..." : "Yes, Delete"}
            </Btn>
            <Btn variant="outline" onClick={() => setToDelete(null)} style={{ background: "#EEF", color: COLORS.ink }}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Settings;
