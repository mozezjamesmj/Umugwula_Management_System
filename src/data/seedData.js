export const seedMembers = [
  { id: 1, name: "Adaeze Okonkwo", gender: "Female", phone: "08012345678", email: "adaeze@mail.com", joined: "2024-01-15", status: "Active", reg_fee_paid: true },
  { id: 2, name: "Emeka Nwosu",    gender: "Male",   phone: "08023456789", email: "emeka@mail.com",  joined: "2024-02-10", status: "Active", reg_fee_paid: true },
  { id: 3, name: "Ngozi Eze",      gender: "Female", phone: "08034567890", email: "ngozi@mail.com",  joined: "2024-03-05", status: "Active", reg_fee_paid: true },
];

export const seedLevies = [
  { id: 1, member_id: 1, memberName: "Adaeze Okonkwo", month: "2025-01", monthsCount: 1, amount: 2000, date: "2025-01-05", status: "Paid" },
  { id: 2, member_id: 2, memberName: "Emeka Nwosu",    month: "2025-01", monthsCount: 1, amount: 2000, date: "2025-01-06", status: "Paid" },
  { id: 3, member_id: 1, memberName: "Adaeze Okonkwo", month: "2025-02", monthsCount: 1, amount: 2000, date: "2025-02-04", status: "Paid" },
  { id: 4, member_id: 3, memberName: "Ngozi Eze",      month: "2025-01", monthsCount: 2, amount: 4000, date: "2025-01-10", status: "Paid" },
];

export const seedExpenses = [
  { id: 1, amount: 15000, date: "2025-01-20", reason: "Hall rental for January meeting", category: "Venue" },
  { id: 2, amount: 8000,  date: "2025-02-15", reason: "Refreshments for February meeting", category: "Catering" },
];

export const seedMeetings = [
  { id: 1, title: "Monthly General Meeting", date: "2025-07-05", time: "10:00", venue: "Community Hall", notes: "Attendance is compulsory" },
];
