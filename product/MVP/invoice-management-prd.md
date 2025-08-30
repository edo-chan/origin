# PRD: Basic Invoice Creation & Management

## Feature Overview

### Purpose
Provide a streamlined invoice creation and management system that enables small businesses to create professional invoices, track payments, and manage customer relationships, directly integrated with their bookkeeping workflow.

### Objectives
1. Create and send professional invoices in <2 minutes
2. Automate payment tracking and reconciliation
3. Reduce payment collection time by 30%
4. Support multiple payment methods (ACH, cards, checks)
5. Maintain 100% accuracy in revenue recognition

## User Stories & Acceptance Criteria

### Epic: Invoice Creation

#### Story 1: Quick Invoice Creation
**As a** service provider  
**I want to** create invoices quickly  
**So that** I can bill clients immediately after work completion

**Acceptance Criteria:**
- Create invoice from dashboard in 3 clicks
- Auto-populate business information
- Smart customer search/autocomplete
- Line item templates for common services
- Automatic invoice numbering
- Real-time total calculation
- Save as draft or send immediately
- Mobile-responsive invoice builder

#### Story 2: Professional Templates
**As a** business owner  
**I want to** use professional invoice templates  
**So that** my brand looks polished and trustworthy

**Acceptance Criteria:**
- 5+ professional templates available
- Custom logo upload (PNG, JPG, SVG)
- Brand color customization
- Custom fields support
- Terms & conditions section
- Notes/memo field
- PDF generation with consistent formatting
- Email template customization

#### Story 3: Recurring Invoices
**As a** business with subscription clients  
**I want to** automate recurring invoices  
**So that** monthly billing happens without manual work

**Acceptance Criteria:**
- Set recurrence pattern (weekly, monthly, quarterly, annual)
- Automatic invoice generation on schedule
- Email notifications before sending
- Ability to pause/resume recurring invoices
- Edit single instance or entire series
- End date configuration
- Proration for mid-cycle changes

### Epic: Customer Management

#### Story 4: Customer Database
**As a** user  
**I want to** maintain a customer database  
**So that** I can quickly create invoices and track customer history

**Acceptance Criteria:**
- Add/edit/archive customers
- Store multiple contacts per customer
- Billing and shipping addresses
- Customer-specific payment terms
- Tax exemption settings
- Custom fields for industry needs
- Import customers via CSV
- Customer portal access management

#### Story 5: Customer History
**As a** user  
**I want to** see complete customer history  
**So that** I understand the relationship and payment patterns

**Acceptance Criteria:**
- View all invoices per customer
- Payment history and patterns
- Outstanding balance display
- Average payment time
- Total revenue from customer
- Notes and communication log
- Credit memo tracking
- Export customer statement

### Epic: Payment Processing

#### Story 6: Multiple Payment Methods
**As a** business owner  
**I want to** accept various payment methods  
**So that** customers can pay using their preference

**Acceptance Criteria:**
- Accept credit/debit cards (via Stripe)
- ACH bank transfers
- Record check payments manually
- Record cash payments
- Partial payment support
- Payment fees handling
- Automatic receipt generation
- PCI compliance maintained

#### Story 7: Payment Tracking
**As a** user  
**I want** payments to be automatically tracked  
**So that** I know invoice status without manual updates

**Acceptance Criteria:**
- Real-time payment status updates
- Automatic bank reconciliation matching
- Partial payment tracking
- Overdue invoice alerts
- Payment received notifications
- Automatic late fee calculation (optional)
- Dispute/chargeback handling

#### Story 8: Payment Reminders
**As a** user  
**I want** automated payment reminders  
**So that** I get paid faster without awkward follow-ups

**Acceptance Criteria:**
- Configurable reminder schedule
- Customizable reminder templates
- Automatic sending based on due date
- Escalation path for overdue invoices
- Opt-out mechanism for customers
- Reminder history tracking
- Success metrics (open rate, payment rate)

### Epic: Reporting & Analytics

#### Story 9: Invoice Analytics
**As a** business owner  
**I want to** understand my invoicing metrics  
**So that** I can improve cash flow and operations

**Acceptance Criteria:**
- Dashboard with key metrics
- Average time to payment
- Collection rate
- Revenue by customer/period
- Aging report (30/60/90 days)
- Payment method breakdown
- Invoice status summary
- Export reports to CSV/PDF

## Technical Specifications

### System Architecture

