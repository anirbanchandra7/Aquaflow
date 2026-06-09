// Google Sheets tab structure. Each tab acts as one "table";
// row 1 of every tab is the header row defined here.

export const SHEETS = {
  Distributors: [
    'id',
    'company_name',
    'trade_license',
    'registration_doc_url',
    'contact_email',
    'contact_phone',
    'emirate',
    'status',
    'created_at',
  ],
  Admins: [
    'id',
    'distributor_id',
    'name',
    'email',
    'password_hash',
    'status',
  ],
  Customers: [
    'id',
    'distributor_id',
    'name',
    'phone',
    'address',
    'emirate',
    'type', // one_time | subscription
    'subscription_frequency',
    'subscription_qty',
    'last_order_date',
    'next_followup_date',
    'notes',
    'created_at',
  ],
  Drivers: [
    'id',
    'distributor_id',
    'name',
    'phone',
    'email',
    'password_hash',
    'status', // active | inactive
    'is_live', // true | false
    'created_at',
  ],
  Orders: [
    'id',
    'distributor_id',
    'customer_id',
    'driver_id',
    'type', // one_time | subscription
    'qty',
    'status', // pending | assigned | in_transit | delivered | cancelled
    'scheduled_date',
    'delivered_at',
    'notes',
    'created_at',
  ],
  SupportTickets: [
    'id',
    'distributor_id',
    'raised_by_admin_id',
    'subject',
    'description',
    'status', // open | in_progress | resolved
    'created_at',
    'resolved_at',
    'resolution_note',
  ],
};

export const SHEET_NAMES = Object.keys(SHEETS);

// Allowed enum values, used for input validation in route handlers.
export const ENUMS = {
  customerType: ['one_time', 'subscription'],
  driverStatus: ['active', 'inactive'],
  orderType: ['one_time', 'subscription'],
  orderStatus: ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'],
  ticketStatus: ['open', 'in_progress', 'resolved'],
  emirates: [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
  ],
};
