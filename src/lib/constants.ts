export const panelFilters = {
  types: ['ALL', 'HOLLOW', 'CORE'],
  shapes: ['L', 'T', 'BOARD'],
  thicknesses: [60, 75, 90, 100, 120, 150, 200],
  lengths: [2440, 2700, 3000],
};

export const filterLabels = {
  panelType: {
    ALL: 'All Panel',
    HOLLOW: 'Hollow Core',
    CORE: 'Solid Core',
  },
  panelShape: {
    L: 'L-Shape',
    T: 'T-Shape',
    BOARD: 'Flat Board',
  },
};

export const orderStatuses = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const dealerStatuses = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
};

export const leadTypes = {
  DEALERSHIP_APPLICATION: 'Dealership Application',
  GENERAL_INQUIRY: 'General Inquiry',
  QUOTATION_REQUEST: 'Quotation Request',
  COMPLAINT: 'Complaint',
};

export const userRoles = {
  ADMIN: 'Administrator',
  STAFF: 'Staff',
  DEALER: 'Dealer',
  CUSTOMER: 'Customer',
};

export const formatCurrency = (amount: number, currency = 'NPR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NPR',
  }).format(amount);
};

export const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};