```
┌──────────────────────────────────────────────┐
│            Frontend (Next.js)                 │
│                                               │
│  ┌─────────────────────────────────────┐     │
│  │      Invoice Builder Component       │     │
│  │  • Template selector                │     │
│  │  • Line item manager                │     │
│  │  • Real-time preview                │     │
│  │  • Customer selector                │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │    Invoice Management Dashboard      │     │
│  │  • Invoice list/grid view           │     │
│  │  • Status filters                   │     │
│  │  • Quick actions                    │     │
│  └──────────────┬──────────────────────┘     │
└─────────────────┼─────────────────────────────┘
                  ↓
         ┌────────────────┐
         │  Envoy Proxy   │
         └────────┬───────┘
                  ↓
┌──────────────────────────────────────────────┐
│         Backend Services (Rust)               │
│                                               │
│  ┌─────────────────────────────────────┐     │
│  │      Invoice Service                │     │
│  │  • create_invoice()                 │     │
│  │  • update_invoice()                 │     │
│  │  • send_invoice()                   │     │
│  │  • record_payment()                 │     │
│  │  • generate_pdf()                   │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │      Payment Processor              │     │
│  │  • Stripe integration               │     │
│  │  • Payment reconciliation           │     │
│  │  • Fee calculation                  │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │      Notification Service           │     │
│  │  • Email delivery (SendGrid)        │     │
│  │  • Reminder scheduling              │     │
│  │  • Template rendering               │     │
│  └──────────────┬──────────────────────┘     │
└─────────────────┼─────────────────────────────┘
                  ↓
    ┌──────────────────────────────┐
    │         PostgreSQL           │
    │  • invoices                  │
    │  • customers                 │
    │  • line_items                │
    │  • payments                  │
    │  • templates                 │
    └──────────────────────────────┘
```

### API Requirements

```protobuf
// invoice.proto
syntax = "proto3";

package invoice;

service InvoiceService {
  // Invoice CRUD
  rpc CreateInvoice(CreateInvoiceRequest) returns (Invoice);
  rpc GetInvoice(GetInvoiceRequest) returns (Invoice);
  rpc UpdateInvoice(UpdateInvoiceRequest) returns (Invoice);
  rpc DeleteInvoice(DeleteInvoiceRequest) returns (StatusResponse);
  rpc ListInvoices(ListInvoicesRequest) returns (InvoicesResponse);
  
  // Invoice Actions
  rpc SendInvoice(SendInvoiceRequest) returns (SendResponse);
  rpc GeneratePDF(GeneratePDFRequest) returns (PDFResponse);
  rpc DuplicateInvoice(DuplicateRequest) returns (Invoice);
  rpc ConvertToRecurring(ConvertRecurringRequest) returns (RecurringInvoice);
  
  // Payment Management
  rpc RecordPayment(RecordPaymentRequest) returns (Payment);
  rpc ProcessOnlinePayment(ProcessPaymentRequest) returns (PaymentResponse);
  rpc RefundPayment(RefundRequest) returns (RefundResponse);
  
  // Customer Management
  rpc CreateCustomer(CreateCustomerRequest) returns (Customer);
  rpc UpdateCustomer(UpdateCustomerRequest) returns (Customer);
  rpc GetCustomer(GetCustomerRequest) returns (Customer);
  rpc ListCustomers(ListCustomersRequest) returns (CustomersResponse);
  
  // Reminders
  rpc SetupReminders(RemindersRequest) returns (RemindersResponse);
  rpc SendReminder(SendReminderRequest) returns (StatusResponse);
}

message Invoice {
  string id = 1;
  string invoice_number = 2;
  string customer_id = 3;
  Customer customer = 4;
  string status = 5; // DRAFT, SENT, VIEWED, PAID, OVERDUE, CANCELLED
  string issue_date = 6;
  string due_date = 7;
  repeated LineItem line_items = 8;
  double subtotal = 9;
  double tax_amount = 10;
  double discount_amount = 11;
  double total = 12;
  double amount_paid = 13;
  double balance_due = 14;
  string currency = 15;
  string payment_terms = 16;
  string notes = 17;
  string terms_conditions = 18;
  map<string, string> custom_fields = 19;
  string template_id = 20;
  repeated Payment payments = 21;
  int64 created_at = 22;
  int64 updated_at = 23;
}

message LineItem {
  string id = 1;
  string description = 2;
  double quantity = 3;
  double rate = 4;
  double amount = 5;
  string tax_rate = 6;
  double tax_amount = 7;
  string category_id = 8;
  int32 sort_order = 9;
}

message Customer {
  string id = 1;
  string name = 2;
  string email = 3;
  string phone = 4;
  Address billing_address = 5;
  Address shipping_address = 6;
  string tax_id = 7;
  string payment_terms = 8;
  bool tax_exempt = 9;
  string currency = 10;
  string language = 11;
  map<string, string> custom_fields = 12;
  double total_revenue = 13;
  double outstanding_balance = 14;
  int32 invoice_count = 15;
  double average_payment_days = 16;
  int64 created_at = 17;
}

message Payment {
  string id = 1;
  string invoice_id = 2;
  double amount = 3;
  string payment_date = 4;
  string payment_method = 5; // CARD, ACH, CHECK, CASH, OTHER
  string reference_number = 6;
  string processor_id = 7; // Stripe charge ID
  double processing_fee = 8;
  string notes = 9;
  string status = 10; // PENDING, COMPLETED, FAILED, REFUNDED
  int64 created_at = 11;
}

message RecurringInvoice {
  string id = 1;
  Invoice template_invoice = 2;
  string frequency = 3; // WEEKLY, MONTHLY, QUARTERLY, ANNUALLY
  int32 interval = 4; // Every N periods
  string next_date = 5;
  string end_date = 6;
  bool auto_send = 7;
  int32 occurrences_count = 8;
  int32 max_occurrences = 9;
  bool is_active = 10;
}
```

