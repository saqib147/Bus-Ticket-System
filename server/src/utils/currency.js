export const CURRENCY_CODE = (process.env.CURRENCY || 'pkr').toLowerCase();

export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return `Rs. ${value.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
