# PRD: Dashboard & Basic Reporting

## Feature Overview

### Purpose
Provide business owners with real-time financial visibility through an intuitive dashboard and essential reports, enabling data-driven decisions and maintaining compliance-ready financial records.

### Objectives
1. Display financial health at-a-glance within 5 seconds of login
2. Generate tax-ready P&L statements in one click
3. Visualize cash flow trends and projections
4. Provide actionable insights without accounting expertise
5. Support export of all reports for CPA collaboration

## User Stories & Acceptance Criteria

### Epic: Financial Dashboard

#### Story 1: At-a-Glance Overview
**As a** business owner  
**I want to** see my financial status immediately upon login  
**So that** I can make informed decisions quickly

**Acceptance Criteria:**
- Dashboard loads in <2 seconds
- Shows current bank balances across all accounts
- Displays month-to-date income and expenses
- Shows pending invoices and bills
- Highlights urgent items (overdue invoices, low balance alerts)
- Mobile-responsive layout
- Customizable widget arrangement
- Real-time data (synced within last 4 hours)

#### Story 2: Cash Flow Visualization
**As a** business owner  
**I want to** understand my cash flow patterns  
**So that** I can anticipate and prevent cash shortages

**Acceptance Criteria:**
- 30/60/90-day cash flow chart
- Daily balance trend line
- Income vs expense comparison
- Recurring transaction indicators
- Interactive hover for details
- Projection based on historical patterns
- Alert thresholds for low balance
- Drill-down to transaction level

#### Story 3: Key Metrics Display
**As a** user  
**I want to** track important business metrics  
**So that** I can measure business performance

**Acceptance Criteria:**
- Revenue growth percentage (MoM, YoY)
- Gross margin calculation
- Burn rate for negative cash flow
- Average invoice payment time
- Top expense categories
- Customer concentration risk
- Expense ratio trends
- Customizable KPI selection

### Epic: Profit & Loss Reporting

#### Story 4: P&L Statement Generation
**As a** business owner  
**I want to** generate P&L statements  
**So that** I can understand profitability and prepare taxes

**Acceptance Criteria:**
- Generate for any date range
- Compare periods (vs last month, vs last year)
- Accrual and cash basis options
- Drill-down to transaction detail
- Export to PDF/Excel/CSV
- Schedule C tax category mapping
- Save custom report templates
- Email report scheduling

#### Story 5: Expense Analysis
**As a** user  
**I want to** analyze expense patterns  
**So that** I can identify cost-saving opportunities

**Acceptance Criteria:**
- Expense breakdown by category
- Trend analysis over time
- Vendor spend analysis
- Unusual expense detection
- Budget vs actual comparison
- Tax-deductible expense summary
- Expense ratios (% of revenue)
- Year-over-year comparisons

#### Story 6: Revenue Insights
**As a** business owner  
**I want to** understand revenue composition  
**So that** I can focus on profitable areas

**Acceptance Criteria:**
- Revenue by customer/client
- Revenue by service/product
- Recurring vs one-time revenue
- Payment method analysis
- Collection efficiency metrics
- Revenue recognition timing
- Seasonal patterns identification
- Growth rate calculations

### Epic: Tax Preparation

#### Story 7: Tax Summary Dashboard
**As a** business owner  
**I want to** track tax obligations  
**So that** I'm prepared for tax payments

**Acceptance Criteria:**
- Estimated quarterly tax calculation
- YTD tax deduction summary
- Schedule C preview
- State tax considerations
- Tax deadline reminders
- Document checklist for CPA
- Mileage and home office tracking
- Export for tax software

#### Story 8: Deduction Optimization
**As a** user  
**I want to** maximize legitimate tax deductions  
**So that** I can minimize tax liability legally

**Acceptance Criteria:**
- Identify potentially missed deductions
- Track business mileage
- Home office expense calculator
- Receipt attachment reminders
- Audit trail for deductions
- IRS category compliance check
- Red flag warnings
- CPA notes field