### Database Schema

```sql
-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    tax_id VARCHAR(50),
    payment_terms VARCHAR(50) DEFAULT 'Net 30',
    tax_exempt BOOLEAN DEFAULT FALSE,
    currency CHAR(3) DEFAULT 'USD',
    language VARCHAR(10) DEFAULT 'en',
    billing_address JSONB,
    shipping_address JSONB,
    custom_fields JSONB,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    outstanding_balance DECIMAL(15,2) DEFAULT 0,
    invoice_count INT DEFAULT 0,
    average_payment_days DECIMAL(5,2),
    last_invoice_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice templates
CREATE TABLE invoice_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    layout JSONB, -- Template structure
    styles JSONB, -- CSS/styling
    logo_url TEXT,
    header_text TEXT,
    footer_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    template_id UUID REFERENCES invoice_templates(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SENT, VIEWED, PAID, PARTIAL, OVERDUE, CANCELLED
    issue_date DATE NOT NULL,
    due_date DATE,
    currency CHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) DEFAULT 0,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(100),
    notes TEXT,
    terms_conditions TEXT,
    custom_fields JSONB,
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    reminder_count INT DEFAULT 0,
    last_reminder_at TIMESTAMPTZ,
    pdf_url TEXT,
    public_url TEXT, -- For customer viewing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Line items
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,4) DEFAULT 1,
    rate DECIMAL(15,4),
    amount DECIMAL(15,2),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(20), -- CARD, ACH, CHECK, CASH, OTHER
    reference_number VARCHAR(100),
    processor_id VARCHAR(255), -- Stripe charge ID, etc.
    processing_fee DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'COMPLETED', -- PENDING, COMPLETED, FAILED, REFUNDED
    refunded_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring invoices
CREATE TABLE recurring_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    template_invoice_id UUID REFERENCES invoices(id),
    customer_id UUID REFERENCES customers(id),
    frequency VARCHAR(20), -- DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUALLY
    interval_count INT DEFAULT 1, -- Every N periods
    next_date DATE,
    end_date DATE,
    auto_send BOOLEAN DEFAULT TRUE,
    days_before_due INT DEFAULT 0,
    occurrences_count INT DEFAULT 0,
    max_occurrences INT,
    is_active BOOLEAN DEFAULT TRUE,
    last_generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment reminders
CREATE TABLE payment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20), -- BEFORE_DUE, ON_DUE, AFTER_DUE
    days_offset INT, -- Days before/after due date
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    resulted_in_payment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice activity log
CREATE TABLE invoice_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    activity_type VARCHAR(50), -- CREATED, SENT, VIEWED, PAID, REMINDER_SENT, etc.
    description TEXT,
    metadata JSONB,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customers_org ON customers(organization_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX idx_recurring_next_date ON recurring_invoices(next_date);
CREATE INDEX idx_activities_invoice ON invoice_activities(invoice_id);
```

## UI/UX Requirements

