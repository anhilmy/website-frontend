/** Defaults mirror website-backend AppSettings so print/login never block on a failed fetch. */
export const DEFAULT_SETTINGS = {
  id: 1,
  systemName: 'Counter',
  companyName: 'ChocoCaffe',
  location: 'Jakarta',
  taxNumber: '',
  receiptFooter: 'Thank you for your visit',
  billFooter: '',
  receiptNumberFormat: '{:year}{:month}-{:order_no}',
  receiptNumberPadding: 4,
  receiptSequenceReset: 'YEARLY',
  showSystemName: true,
  showCompanyName: true,
  showLocation: true,
  showTaxNumber: false,
  showDate: true,
  showCustomer: true,
  showCashier: true,
  showPaymentMethod: true,
  showReference: true,
  showTendered: true,
  showChange: true,
  showFooter: true,
}

export const DEFAULT_BRANDING = {
  systemName: 'Counter',
  companyName: 'ChocoCaffe',
  location: 'Jakarta',
}