### Epic: Custom Reporting

#### Story 9: Report Builder
**As a** power user  
**I want to** create custom reports  
**So that** I can track business-specific metrics

**Acceptance Criteria:**
- Drag-and-drop report builder
- Multiple data source selection
- Custom calculation fields
- Conditional formatting
- Chart type selection
- Save and share reports
- Schedule email delivery
- Export in multiple formats

#### Story 10: Report Sharing
**As a** business owner  
**I want to** share reports with stakeholders  
**So that** they stay informed about business performance

**Acceptance Criteria:**
- Generate shareable links
- Set link expiration dates
- Password protection option
- Read-only access control
- Audit log of report views
- Email report snapshots
- Collaborative notes/comments
- White-label options

## Technical Specifications

### System Architecture

```
┌──────────────────────────────────────────────┐
│            Frontend (Next.js)                 │
│                                               │
│  ┌─────────────────────────────────────┐     │
│  │      Dashboard Components            │     │
│  │  • FinancialOverview                │     │
│  │  • CashFlowChart                    │     │
│  │  • MetricsGrid                      │     │
│  │  • AlertsPanel                      │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │      Reporting Components            │     │
│  │  • PLStatement                      │     │
│  │  • ExpenseAnalyzer                  │     │
│  │  • TaxSummary                       │     │
│  │  • ReportBuilder                    │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │      Visualization Libraries         │     │
│  │  • D3.js / Recharts                 │     │
│  │  • Chart.js                         │     │
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
│  │      Analytics Service               │     │
│  │  • calculate_metrics()               │     │
│  │  • generate_pl_statement()          │     │
│  │  • analyze_cash_flow()              │     │
│  │  • compute_tax_estimates()          │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │      Report Generator                │     │
│  │  • build_custom_report()            │     │
│  │  • export_to_format()               │     │
│  │  • schedule_reports()               │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │      Data Aggregation Layer          │     │
│  │  • TimeSeries processing            │     │
│  │  • Statistical calculations         │     │
│  │  • Caching layer (Redis)            │     │
│  └──────────────┬──────────────────────┘     │
└─────────────────┼─────────────────────────────┘
                  ↓
    ┌──────────────────────────────┐
    │      PostgreSQL               │
    │  • Materialized views          │
    │  • Aggregated metrics          │
    │  • Time-series data            │
    └──────────────────────────────┘
```

### API Requirements