### Invoice Builder Interface

```
┌──────────────────────────────────────────────┐
│           Create Invoice                      │
│                                               │
│  Customer                                    │
│  ┌────────────────────────────────────────┐  │
│  │ 🔍 Search or add customer...           │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Invoice Details                             │
│  ┌────────────────┬───────────────────────┐  │
│  │ Invoice #:     │ INV-2024-001 (auto)  │  │
│  │ Issue Date:    │ Oct 29, 2024         │  │
│  │ Due Date:      │ Nov 28, 2024         │  │
│  │ Terms:         │ Net 30 ▼             │  │
│  └────────────────┴───────────────────────┘  │
│                                               │
│  Line Items                                  │
│  ┌────────────────────────────────────────┐  │
│  │ Description    Qty   Rate    Amount    │  │
│  │ ─────────────────────────────────────  │  │
│  │ Consulting     10    $150   $1,500.00 │  │
│  │ Travel Exp.    1     $250   $250.00   │  │
│  │                                        │  │
│  │ [+ Add line item]                      │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │                 Subtotal:   $1,750.00  │  │
│  │                 Tax (8%):   $140.00    │  │
│  │                 Total:      $1,890.00  │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Notes to Customer                           │
│  ┌────────────────────────────────────────┐  │
│  │ Thank you for your business!          │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  [Save Draft] [Preview] [Send Invoice →]     │
└──────────────────────────────────────────────┘
```

### Invoice Management Dashboard

```
┌──────────────────────────────────────────────┐
│              Invoices                         │
│                                               │
│  [+ New Invoice]  Filter: All ▼  Oct 2024 ▼  │
│                                               │
│  Summary                                      │
│  ┌────────────┬────────────┬──────────────┐  │
│  │ $12,450    │ $3,200     │ $8,900       │  │
│  │ Total      │ Outstanding│ Paid         │  │
│  └────────────┴────────────┴──────────────┘  │
│                                               │
│  Recent Invoices                             │
│  ┌────────────────────────────────────────┐  │
│  │ INV-2024-005  ABC Company  $2,100      │  │
│  │ Due Nov 5     Status: Sent  ⚡ Send     │  │
│  │                           reminder      │  │
│  ├────────────────────────────────────────┤  │
│  │ INV-2024-004  XYZ Corp     $1,500      │  │
│  │ Due Oct 30    Status: Overdue 3 days   │  │
│  │                                         │  │
│  ├────────────────────────────────────────┤  │
│  │ INV-2024-003  Tech Start   $3,200      │  │
│  │ Paid Oct 25   Status: ✅ Paid          │  │
│  │                                         │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  [View All Invoices →]                       │
└──────────────────────────────────────────────┘
```

### Customer Portal View

```
┌──────────────────────────────────────────────┐
│         Invoice from Your Business            │
│                                               │
│  [Your Logo]                                 │
│                                               │
│  Invoice #INV-2024-005                       │
│  Date: October 29, 2024                      │
│  Due: November 28, 2024                      │
│                                               │
│  Bill To:                                    │
│  ABC Company                                 │
│  123 Main Street                             │
│  San Francisco, CA 94105                     │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │ Description          Qty  Rate  Amount  │  │
│  │ ──────────────────────────────────────  │  │
│  │ Website Design       1   $2000  $2000  │  │
│  │ Logo Design          1   $500   $500   │  │
│  │ Hosting Setup        1   $100   $100   │  │
│  │                                         │  │
│  │                    Subtotal: $2,600.00  │  │
│  │                    Tax (8%):   $208.00  │  │
│  │                    Total:    $2,808.00  │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │        💳 Pay Now with Card             │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │        🏦 Pay with Bank Transfer        │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  [Download PDF] [Print]                      │
└──────────────────────────────────────────────┘
```

### Payment Recording

```
┌──────────────────────────────────────────────┐
│          Record Payment                       │
│                                               │
│  Invoice: INV-2024-005 - ABC Company         │
│  Total: $2,808.00                            │
│  Balance Due: $2,808.00                      │
│                                               │
│  Payment Amount                              │
│  ┌────────────────────────────────────────┐  │
│  │ $2,808.00                              │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Payment Date                                │
│  ┌────────────────────────────────────────┐  │
│  │ Oct 29, 2024                           │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Payment Method                              │
│  ○ Credit Card                               │
│  ○ Bank Transfer (ACH)                       │
│  ● Check                                     │
│  ○ Cash                                      │
│                                               │
│  Reference Number                            │
│  ┌────────────────────────────────────────┐  │
│  │ Check #1234                            │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Notes (Optional)                            │
│  ┌────────────────────────────────────────┐  │
│  │                                         │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  [Cancel] [Record Payment]                   │
└──────────────────────────────────────────────┘
```

