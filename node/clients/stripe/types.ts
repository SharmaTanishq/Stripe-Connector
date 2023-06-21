import { Maybe } from "@vtex/payment-provider"

export interface IStripeSDK {
    createPaymentIntent(defaultConfigs: StripeDefaultConfigs, intentConfigs: StripePaymentIntentConfigs, paymentMethodTypes: PaymentMethods[], confirm: boolean, paymentMethodData?: StripePaymentMethodData, hasInstallments?: boolean) : any
    retrievePaymentIntent(paymentIntentId: string, stripeApiKey: string, hasBoletoBeta: boolean, version: string, clientSecret?: string): any
    updatePaymentIntent(defaultConfigs: StripeDefaultConfigs, paymentIntentId: string, paymentMethodId: string): any
    confirmPaymentIntent(defaultConfigs: StripeDefaultConfigs, paymentIntentId: string, installmentsInfo: Installments, returnUrl: Maybe<string>): any
    refundPaymentIntent(defaultConfigs: StripeDefaultConfigs, paymentIntentId: string, value: number): any
}

export type Installments = { 
  installments: Maybe<number>
  installmentsInterestRate: number
  installmentsValue: number
}

export type StripePaymentMethodData = {
    type: any
    billing_details: StripeBillingDetails
    boleto: {
      tax_id: string
    }
}

export type StripeBillingDetails = {
  name: string
  email: string
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    country: string
    postal_code: string
  }
}

export type StripeDefaultConfigs = {
    stripeApiSecret: string
    hasBoletoBeta: boolean
    appVersion: string
}

export type StripePaymentIntentConfigs = {
    amount: number
    currency: string
    orderId: string
    transactionId: string
    paymentId: string
    accountName: string
}

export enum PaymentMethods {
    boleto = 'boleto',
    oxxo = 'oxxo',
    card = 'card'
}

export enum StripeStatus {
  requires_payment_method = "requires_payment_method", 
  requires_confirmation = "requires_confirmation", 
  requires_action = "requires_action", 
  processing = "processing", 
  requires_capture = "requires_capture", 
  canceled = "canceled", 
  succeeded = "succeeded"
}