# PRD: Transaction Categorization Engine

## Feature Overview

### Purpose
Provide an intelligent, automated transaction categorization system that accurately classifies financial transactions for tax compliance and financial reporting, while learning from user behavior to improve accuracy over time.

### Objectives
1. Achieve 85%+ auto-categorization accuracy on first use
2. Learn from user corrections to reach 95%+ accuracy within 30 days
3. Support IRS Schedule C tax categories out-of-the-box
4. Enable custom categories and rules for business-specific needs
5. Process transactions in real-time (<100ms per transaction)

## User Stories & Acceptance Criteria

### Epic: Automated Categorization

#### Story 1: Auto-Categorize Transactions
**As a** business owner  
**I want** transactions to be automatically categorized  
**So that** I don't spend hours manually classifying expenses

**Acceptance Criteria:**
- New transactions categorized within 2 seconds of import
- ML model suggests primary category with confidence score
- Categories map to IRS tax categories by default
- Visual confidence indicator (high/medium/low)
- Bulk categorization for similar transactions
- Category suggestions based on merchant name patterns
- Historical pattern recognition from user's past categorizations

#### Story 2: Smart Category Learning
**As a** user who corrects categories  
**I want** the system to learn from my corrections  
**So that** future similar transactions are correctly categorized

**Acceptance Criteria:**
- System learns after 3 consistent corrections
- Merchant-category mappings saved per user
- Learning applies to future transactions immediately
- Option to apply learning retroactively
- Confidence scores improve with corrections
- User-specific model training

#### Story 3: Rule-Based Categorization
**As a** power user  
**I want to** create custom categorization rules  
**So that** specific transactions always categorize correctly

**Acceptance Criteria:**
- Create rules based on: merchant, amount, description, account
- Support for complex conditions (AND/OR logic)
- Rule priority/ordering system
- Test rules before applying
- Bulk apply rules to historical transactions
- Import/export rules for backup
- Schedule-based rules (e.g., rent on 1st of month)

### Epic: Category Management

#### Story 4: Custom Categories
**As a** business with unique needs  
**I want to** create custom expense categories  
**So that** I can track business-specific metrics

**Acceptance Criteria:**
- Create unlimited custom categories
- Nest categories up to 3 levels deep
- Map custom categories to tax categories
- Set category budgets (optional)
- Color coding for visual distinction
- Category descriptions and notes
- Archive unused categories

#### Story 5: Split Transactions
**As a** user with mixed-use expenses  
**I want to** split transactions across categories  
**So that** I can accurately track partial business expenses

**Acceptance Criteria:**
- Split by percentage or fixed amounts
- Up to 5 splits per transaction
- Save split templates for recurring cases
- Automatic tax deduction calculations
- Visual split indicator on transaction
- Maintain split history for auditing

#### Story 6: Bulk Operations
**As a** user reviewing many transactions  
**I want to** categorize multiple transactions at once  
**So that** I can quickly clean up my books

**Acceptance Criteria:**
- Select multiple transactions (checkbox/shift-click)
- Apply category to all selected
- Filter transactions by: uncategorized, date, amount, merchant
- Keyboard shortcuts for common categories
- Undo bulk operations within session
- Progress indicator for large batches
- Review mode for quick categorization

### Epic: Tax Compliance

#### Story 7: Tax Category Mapping
**As a** user preparing taxes  
**I want** categories to map to tax forms  
**So that** tax preparation is streamlined

**Acceptance Criteria:**
- Pre-built IRS Schedule C mappings
- State-specific tax category support
- Deductibility indicators
- Mileage tracking category
- Home office expense allocation
- Tax report preview
- CPA-friendly export formats

#### Story 8: Receipt Matching
**As a** user needing documentation  
**I want to** attach receipts to transactions  
**So that** I have audit-ready records

**Acceptance Criteria:**
- Drag-and-drop receipt upload
- OCR for receipt data extraction
- Automatic receipt-transaction matching
- Multiple receipts per transaction
- Receipt storage and retrieval
- Missing receipt alerts for large transactions
- Mobile receipt capture via app

## Technical Specifications

### System Architecture

