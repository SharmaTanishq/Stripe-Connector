import { Maybe } from '@vtex/payment-provider';
import stripeClient from '../../libs/stripe'
import { Installments, IStripeSDK, PaymentMethods, StripeDefaultConfigs, StripePaymentIntentConfigs, StripePaymentMethodData } from './types'

//@ts-ignore

const stripeSDK: IStripeSDK = {
    createPaymentIntent: async (defaultConfigs: StripeDefaultConfigs, intentConfigs: StripePaymentIntentConfigs, paymentMethodTypes: PaymentMethods[], confirm: boolean, paymentMethodData?: StripePaymentMethodData, hasInstallments: boolean = false) => {

        const { stripeApiSecret, hasBoletoBeta, appVersion } = defaultConfigs;

        const stripe = stripeClient(stripeApiSecret,hasBoletoBeta, appVersion)

        const { accountName, amount, currency, orderId, paymentId, transactionId } = intentConfigs

        const data : any = {
            amount,
            currency,
            confirm,
            metadata: {
              order_id: orderId,
              transaction_id: transactionId,
              payment_id: paymentId,
              account_name: accountName,
            },
            payment_method_types: paymentMethodTypes,
          }

        if(paymentMethodData){
            data.payment_method_data = paymentMethodData
        }

        if(hasInstallments){
            data.payment_method_options = {
                card: {
                  installments: {
                    enabled: true
                  }
                }
            }
        }

        const intent = await stripe.paymentIntents.create(data)
      
        return intent
    },
    retrievePaymentIntent: async (paymentIntentId: string, stripeApiKey: string, hasBoletoBeta: boolean = false, version: string, clientSecret?: string) => {
        const stripe = stripeClient(stripeApiKey, hasBoletoBeta, version)

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
            client_secret: clientSecret
        });

        return paymentIntent;
    },
    updatePaymentIntent: async (defaultConfigs: StripeDefaultConfigs, paymentIntentId: string, paymentMethodId: string) => {

        const { stripeApiSecret, hasBoletoBeta, appVersion } = defaultConfigs;

        const stripe = stripeClient(stripeApiSecret,hasBoletoBeta, appVersion)

        const intent = await stripe.paymentIntents.update(paymentIntentId, {
            payment_method: paymentMethodId
        })

        return intent;
        
    },
    confirmPaymentIntent: async (defaultConfigs: StripeDefaultConfigs, paymentIntentId: string, installmentsInfos: Installments, returnUrl: Maybe<string>) => {

        const { stripeApiSecret, hasBoletoBeta, appVersion } = defaultConfigs;

        const stripe = stripeClient(stripeApiSecret,hasBoletoBeta, appVersion)

        let confirmData: any = {
            return_url: returnUrl,
        }

        if(installmentsInfos.installments && installmentsInfos.installments > 1){
            confirmData.payment_method_options = {
                card: {
                    installments: {
                        plan: {
                            count: installmentsInfos.installments,
                            interval: "month",
                            type: "fixed_count"
                        },
                    },
                },
            }
        }

        console.log({confirmData})

        const intent = await stripe.paymentIntents.confirm(paymentIntentId, confirmData)

        return intent;
        
    },
    refundPaymentIntent: async (defaultConfigs: StripeDefaultConfigs, paymentIntentId: string, value: number) => {

        const { stripeApiSecret, hasBoletoBeta, appVersion } = defaultConfigs;

        const stripe = stripeClient(stripeApiSecret,hasBoletoBeta, appVersion)

        const valueToRefundInCents = value * 100

        const paymentRefundend = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: valueToRefundInCents
        })

        return paymentRefundend;

    }
}

export default stripeSDK;