```protobuf
// reporting.proto
syntax = "proto3";

package reporting;

service ReportingService {
  // Dashboard APIs
  rpc GetDashboardData(DashboardRequest) returns (DashboardResponse);
  rpc GetFinancialOverview(OverviewRequest) returns (OverviewResponse);
  rpc GetCashFlow(CashFlowRequest) returns (CashFlowResponse);
  rpc GetKeyMetrics(MetricsRequest) returns (MetricsResponse);
  
  // Report Generation
  rpc GeneratePLStatement(PLRequest) returns (PLStatement);
  rpc GenerateBalanceSheet(BalanceSheetRequest) returns (BalanceSheet);
  rpc GenerateCashFlowStatement(CashFlowStatementRequest) returns (CashFlowStatement);
  rpc GenerateTaxSummary(TaxSummaryRequest) returns (TaxSummary);
  
  // Analytics
  rpc GetExpenseAnalysis(ExpenseAnalysisRequest) returns (ExpenseAnalysis);
  rpc GetRevenueAnalysis(RevenueAnalysisRequest) returns (RevenueAnalysis);
  rpc GetTrendAnalysis(TrendRequest) returns (TrendAnalysis);
  rpc GetComparativeAnalysis(ComparativeRequest) returns (ComparativeAnalysis);
  
  // Custom Reports
  rpc CreateCustomReport(CreateReportRequest) returns (CustomReport);
  rpc ExecuteReport(ExecuteReportRequest) returns (ReportResult);
  rpc ScheduleReport(ScheduleReportRequest) returns (ScheduleResponse);
  rpc ExportReport(ExportRequest) returns (ExportResponse);
}

message DashboardRequest {
  string organization_id = 1;
  string date_range = 2; // TODAY, WEEK, MONTH, QUARTER, YEAR, CUSTOM
  string start_date = 3;
  string end_date = 4;
  repeated string widget_ids = 5; // Specific widgets to load
}

message DashboardResponse {
  FinancialSnapshot snapshot = 1;
  CashFlowSummary cash_flow = 2;
  repeated KeyMetric metrics = 3;
  repeated Alert alerts = 4;
  repeated Transaction recent_transactions = 5;
  int64 last_sync = 6;
}

message FinancialSnapshot {
  double total_cash = 1;
  double total_income = 2;
  double total_expenses = 3;
  double net_income = 4;
  double accounts_receivable = 5;
  double accounts_payable = 6;
  map<string, double> account_balances = 7;
}

message CashFlowSummary {
  repeated DailyBalance daily_balances = 1;
  double starting_balance = 2;
  double ending_balance = 3;
  double total_inflow = 4;
  double total_outflow = 5;
  double projected_balance_30d = 6;
  double projected_balance_60d = 7;
  double projected_balance_90d = 8;
  repeated CashFlowItem major_inflows = 9;
  repeated CashFlowItem major_outflows = 10;
}

message PLStatement {
  string period_start = 1;
  string period_end = 2;
  string basis = 3; // CASH or ACCRUAL
  
  Revenue revenue = 4;
  CostOfGoodsSold cogs = 5;
  double gross_profit = 6;
  double gross_margin_percent = 7;
  
  OperatingExpenses operating_expenses = 8;
  double operating_income = 9;
  
  OtherIncomeExpenses other = 10;
  double net_income = 11;
  double net_margin_percent = 12;
  
  map<string, LineItemDetail> line_items = 13;
  Comparison comparison = 14;
}

message Revenue {
  double total = 1;
  repeated RevenueItem items = 2;
}

message RevenueItem {
  string category = 1;
  double amount = 2;
  double percent_of_total = 3;
  int32 transaction_count = 4;
}

message OperatingExpenses {
  double total = 1;
  repeated ExpenseCategory categories = 2;
}

message ExpenseCategory {
  string name = 1;
  string tax_category = 2;
  double amount = 3;
  double percent_of_revenue = 4;
  repeated ExpenseItem items = 5;
}

message KeyMetric {
  string id = 1;
  string name = 2;
  string category = 3;
  double value = 4;
  string formatted_value = 5;
  string unit = 6; // CURRENCY, PERCENT, DAYS, COUNT
  double change = 7;
  string change_period = 8;
  string trend = 9; // UP, DOWN, STABLE
  string status = 10; // GOOD, WARNING, CRITICAL
}

message Alert {
  string id = 1;
  string type = 2; // LOW_BALANCE, OVERDUE_INVOICE, HIGH_EXPENSE, TAX_DEADLINE
  string severity = 3; // INFO, WARNING, CRITICAL
  string title = 4;
  string description = 5;
  string action_url = 6;
  int64 created_at = 7;
}
```

### Database Schema