```
┌──────────────────────────────────────────────┐
│            Transaction Pipeline               │
│                                               │
│  ┌─────────────────────────────────────┐     │
│  │      New Transaction Ingested       │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │     Merchant Name Normalization     │     │
│  │   • Remove special characters       │     │
│  │   • Standardize known merchants     │     │
│  │   • Extract location data           │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │      Rule Engine Processing         │     │
│  │   • User-defined rules (priority 1) │     │
│  │   • Merchant mappings (priority 2)  │     │
│  │   • Amount-based rules (priority 3) │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │         ML Classification           │     │
│  │   • Feature extraction              │     │
│  │   • Model inference                 │     │
│  │   • Confidence scoring              │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │      Post-Processing                │     │
│  │   • Tax category mapping            │     │
│  │   • Deductibility calculation       │     │
│  │   • Notification generation         │     │
│  └─────────────────────────────────────┘     │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          ML Model Architecture                │
│                                               │
│  ┌─────────────────────────────────────┐     │
│  │        Feature Engineering          │     │
│  │   • Merchant name tokens            │     │
│  │   • Transaction amount               │     │
│  │   • Day of week/month               │     │
│  │   • Account type                    │     │
│  │   • Historical patterns             │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │      Global Model (Pre-trained)     │     │
│  │   • 10M+ transaction dataset        │     │
│  │   • Industry-specific models        │     │
│  │   • Transformer architecture        │     │
│  └──────────────┬──────────────────────┘     │
│                 ↓                             │
│  ┌─────────────────────────────────────┐     │
│  │    User-Specific Fine-tuning        │     │
│  │   • Learn from corrections          │     │
│  │   • Adapt to business patterns      │     │
│  │   • Incremental learning            │     │
│  └─────────────────────────────────────┘     │
└──────────────────────────────────────────────┘
```

### API Requirements

```protobuf
// categorization.proto
syntax = "proto3";

package categorization;

service CategorizationService {
  // Transaction categorization
  rpc CategorizeTransaction(CategorizeRequest) returns (CategorizeResponse);
  rpc BulkCategorize(BulkCategorizeRequest) returns (BulkCategorizeResponse);
  rpc RecategorizeTransaction(RecategorizeRequest) returns (CategorizeResponse);
  rpc SplitTransaction(SplitRequest) returns (SplitResponse);
  
  // Category management
  rpc GetCategories(GetCategoriesRequest) returns (CategoriesResponse);
  rpc CreateCategory(CreateCategoryRequest) returns (Category);
  rpc UpdateCategory(UpdateCategoryRequest) returns (Category);
  rpc DeleteCategory(DeleteCategoryRequest) returns (StatusResponse);
  
  // Rules engine
  rpc CreateRule(CreateRuleRequest) returns (Rule);
  rpc GetRules(GetRulesRequest) returns (RulesResponse);
  rpc UpdateRule(UpdateRuleRequest) returns (Rule);
  rpc DeleteRule(DeleteRuleRequest) returns (StatusResponse);
  rpc TestRule(TestRuleRequest) returns (TestRuleResponse);
  
  // Learning and training
  rpc TrainUserModel(TrainRequest) returns (TrainResponse);
  rpc GetCategorizationStats(StatsRequest) returns (StatsResponse);
}

message CategorizeRequest {
  string transaction_id = 1;
  Transaction transaction_data = 2;
  bool use_ml = 3;
  bool use_rules = 4;
}

message Transaction {
  string id = 1;
  string merchant_name = 2;
  string description = 3;
  double amount = 4;
  string date = 5;
  string account_id = 6;
  string account_type = 7;
  map<string, string> metadata = 8;
}

message CategorizeResponse {
  string transaction_id = 1;
  string category_id = 2;
  string category_name = 3;
  double confidence_score = 4;
  string confidence_level = 5; // HIGH, MEDIUM, LOW
  string method_used = 6; // RULE, ML, MANUAL, DEFAULT
  repeated CategorySuggestion alternatives = 7;
  TaxInfo tax_info = 8;
}

message CategorySuggestion {
  string category_id = 1;
  string category_name = 2;
  double confidence_score = 3;
  string reason = 4;
}

message TaxInfo {
  string schedule_c_line = 1;
  bool is_deductible = 2;
  double deductible_percentage = 3;
  string tax_category = 4;
  string irs_category_code = 5;
}

message Category {
  string id = 1;
  string name = 2;
  string description = 3;
  string parent_id = 4;
  string tax_category_id = 5;
  string color = 6;
  string icon = 7;
  bool is_active = 8;
  bool is_system = 9;
  int32 transaction_count = 10;
  map<string, string> metadata = 11;
}

message Rule {
  string id = 1;
  string name = 2;
  string description = 3;
  repeated Condition conditions = 4;
  string target_category_id = 5;
  int32 priority = 6;
  bool is_active = 7;
  string created_by = 8;
  int64 created_at = 9;
  int32 times_applied = 10;
}

message Condition {
  string field = 1; // merchant_name, amount, description, account_id
  string operator = 2; // equals, contains, greater_than, less_than, regex
  string value = 3;
  string logic_operator = 4; // AND, OR
}
```

