import React, { useState, useEffect } from "react";
import { COLORS, REG_FEE } from "./config/constants";
import { seedMembers, seedLevies, seedExpenses, seedMeetings } from "./data/seedData";
import { fmt } from "./utils/helpers";
import { tabs } from "./config/tabs";
import { dbService } from "./services/dbService";
import { supabase } from "./config/supabaseClient";

import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Levies from "./pages/Levies";
import Expenses from "./pages/Expenses";
import Meetings from "./pages/Meetings";
import LoginModal from "./components/auth/LoginModal";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [members, setMembers] = useState([]);
  const [levies, setLevies] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for Auth State Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
      if (!session) setTab("dashboard");
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, l, e, mt] = await Promise.all([
          dbService.getMembers(),
          dbService.getLevies(),
          dbService.getExpenses(),
          dbService.getMeetings()
        ]);
        setMembers(m || seedMembers);
        setLevies(l || seedLevies);
        setExpenses(e || seedExpenses);
        setMeetings(mt || seedMeetings);
      } catch (err) {
        console.error("Data fetch error:", err);
        // If not logged in, we might get RLS errors, which is expected
        if (isAdmin) {
          setMembers(seedMembers);
          setLevies(seedLevies);
          setExpenses(seedExpenses);
          setMeetings(seedMeetings);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAdmin]);

  const handleLogout = async () => {
    await dbService.logout();
    setIsAdmin(false);
    setTab("dashboard");
  };

  const totalCollected = levies.filter(l=>l.status==="Paid").reduce((a,l)=>a + Number(l.amount || 0), 0);
  const totalExpenses = expenses.reduce((a,e)=>a + Number(e.amount || 0), 0);
  const totalRegFees = members
  .filter(m => m.reg_fee_paid)
  .reduce((sum, m) => sum + Number(m.reg_fee_amount || 0), 0);
  const balance = totalCollected + totalRegFees - totalExpenses;
  //const totalCollected = levies.filter(l=>l.status==="Paid").reduce((a,l)=>a+l.amount,0);
  //const totalExpenses = expenses.reduce((a,e)=>a+e.amount,0);
  //const balance = totalCollected + members.filter(m=>m.regFeePaid).length * REG_FEE - totalExpenses;

  if (loading) {
    return <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F0F2F8", color: COLORS.ink, fontWeight: 700 }}>Loading Umuguwala Association Data...</div>;
  }

  const NavContent = () => (
    <>
      <div style={{ padding: "0 24px 28px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Umugwuala Family Association</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.white }}>ManagementSystem</div>
      </div>

      {/* Balance + Admin Login*/}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
        <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Balance</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.accent }}>{fmt(balance)}</div>
        <div style={{ marginTop: 12 }}>
          {isAdmin ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success }} />
              <span style={{ color: COLORS.success, fontSize: 12, fontWeight: 700 }}>Admin Active</span>
              <button onClick={() => { setIsAdmin(false); setTab("dashboard"); }} style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 11, cursor: "pointer", marginLeft: 4 }}>Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ background: COLORS.royal, color: COLORS.white, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%" }}>
              🔐 Admin Login
            </button>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {tabs.map(t => {
          const locked = !t.public && !isAdmin;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => { 
              if (!locked) {
                setTab(t.key);
                setMobileMenuOpen(false);
              } else {
                setShowLogin(true);
              }
            }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: "none", background: active ? COLORS.royal : "transparent", color: active ? COLORS.white : locked ? COLORS.muted : "rgba(255,255,255,.75)", fontWeight: active ? 700 : 500, fontSize: 14, cursor: "pointer", marginBottom: 4, textAlign: "left", transition: "all .15s" }}>
              {t.label}
              {locked && <span style={{ marginLeft: "auto", fontSize: 10 }}>🔒</span>}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 11, color: COLORS.muted }}>
        n8n · Google Sheets · WhatsApp
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2F8", fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile Header */}
      {isMobile && (
        <header style={{ height: 60, background: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ color: COLORS.white, fontWeight: 900, fontSize: 18 }}>  </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", color: COLORS.white, fontSize: 24, cursor: "pointer" }}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>
      )}

      <div style={{ display: "flex", minHeight: isMobile ? "calc(100vh - 60px)" : "100vh" }}>
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <aside style={{ width: 240, background: COLORS.ink, display: "flex", flexDirection: "column", padding: "28px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
            <NavContent />
          </aside>
        )}

        {/* Sidebar - Mobile Overlay */}
        {isMobile && mobileMenuOpen && (
          <aside style={{ position: "fixed", top: 60, left: 0, right: 0, bottom: 0, background: COLORS.ink, zIndex: 99, display: "flex", flexDirection: "column", padding: "20px 0" }}>
            <NavContent />
          </aside>
        )}

        {/* Main Content */}
        <main style={{ flex: 1, padding: isMobile ? "20px" : "32px", width: "100%", overflowX: "hidden" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: isMobile ? 22 : 28, fontWeight: 900, color: COLORS.ink }}>
              {tabs.find(t=>t.key===tab)?.label.split(" ").slice(1).join(" ")}
            </h1>
            <div style={{ fontSize: 13, color: COLORS.muted }}>
              {tab === "dashboard" && "Overview of association's financial health"}
              {tab === "members" && "Manage member registrations"}
              {tab === "levies" && "Track monthly payments"}
              {tab === "expenses" && "Review all expenditures"}
              {tab === "meetings" && "Schedule and notify"}
            </div>
          </div>

          <div style={{ width: "100%" }}>
            {tab === "dashboard" && <Dashboard members={members} levies={levies} expenses={expenses} isMobile={isMobile} />}
            {tab === "members"   && isAdmin && <Members members={members} setMembers={setMembers} levies={levies} isMobile={isMobile} />}
            {tab === "levies"    && isAdmin && <Levies members={members} levies={levies} setLevies={setLevies} isMobile={isMobile} />}
            {tab === "expenses"  && isAdmin && <Expenses expenses={expenses} setExpenses={setExpenses} isMobile={isMobile} />}
            {tab === "meetings"  && isAdmin && <Meetings meetings={meetings} setMeetings={setMeetings} members={members} isMobile={isMobile} />}

            {!["dashboard"].includes(tab) && !isAdmin && (
              <div style={{ textAlign: "center", padding: isMobile ? "40px 20px" : "80px" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.ink, marginBottom: 8 }}>Admin Access Required</div>
                <div style={{ color: COLORS.muted, marginBottom: 24 }}>Please log in to access this section.</div>
                <button onClick={() => setShowLogin(true)} style={{ background: COLORS.royal, color: COLORS.white, border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Login as Admin</button>
              </div>
            )}
          </div>
        </main>
      </div>

      {showLogin && <LoginModal onLogin={() => { setIsAdmin(true); setShowLogin(false); }} onClose={() => setShowLogin(false)} />}
    </div>
  );
}