```sql
-- Dashboard configurations
CREATE TABLE dashboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) DEFAULT 'Main Dashboard',
    is_default BOOLEAN DEFAULT FALSE,
    widget_layout JSONB, -- Widget positions and sizes
    widget_settings JSONB, -- Individual widget configurations
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved reports
CREATE TABLE saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50), -- PL, BALANCE_SHEET, CASH_FLOW, CUSTOM
    configuration JSONB, -- Report parameters and settings
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report schedules
CREATE TABLE report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES saved_reports(id) ON DELETE CASCADE,
    frequency VARCHAR(20), -- DAILY, WEEKLY, MONTHLY, QUARTERLY
    day_of_week INT, -- 0-6 for weekly
    day_of_month INT, -- 1-31 for monthly
    time_of_day TIME,
    timezone VARCHAR(50),
    recipients JSONB, -- Array of email addresses
    format VARCHAR(20), -- PDF, EXCEL, CSV
    is_active BOOLEAN DEFAULT TRUE,
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materialized views for performance
CREATE MATERIALIZED VIEW daily_balances AS
SELECT 
    organization_id,
    date_trunc('day', transaction_date) as balance_date,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as daily_income,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as daily_expenses,
    SUM(amount) as net_change,
    SUM(SUM(amount)) OVER (
        PARTITION BY organization_id 
        ORDER BY date_trunc('day', transaction_date)
    ) as running_balance
FROM transactions
WHERE status = 'COMPLETED'
GROUP BY organization_id, date_trunc('day', transaction_date);

CREATE INDEX idx_daily_balances_org_date ON daily_balances(organization_id, balance_date);

-- Monthly metrics materialized view
CREATE MATERIALIZED VIEW monthly_metrics AS
SELECT 
    organization_id,
    date_trunc('month', transaction_date) as month,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_expenses,
    SUM(amount) as net_income,
    COUNT(DISTINCT CASE WHEN amount > 0 THEN customer_id END) as unique_customers,
    COUNT(DISTINCT CASE WHEN amount < 0 THEN vendor_id END) as unique_vendors,
    AVG(CASE WHEN amount < 0 THEN ABS(amount) END) as avg_expense,
    AVG(CASE WHEN amount > 0 THEN amount END) as avg_income
FROM transactions t
LEFT JOIN invoices i ON t.invoice_id = i.id
WHERE t.status = 'COMPLETED'
GROUP BY organization_id, date_trunc('month', transaction_date);

CREATE INDEX idx_monthly_metrics_org_month ON monthly_metrics(organization_id, month);

-- Category metrics for expense analysis
CREATE MATERIALIZED VIEW category_metrics AS
SELECT 
    tc.organization_id,
    c.id as category_id,
    c.name as category_name,
    c.parent_id,
    date_trunc('month', t.transaction_date) as month,
    COUNT(*) as transaction_count,
    SUM(ABS(t.amount)) as total_amount,
    AVG(ABS(t.amount)) as avg_amount,
    MIN(ABS(t.amount)) as min_amount,
    MAX(ABS(t.amount)) as max_amount
FROM transaction_categories tc
JOIN transactions t ON tc.transaction_id = t.id
JOIN categories c ON tc.category_id = c.id
WHERE t.status = 'COMPLETED'
GROUP BY tc.organization_id, c.id, c.name, c.parent_id, date_trunc('month', t.transaction_date);

CREATE INDEX idx_category_metrics_org_cat_month ON category_metrics(organization_id, category_id, month);

-- Tax deduction tracking
CREATE TABLE tax_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    tax_year INT NOT NULL,
    deduction_type VARCHAR(100), -- BUSINESS_EXPENSE, MILEAGE, HOME_OFFICE, etc.
    amount DECIMAL(15,2),
    percentage DECIMAL(5,2), -- For partial deductions
    irs_category VARCHAR(100),
    schedule_c_line VARCHAR(10),
    documentation_status VARCHAR(20), -- COMPLETE, MISSING_RECEIPT, NEEDS_REVIEW
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for report access
CREATE TABLE report_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES saved_reports(id),
    accessed_by VARCHAR(255), -- User ID or email for shared reports
    access_type VARCHAR(20), -- VIEW, DOWNLOAD, SHARE
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI definitions
CREATE TABLE kpi_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    formula JSONB, -- Calculation definition
    unit VARCHAR(20), -- CURRENCY, PERCENT, DAYS, COUNT
    target_value DECIMAL(15,2),
    warning_threshold DECIMAL(15,2),
    critical_threshold DECIMAL(15,2),
    is_higher_better BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_dashboard_configs_org ON dashboard_configs(organization_id);
CREATE INDEX idx_saved_reports_org ON saved_reports(organization_id);
CREATE INDEX idx_report_schedules_next_run ON report_schedules(next_run) WHERE is_active = TRUE;
CREATE INDEX idx_tax_deductions_org_year ON tax_deductions(organization_id, tax_year);
CREATE INDEX idx_report_access_logs_report ON report_access_logs(report_id);
```