### Database Schema

```sql
-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    level INT DEFAULT 0,
    full_path VARCHAR(500), -- e.g., "Operating Expenses > Office > Supplies"
    tax_category_id UUID REFERENCES tax_categories(id),
    color VARCHAR(7), -- Hex color
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    display_order INT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name, parent_id)
);

-- Tax categories (system-wide)
CREATE TABLE tax_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schedule_c_line VARCHAR(10),
    form_1040_line VARCHAR(10),
    is_deductible BOOLEAN DEFAULT TRUE,
    deduction_limit DECIMAL(15,2),
    irs_code VARCHAR(50),
    tax_year INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction categories (assignment)
CREATE TABLE transaction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    confidence_level VARCHAR(20), -- HIGH, MEDIUM, LOW
    method VARCHAR(50), -- RULE, ML, MANUAL, DEFAULT
    assigned_by VARCHAR(50), -- user_id or 'system'
    is_split BOOLEAN DEFAULT FALSE,
    split_percentage DECIMAL(5,2), -- For split transactions
    split_amount DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorization rules
CREATE TABLE categorization_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    conditions JSONB NOT NULL, -- Stored as JSON for flexibility
    priority INT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    times_applied INT DEFAULT 0,
    last_applied TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merchant mappings (learning from user)
CREATE TABLE merchant_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    merchant_name VARCHAR(255) NOT NULL,
    merchant_normalized VARCHAR(255), -- Cleaned version
    category_id UUID REFERENCES categories(id),
    confidence_score DECIMAL(3,2) DEFAULT 1.00,
    times_used INT DEFAULT 1,
    last_used TIMESTAMPTZ,
    created_by VARCHAR(50), -- 'user' or 'ml_model'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, merchant_normalized)
);

-- ML model metadata
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    model_type VARCHAR(50), -- 'global' or 'user_specific'
    version VARCHAR(20),
    accuracy_score DECIMAL(3,2),
    training_samples INT,
    feature_importance JSONB,
    model_path TEXT, -- S3 or file path
    is_active BOOLEAN DEFAULT TRUE,
    trained_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorization history (for learning)
CREATE TABLE categorization_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    original_category_id UUID REFERENCES categories(id),
    new_category_id UUID REFERENCES categories(id),
    changed_by UUID REFERENCES users(id),
    change_reason VARCHAR(255),
    ml_feedback_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipt attachments
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INT,
    mime_type VARCHAR(100),
    ocr_data JSONB,
    extracted_amount DECIMAL(15,2),
    extracted_merchant VARCHAR(255),
    extracted_date DATE,
    match_confidence DECIMAL(3,2),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_categories_org ON categories(organization_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_transaction_categories_txn ON transaction_categories(transaction_id);
CREATE INDEX idx_transaction_categories_cat ON transaction_categories(category_id);
CREATE INDEX idx_rules_org_priority ON categorization_rules(organization_id, priority);
CREATE INDEX idx_merchant_mappings_org_merchant ON merchant_mappings(organization_id, merchant_normalized);
CREATE INDEX idx_categorization_history_txn ON categorization_history(transaction_id);
CREATE INDEX idx_receipts_transaction ON receipts(transaction_id);
```

### ML Model Specifications

```python
# Feature engineering pipeline
FEATURES = {
    'merchant_features': [
        'merchant_name_tokens',  # Tokenized merchant name
        'merchant_category_code',  # MCC code if available
        'is_online_merchant',
        'merchant_frequency'  # How often this merchant appears
    ],
    'transaction_features': [
        'amount',
        'amount_bucket',  # Small, medium, large
        'is_debit',
        'is_credit',
        'day_of_week',
        'day_of_month',
        'is_weekend',
        'is_recurring'  # Detected recurring pattern
    ],
    'contextual_features': [
        'account_type',
        'previous_category',  # Category of previous transaction
        'similar_transactions_category',  # Most common category for similar amounts
        'time_since_last_similar'
    ]
}

# Model architecture
MODEL_CONFIG = {
    'architecture': 'transformer',
    'embedding_dim': 128,
    'num_heads': 8,
    'num_layers': 4,
    'dropout': 0.1,
    'learning_rate': 0.001,
    'batch_size': 32,
    'num_categories': 150  # IRS categories + common custom
}

# Training parameters
TRAINING_CONFIG = {
    'min_samples_for_training': 100,
    'retrain_frequency': 'weekly',
    'confidence_threshold': 0.7,
    'feedback_weight': 2.0  # User corrections weighted higher
}
```

