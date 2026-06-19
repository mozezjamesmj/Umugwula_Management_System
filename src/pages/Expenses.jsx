import React, { useState } from "react";
import { COLORS } from "../config/constants";
import { fmt, today } from "../utils/helpers";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Btn from "../components/ui/Btn";
import { dbService } from "../services/dbService";

function Expenses({ expenses, setExpenses }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ amount: "", date: today(), reason: "", category: "" });
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const save = async () => {
  if (!form.amount || !form.reason) {
    alert("Amount and reason are required.");
    return;
  }

  const expenseData = {
    amount: parseFloat(form.amount),
    date: form.date,
    reason: form.reason,
    category: form.category
  };

  try {
    const newExpense = await dbService.addExpense(expenseData);
    setExpenses(prev => [...prev, newExpense]);
    setModal(false);
    setForm({ amount: "", date: today(), reason: "", category: "" });
    showToast(`✅ Expense of ${fmt(newExpense.amount)} recorded.`);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

  const categories = ["Venue", "Catering", "Utilities", "Maintenance", "Supplies", "Other"];

  return (
    <div>
      {toast && <div style={{ background: COLORS.success, color: "#fff", padding: "12px 20px", borderRadius: 12, marginBottom: 16, fontWeight: 600 }}>{toast}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: COLORS.ink }}>Expenses ({expenses.length})</h2>
        <Btn onClick={() => setModal(true)}>+ Record Expense</Btn>
      </div>

      <div style={{ background: COLORS.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: COLORS.royal }}>
              {["Date","Reason","Category","Amount"].map(h => (
                <th key={h} style={{ color: "#fff", padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, letterSpacing: .5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, i) => (
              <tr key={e.id} style={{ background: i%2===0 ? COLORS.cream : COLORS.white }}>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{e.date}</td>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{e.reason}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{e.category}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: COLORS.danger }}>{fmt(e.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Record New Expense" onClose={() => setModal(false)}>
          <Input label="Amount *" type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="e.g. 15000" />
          <Input label="Date" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
          <Input label="Reason *" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="e.g. Hall rental" />
          <Select label="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} options={categories.map(c=>({value:c,label:c}))} />
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn onClick={save} style={{ flex: 1 }}>Record Expense</Btn>
            <Btn variant="outline" onClick={() => setModal(false)} style={{ background: "#EEF", color: COLORS.ink }}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Expenses;
