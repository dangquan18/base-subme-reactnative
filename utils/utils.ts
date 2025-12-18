// utils.js
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
    case 'approved':
      return '#4CAF50'; // Green
    case 'pending':
      return '#FFC107'; // Orange
    case 'inactive':
      return '#F44336'; // Red
    default:
      return '#757575'; // Grey
  }
};