## UI/UX Requirements

### Transaction List with Categories

```
┌──────────────────────────────────────────────┐
│         Transactions                          │
│                                               │
│  Filter: All ▼  Date: Oct 2024 ▼  Search: 🔍 │
│                                               │
│  □ Select All   [Categorize Selected]        │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │ □ Oct 28  Starbucks           -$5.43  │  │
│  │   💼 Meals & Entertainment  (95% sure) │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │ □ Oct 28  Amazon Web Services -$127.53│  │
│  │   💻 Software & Subscriptions (99%)    │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │ □ Oct 27  Uber                -$23.10 │  │
│  │   🚗 Travel & Transportation  (88%)    │  │
│  │   [Change ▼]                           │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │ □ Oct 27  Office Depot        -$67.89 │  │
│  │   ❓ Uncategorized                     │  │
│  │   Suggestions: Office Supplies (72%)   │  │
│  │                Equipment (18%)         │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Quick Categorization Mode

```
┌──────────────────────────────────────────────┐
│       Quick Categorization                    │
│                                               │
│  23 uncategorized transactions               │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │         Office Depot - $67.89          │  │
│  │         October 27, 2024                │  │
│  │                                         │  │
│  │  Suggested Categories:                 │  │
│  │                                         │  │
│  │  [1] Office Supplies        72% 📊     │  │
│  │  [2] Equipment              18% 📊     │  │
│  │  [3] Inventory               8% 📊     │  │
│  │                                         │  │
│  │  Or choose:                            │  │
│  │  [4] Advertising                       │  │
│  │  [5] Travel                            │  │
│  │  [6] Other...                          │  │
│  │                                         │  │
│  │  Press 1-6 or use arrow keys          │  │
│  │                                         │  │
│  │  [Space: Skip] [Enter: Confirm]       │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Progress: ████████░░░░░░░░ 8/23             │
└──────────────────────────────────────────────┘
```

### Rule Builder Interface

```
┌──────────────────────────────────────────────┐
│         Create Categorization Rule            │
│                                               │
│  Rule Name:                                  │
│  ┌────────────────────────────────────────┐  │
│  │ Monthly rent payment                   │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  When transaction matches:                   │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │ Merchant name [contains ▼] [Landlord] │  │
│  │     AND                                │  │
│  │ Amount [equals ▼] [$2,500]            │  │
│  │     AND                                │  │
│  │ Date [is between ▼] [1st-5th of month]│  │
│  │                                        │  │
│  │ [+ Add condition]                      │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Then categorize as:                         │
│  ┌────────────────────────────────────────┐  │
│  │ [Rent or Lease ▼]                     │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  □ Apply to existing transactions            │
│                                               │
│  [Test Rule] [Cancel] [Save Rule]           │
└──────────────────────────────────────────────┘
```

### Category Management

```
┌──────────────────────────────────────────────┐
│           Manage Categories                   │
│                                               │
│  [+ New Category] [Import] [Export]          │
│                                               │
│  📁 Income                          3 accounts│
│    └─ 💼 Service Revenue                     │
│    └─ 📦 Product Sales                       │
│    └─ 💰 Other Income                        │
│                                               │
│  📁 Operating Expenses            25 accounts│
│    ├─ 📁 Office                              │
│    │   ├─ 📎 Supplies              $342     │
│    │   ├─ 🪑 Furniture             $0       │
│    │   └─ 🏢 Rent                  $2,500   │
│    ├─ 📁 Marketing                           │
│    │   ├─ 📱 Digital Ads           $450     │
│    │   ├─ 📧 Email Marketing       $99      │
│    │   └─ 🎨 Design                $200     │
│    ├─ 📁 Travel                              │
│    │   ├─ ✈️ Flights               $0       │
│    │   ├─ 🏨 Hotels                $0       │
│    │   └─ 🚗 Ground Transport      $127     │
│    └─ 💻 Software & Tools          $547     │
│                                               │
│  📁 Cost of Goods Sold             2 accounts│
│    └─ 📦 Inventory Purchases                 │
│    └─ 🚚 Shipping & Freight                  │
│                                               │
│  [Edit] [Delete] [View Transactions]         │
└──────────────────────────────────────────────┘
```

## Success Metrics

### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Auto-categorization accuracy | >85% | Correctly categorized/total |
| Learning improvement rate | +10% monthly | Accuracy increase over time |
| Categorization speed | <100ms | Per transaction processing time |
| User correction rate | <15% | Manual corrections/total |
| Rule effectiveness | >95% | Successful rule applications |
| Tax category coverage | 100% | Transactions with tax mapping |
| Time saved per user | >3 hours/month | Before/after comparison |

### User Satisfaction Metrics
- Categorization satisfaction: >4.2/5
- Feature adoption rate: >80% use rules
- Support tickets: <3% for categorization
- Time to categorize 100 transactions: <5 minutes

## Dependencies & Risks

### Technical Dependencies

| Dependency | Purpose | Risk Level | Mitigation |
|------------|---------|------------|------------|
| ML Model Service | Classification | High | Fallback to rules, caching |
| PostgreSQL | Data storage | High | Read replicas, indexing |
| Redis | Model caching | Medium | Graceful degradation |
| AWS S3 | Receipt storage | Medium | Multi-region replication |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Poor initial accuracy | High | Medium | Pre-trained industry models |
| Tax categorization errors | Critical | Low | CPA review, disclaimers |
| Model training costs | Medium | Medium | Efficient architecture, caching |
| User adoption | High | Low | Onboarding tutorial, quick wins |

## Testing Requirements

### Unit Testing
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_merchant_normalization() {
        assert_eq!(normalize("AMZN*MKTP US"), "Amazon Marketplace");
        assert_eq!(normalize("SQ *COFFEE SHOP"), "Square Coffee Shop");
    }
    
    #[test]
    fn test_rule_matching() {
        // Test rule condition evaluation
    }
    
    #[test]
    fn test_confidence_scoring() {
        // Test confidence calculation
    }
}
```

