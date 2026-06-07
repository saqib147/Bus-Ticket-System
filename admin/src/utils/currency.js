export const CURRENCY_CODE = 'PKR';

export const formatCurrency = (amount, options = {}) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
};