## Success Metrics

### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invoice creation time | <2 min | Time from start to send |
| Payment collection time | -30% | Days to payment vs baseline |
| Online payment adoption | >60% | Payments via card/ACH |
| Invoice delivery rate | >98% | Successfully delivered emails |
| Customer portal usage | >70% | Customers who view online |
| Recurring invoice reliability | 99.9% | On-time generation rate |
| Payment reconciliation accuracy | 100% | Correctly matched payments |
| Support tickets | <3% | Invoice-related tickets/users |

### Business Impact Metrics
- Average days sales outstanding (DSO): Reduce by 25%
- Cash flow predictability: Improve by 40%
- Time spent on invoicing: Reduce by 75%
- Customer payment satisfaction: >4.5/5

## Dependencies & Risks

### External Dependencies

| Dependency | Purpose | Risk Level | Mitigation |
|------------|---------|------------|------------|
| Stripe API | Payment processing | Critical | Fallback payment providers |
| SendGrid | Email delivery | High | Multiple SMTP providers |
| PDF Generation | Invoice rendering | Medium | Multiple libraries, caching |
| PostgreSQL | Data storage | High | Replication, backups |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Payment processing failures | High | Low | Multiple payment providers |
| Email deliverability | Medium | Medium | SPF/DKIM setup, monitoring |
| Invoice number conflicts | Low | Low | UUID + sequential numbering |
| Tax calculation errors | High | Low | Simple tax only, disclaimers |

## Testing Requirements

### Unit Testing
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_invoice_total_calculation() {
        // Test subtotal, tax, and total calculations
    }
    
    #[test]
    fn test_payment_allocation() {
        // Test partial payment handling
    }
    
    #[test]
    fn test_recurring_schedule() {
        // Test next date calculation
    }
}
```

### Integration Testing
- Complete invoice creation flow
- Payment processing with Stripe
- Email delivery verification
- PDF generation quality
- Recurring invoice generation

### E2E Testing
```javascript
describe('Invoice Flow', () => {
  test('Create and send invoice', async () => {
    // 1. Create customer
    // 2. Create invoice
    // 3. Add line items
    // 4. Send invoice
    // 5. Verify email sent
    // 6. Access customer portal
    // 7. Process payment
    // 8. Verify reconciliation
  });
});
```

### Performance Testing
- Generate 1000 invoices in <60 seconds
- Handle 100 concurrent PDF generations
- Process 500 payments/minute
- Send 10,000 emails/hour

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: Database schema
- Day 3-4: Basic CRUD APIs
- Day 5: Invoice number generation

### Week 2: Core Features
- Day 1-2: Invoice builder UI
- Day 3: PDF generation
- Day 4-5: Customer management

### Week 3: Payments & Delivery
- Day 1-2: Stripe integration
- Day 3: Email delivery
- Day 4-5: Payment tracking

### Week 4: Polish & Testing
- Day 1: Recurring invoices
- Day 2: Reminders
- Day 3-5: Testing & refinement

### Milestones
- [ ] Database schema deployed
- [ ] Invoice CRUD functional
- [ ] PDF generation working
- [ ] Stripe integration complete
- [ ] Email delivery configured
- [ ] Customer portal live
- [ ] 10 test invoices paid

## Cost Analysis

### Monthly Costs (1000 users, 5000 invoices)
- Stripe fees: ~$300 (2.9% + $0.30 per transaction)
- SendGrid: $20 (transactional emails)
- PDF generation: ~$50 (compute)
- Storage: ~$20 (PDFs and attachments)
- Total: ~$390/month

### Per-User Costs
- Average: $0.39/user/month
- Break-even: Easily covered at all tiers

## Post-MVP Enhancements

### Phase 2 Features
1. Estimates and quotes
2. Credit notes and refunds
3. Multi-currency support
4. Purchase orders
5. Expense tracking from invoices

### Phase 3 Features
1. Advanced payment terms
2. Installment payments
3. Automated collections
4. Customer statements
5. Batch invoicing
6. Mobile app for invoicing
7. QR code payments
8. Cryptocurrency payments