### Integration Testing
- End-to-end categorization flow
- Rule engine with complex conditions
- ML model inference pipeline
- Bulk categorization performance
- Learning feedback loop

### ML Model Testing
```python
# Model evaluation metrics
def evaluate_model(model, test_data):
    metrics = {
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision_score(y_true, y_pred, average='weighted'),
        'recall': recall_score(y_true, y_pred, average='weighted'),
        'f1': f1_score(y_true, y_pred, average='weighted'),
        'top_3_accuracy': top_k_accuracy(y_true, y_proba, k=3)
    }
    return metrics

# A/B testing framework
def ab_test_categorization():
    # Compare old vs new model performance
    # Track user satisfaction metrics
    # Monitor correction rates
```

### Performance Testing
- Categorize 10,000 transactions in <10 seconds
- Handle 100 concurrent categorization requests
- Model inference <50ms per transaction
- Rule evaluation <10ms per transaction

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: Database schema for categories
- Day 3-4: Basic categorization API
- Day 5: Default category setup

### Week 2: ML Integration
- Day 1-2: Feature engineering pipeline
- Day 3-4: Model training infrastructure
- Day 5: Model serving API

### Week 3: Rules & Learning
- Day 1-2: Rule engine implementation
- Day 3: Merchant mapping system
- Day 4-5: Learning feedback loop

### Week 4: UI & Polish
- Day 1-2: Categorization UI
- Day 3: Bulk operations
- Day 4-5: Testing and optimization

### Milestones
- [ ] Category database structure complete
- [ ] ML model trained and deployed
- [ ] Rule engine functional
- [ ] UI for categorization complete
- [ ] 85% accuracy achieved in testing
- [ ] Performance benchmarks met

## Cost Analysis

### Infrastructure Costs (Monthly)
- ML Model Training: $200 (GPU instances)
- Model Inference: $150 (CPU instances)
- Storage (receipts): $100 (S3)
- Database: Included in main infrastructure
- Total: ~$450/month

### Per-User Costs
- Average: $0.45/user/month
- Break-even: Covered at all pricing tiers

## Post-MVP Enhancements

### Phase 2 Features
1. Advanced ML with GPT-4 integration
2. Industry-specific category templates
3. Multi-language support
4. Automated receipt matching
5. Vendor management system

### Phase 3 Features
1. Predictive categorization
2. Anomaly detection
3. Spend analytics and insights
4. Category-based budgeting
5. Real-time category suggestions
6. Cross-business intelligence