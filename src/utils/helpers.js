export const fmt = (n) => "₦" + Number(n).toLocaleString();
export const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const monthLabel = (str) => { const [y,m] = str.split("-"); return `${months[parseInt(m)-1]} ${y}`; };
export const today = () => new Date().toISOString().slice(0,10);

export const getMonthsArray = (startMonth, count) => {
  const [year, month] = startMonth.split("-").map(Number);
  const result = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(year, month - 1 + i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    result.push(`${y}-${m}`);
  }
  return result;
};