## UI/UX Requirements

### Main Dashboard

```
┌──────────────────────────────────────────────┐
│          Financial Dashboard                  │
│                         Last sync: 2 hours ago│
│                                               │
│  ┌──────────────────────────────────────────┐│
│  │  Cash Position               $45,234.56  ││
│  │  ┌────────────────────────────────────┐  ││
│  │  │ Checking      $32,456.78 ████████  │  ││
│  │  │ Savings       $10,000.00 ███       │  ││
│  │  │ Credit Card   -$2,777.78 █         │  ││
│  │  └────────────────────────────────────┘  ││
│  └──────────────────────────────────────────┘│
│                                               │
│  ┌─────────────┬─────────────┬──────────────┐│
│  │ October P&L │ Cash Flow   │ Key Metrics  ││
│  ├─────────────┼─────────────┼──────────────┤│
│  │Income       │ ┌─────────┐ │Revenue Growth││
│  │$12,450 ↑15% │ │  Chart  │ │   +23% MoM   ││
│  │             │ │ ███ ███ │ │              ││
│  │Expenses     │ │ ███ ███ │ │Gross Margin  ││
│  │$8,230 ↑8%  │ │ ███ ███ │ │    67.3%     ││
│  │             │ └─────────┘ │              ││
│  │Net Income   │30d: $45,234 │Burn Rate     ││
│  │$4,220 ↑28% │60d: $52,100 │   N/A        ││
│  └─────────────┴─────────────┴──────────────┘│
│                                               │
│  ┌──────────────────────────────────────────┐│
│  │ ⚠️ Alerts & Actions                      ││
│  │                                          ││
│  │ • 3 invoices overdue ($3,450)           ││
│  │   [Send Reminders]                      ││
│  │ • Q4 estimated tax due in 15 days       ││
│  │   [Calculate Payment]                   ││
│  │ • Low balance alert: Credit card        ││
│  │   [View Details]                        ││
│  └──────────────────────────────────────────┘│
│                                               │
│  [Customize Dashboard] [View Reports]         │
└──────────────────────────────────────────────┘
```

### P&L Statement

```
┌──────────────────────────────────────────────┐
│      Profit & Loss Statement                  │
│      October 1-31, 2024 (Cash Basis)         │
│                                               │
│  [📊 Compare] [📅 Change Period] [⬇️ Export] │
│                                               │
│  ┌──────────────────────────────────────────┐│
│  │ REVENUE                                  ││
│  │ Service Revenue          $10,500.00     ││
│  │ Product Sales            $1,950.00      ││
│  │ ─────────────────────────────────────   ││
│  │ Total Revenue           $12,450.00 100% ││
│  └──────────────────────────────────────────┘│
│                                               │
│  ┌──────────────────────────────────────────┐│
│  │ OPERATING EXPENSES                       ││
│  │                                          ││
│  │ Advertising              $1,234.56  9.9%││
│  │ Office Supplies            $234.89  1.9%││
│  │ Software & Tools           $899.00  7.2%││
│  │ Professional Services    $2,100.00 16.9%││
│  │ Rent                     $2,500.00 20.1%││
│  │ Utilities                  $187.55  1.5%││
│  │ Travel                     $456.00  3.7%││
│  │ Meals & Entertainment      $123.00  1.0%││
│  │ Insurance                  $495.00  4.0%││
│  │ ─────────────────────────────────────   ││
│  │ Total Expenses           $8,230.00 66.1%││
│  └──────────────────────────────────────────┘│
│                                               │
│  ┌──────────────────────────────────────────┐│
│  │ NET INCOME               $4,220.00 33.9%││
│  └──────────────────────────────────────────┘│
│                                               │
│  💡 Insights:                                 │
│  • Expenses are 8% higher than last month    │
│  • Professional services increased 45%       │
│  • Consider reviewing software subscriptions │
└──────────────────────────────────────────────┘
```

