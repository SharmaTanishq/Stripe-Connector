export interface PaymentIntentWebhookData {
    id:               string;
    object:           string;
    api_version:      string;
    created:          number;
    data:             Data;
    livemode:         boolean;
    pending_webhooks: number;
    request:          Request;
    type:             string;
}

export interface Data {
    object: Object;
}

export interface Object {
    id:                          string;
    object:                      string;
    amount:                      number;
    amount_capturable:           number;
    amount_received:             number;
    application:                 null;
    application_fee_amount:      null;
    canceled_at:                 null;
    cancellation_reason:         null;
    capture_method:              string;
    charges:                     Charges;
    client_secret:               string;
    confirmation_method:         string;
    created:                     number;
    currency:                    string;
    customer:                    null;
    description:                 null;
    invoice:                     null;
    last_payment_error:          null;
    livemode:                    boolean;
    metadata:                    Metadata;
    next_action:                 null;
    on_behalf_of:                null;
    payment_method:              string;
    payment_method_options:      PaymentMethodOptions;
    payment_method_types:        string[];
    receipt_email:               null;
    review:                      null;
    setup_future_usage:          null;
    shipping:                    null;
    source:                      null;
    statement_descriptor:        null;
    statement_descriptor_suffix: null;
    status:                      string;
    transfer_data:               null;
    transfer_group:              null;
}

export interface Datum {
    id:                              string;
    object:                          string;
    amount:                          number;
    amount_captured:                 number;
    amount_refunded:                 number;
    application:                     null;
    application_fee:                 null;
    application_fee_amount:          null;
    balance_transaction:             string;
    billing_details:                 BillingDetails;
    calculated_statement_descriptor: string;
    captured:                        boolean;
    created:                         number;
    currency:                        string;
    customer:                        null;
    description:                     null;
    destination:                     null;
    dispute:                         null;
    disputed:                        boolean;
    failure_code:                    null;
    failure_message:                 null;
    fraud_details:                   FraudDetails;
    invoice:                         null;
    livemode:                        boolean;
    metadata:                        Metadata;
    on_behalf_of:                    null;
    order:                           null;
    outcome:                         Outcome;
    paid:                            boolean;
    payment_intent:                  string;
    payment_method:                  string;
    payment_method_details:          PaymentMethodDetails;
    receipt_email:                   null;
    receipt_number:                  null;
    receipt_url:                     string;
    refunded:                        boolean;
    refunds:                         Charges;
    review:                          null;
    shipping:                        null;
    source:                          null;
    source_transfer:                 null;
    statement_descriptor:            null;
    statement_descriptor_suffix:     null;
    status:                          string;
    transfer_data:                   null;
    transfer_group:                  null;
}

export interface Charges {
    object:      string;
    data:        Datum[];
    has_more:    boolean;
    total_count: number;
    url:         string;
}

export interface BillingDetails {
    address: Address;
    email:   null;
    name:    null;
    phone:   null;
}

export interface Address {
    city:        null;
    country:     null;
    line1:       null;
    line2:       null;
    postal_code: null;
    state:       null;
}

export interface FraudDetails {
}

export interface Metadata {
    order_id:       string;
    transaction_id: string;
    payment_id:     string;
    account_name:   string;
}

export interface Outcome {
    network_status: string;
    reason:         null;
    risk_level:     string;
    risk_score:     number;
    seller_message: string;
    type:           string;
}

export interface PaymentMethodDetails {
    card: PaymentMethodDetailsCard;
    type: string;
}

export interface PaymentMethodDetailsCard {
    brand:          string;
    checks:         Checks;
    country:        string;
    exp_month:      number;
    exp_year:       number;
    fingerprint:    string;
    funding:        string;
    installments:   null;
    last4:          string;
    network:        string;
    three_d_secure: ThreeDSecure;
    wallet:         null;
}

export interface Checks {
    address_line1_check:       null;
    address_postal_code_check: null;
    cvc_check:                 string;
}

export interface ThreeDSecure {
    authentication_flow: string;
    result:              string;
    result_reason:       null;
    version:             string;
}

export interface PaymentMethodOptions {
    card: PaymentMethodOptionsCard;
}

export interface PaymentMethodOptionsCard {
    installments:           null;
    network:                null;
    request_three_d_secure: string;
}

export interface Request {
    id:              null;
    idempotency_key: string;
}