### Cash Flow Visualization

```
┌──────────────────────────────────────────────┐
│           Cash Flow Analysis                  │
│                                               │
│  Period: [Last 30 Days ▼] [Customize]        │
│                                               │
│  Current Balance: $45,234.56                 │
│  30-Day Projection: $52,100.00               │
│                                               │
│  ┌──────────────────────────────────────────┐│
│  │     $60k ┐                               ││
│  │          │    ╱─────── Projected         ││
│  │     $50k ├───╱────────────────           ││
│  │          │  ╱                            ││
│  │     $40k ├─╱──────── Actual              ││
│  │          │╱                              ││
│  │     $30k ┤                               ││
│  │          │                               ││
│  │     $20k ┤                               ││
│  │          └─┬───┬───┬───┬───┬───┬───┬    ││
│  │         Oct 1  8  15  22  29 Nov 5  12  ││
│  └──────────────────────────────────────────┘│
│                                               │
│  Major Inflows                   This Month  │
│  ┌──────────────────────────────────────────┐│
│  │ Client Payments             $10,500      ││
│  │ Product Sales               $1,950       ││
│  │ Tax Refund                  $500         ││
│  └──────────────────────────────────────────┘│
│                                               │
│  Major Outflows                  This Month  │
│  ┌──────────────────────────────────────────┐│
│  │ Rent                        $2,500       ││
│  │ Payroll                     $3,000       ││
│  │ Vendor Payments             $2,730       ││
│  └──────────────────────────────────────────┘│
│                                               │
│  Recurring Transactions          Next 30 Days│
│  ┌──────────────────────────────────────────┐│
│  │ Nov 1  Rent (Auto)          -$2,500      ││
│  │ Nov 5  Client Invoice       +$3,500      ││
│  │ Nov 15 Insurance            -$495        ││
│  └──────────────────────────────────────────┘│
└──────────────────────────────────────────────┘
```

### Tax Summary Dashboard

```
┌──────────────────────────────────────────────┐
│          Tax Summary - 2024                   │
│                                               │
│  Estimated Tax Liability                     │
│  ┌──────────────────────────────────────────┐│
│  │ YTD Income:              $98,450         ││
│  │ YTD Deductible Expenses: $65,230         ││
│  │ Net Taxable Income:      $33,220         ││
│  │                                          ││
│  │ Estimated Federal Tax:   $7,308          ││
│  │ Estimated State Tax:     $2,325          ││
│  │ Self-Employment Tax:     $4,692          ││
│  │ ──────────────────────────────────────  ││
│  │ Total Estimated Tax:     $14,325         ││
│  │                                          ││
│  │ Q1 Paid: $3,500 ✓  Q3 Paid: $3,500 ✓   ││
│  │ Q2 Paid: $3,500 ✓  Q4 Due:  $3,825      ││
│  └──────────────────────────────────────────┘│
│                                               │
│  Top Tax Deductions                          │
│  ┌──────────────────────────────────────────┐│
│  │ Home Office (25%)        $3,750          ││
│  │ Vehicle/Mileage          $2,340          ││
│  │ Professional Services    $8,900          ││
│  │ Software & Tools         $4,230          ││
│  │ Office Supplies          $1,890          ││
│  └──────────────────────────────────────────┘│
│                                               │
│  Tax Prep Checklist                          │
│  ┌──────────────────────────────────────────┐│
│  │ ✓ All transactions categorized           ││
│  │ ⚠️ 12 transactions missing receipts      ││
│  │ ✓ Mileage log updated                   ││
│  │ ○ Review home office deduction          ││
│  │ ○ Gather 1099 forms                     ││
│  └──────────────────────────────────────────┘│
│                                               │
│  [Download Tax Package] [Schedule CPA Call]  │
└──────────────────────────────────────────────┘
```

## Success Metrics

### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard load time | <2 sec | Page load to interactive |
| Report generation time | <5 sec | Request to display |
| Data freshness | <4 hours | Last sync to display |
| Report accuracy | 100% | Calculations match source |
| Export success rate | >99% | Successful exports/attempts |
| Mobile responsiveness | 100% | Features work on mobile |
| Custom report adoption | >40% | Users creating custom reports |
| Report sharing usage | >25% | Users sharing reports |

### User Engagement Metrics
- Daily active users: >60%
- Average session duration: >5 minutes
- Reports generated per user: >10/month
- Dashboard customization: >50% of users

## Dependencies & Risks

### Technical Dependencies

| Dependency | Purpose | Risk Level | Mitigation |
|------------|---------|------------|------------|
| PostgreSQL | Data storage | Critical | Materialized views, indexing |
| Redis | Caching | Medium | Graceful degradation |
| Chart libraries | Visualization | Low | Multiple library options |
| PDF generation | Report export | Medium | Multiple generators |

### Performance Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Slow queries | High | Medium | Materialized views, caching |
| Large data sets | High | Medium | Pagination, aggregation |
| Concurrent users | Medium | Low | Load balancing, optimization |
| Export timeouts | Low | Low | Background processing |

## Testing Requirements

### Unit Testing
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_pl_calculation() {
        // Test P&L calculations
    }
    
    #[test]
    fn test_cash_flow_projection() {
        // Test projection algorithms
    }
    
    #[test]
    fn test_tax_estimation() {
        // Test tax calculations
    }
}
```

### Integration Testing
- Dashboard data aggregation
- Report generation accuracy
- Export functionality
- Real-time updates
- Cache invalidation

### Performance Testing
- Load 100,000 transactions in <10 seconds
- Generate P&L for 1 year in <5 seconds
- Handle 100 concurrent dashboard loads
- Export 10,000 row report in <30 seconds

### E2E Testing
```javascript
describe('Dashboard Flow', () => {
  test('View dashboard and drill down', async () => {
    // 1. Load dashboard
    // 2. Verify metrics display
    // 3. Click on metric
    // 4. Verify drill-down data
    // 5. Generate report
    // 6. Export report
  });
});
```

## Implementation Timeline

### Week 1: Data Layer
- Day 1-2: Materialized views setup
- Day 3-4: Aggregation queries
- Day 5: Caching layer

### Week 2: Dashboard
- Day 1-2: Dashboard API
- Day 3-4: Frontend components
- Day 5: Real-time updates

### Week 3: Reporting
- Day 1-2: P&L generation
- Day 3: Cash flow analysis
- Day 4-5: Tax calculations

### Week 4: Polish
- Day 1-2: Export functionality
- Day 3: Custom reports
- Day 4-5: Testing & optimization

### Milestones
- [ ] Data aggregation layer complete
- [ ] Dashboard rendering <2 seconds
- [ ] P&L statement accurate
- [ ] Cash flow projections working
- [ ] Export to PDF/Excel functional
- [ ] 10 beta users validated accuracy

## Cost Analysis

### Infrastructure Costs (Monthly)
- Additional database resources: $100
- Redis cache: $50
- PDF generation compute: $30
- Total: ~$180/month

### Per-User Costs
- Average: $0.18/user/month
- Covered at all pricing tiers

## Post-MVP Enhancements

### Phase 2 Features
1. Advanced forecasting with ML
2. Budget vs actual tracking
3. Scenario planning
4. Automated insights with AI
5. Industry benchmarking

### Phase 3 Features
1. Real-time collaboration
2. Audit trail visualizations
3. Predictive cash flow alerts
4. Multi-entity consolidation
5. API for third-party integrations
6. White-label reporting
7. Advanced data visualizations
8. Natural language queries