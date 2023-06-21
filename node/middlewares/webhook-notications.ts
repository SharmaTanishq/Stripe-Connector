import { json } from "co-body"
import { PaymentIntentWebhookData } from "./types"
import stripeClient from '../clients/stripe'
import VtexCallbackUrlClient from '../clients/vtexCallbackUrl'
import { VtexCallbackExecuteStatus } from "../clients/vtexCallbackUrl/types"

export async function webhookNotifications(ctx: any, next: () => Promise<any>) {

    const { data : {
        object: {
            id : paymentIntentId,
            client_secret,
            metadata: {
                transaction_id,
                payment_id
            }
        }
    }, type } = (await json(ctx.req)) as PaymentIntentWebhookData

    if (type === 'payment_intent.succeeded') {
        
        const { vtex : { userAgent, account }, clients: { vbase }  } = ctx
    
        const version = userAgent.split("@")[1]
    
        const existingCancellation = await vbase.getJSON(
          'stripecc',
          'stripecc',
          true
        )
    
        console.log({existingCancellation})
    
        const paymentIntent = await stripeClient.retrievePaymentIntent(paymentIntentId, existingCancellation.appKey, false, version, client_secret)
    
        console.log({paymentIntent})
    
        const status = paymentIntent.status === 'succeeded' ? VtexCallbackExecuteStatus.approved : VtexCallbackExecuteStatus.denied
    
        const vtexCallback = new VtexCallbackUrlClient(ctx.clients.ctx)
    
        const callbackUrl = `http://${account}.vtexpayments.com.br/api/pvt/payment-provider/transactions/${transaction_id}/payments/${payment_id}/callback?accountName=${account}`
    
        const response = await vtexCallback.execute(callbackUrl, {
            paymentId: payment_id,
            authorizationId: paymentIntentId,
            tid: `${paymentIntentId}#card`,
            nsu: `${paymentIntentId}#card`,
            code: "200",
            message: `${status} by webhook`,
            status: status,
            delayToAutoSettle: 10
        })
    
        console.log({response})
    }
    if (type === 'payment_intent.payment_failed') {
        
        const { vtex : { userAgent, account }, clients: { vbase }  } = ctx
    
        const version = userAgent.split("@")[1]
    
        const existingCancellation = await vbase.getJSON(
          'stripecc',
          'stripecc',
          true
        )
    
        console.log({existingCancellation})
    
        const paymentIntent = await stripeClient.retrievePaymentIntent(paymentIntentId, existingCancellation.appKey, false, version, client_secret)
    
        console.log({paymentIntent})
    
        const status = paymentIntent.status === 'requires_payment_method' ? VtexCallbackExecuteStatus.denied : VtexCallbackExecuteStatus.denied
    
        const vtexCallback = new VtexCallbackUrlClient(ctx.clients.ctx)
    
        const callbackUrl = `http://${account}.vtexpayments.com.br/api/pvt/payment-provider/transactions/${transaction_id}/payments/${payment_id}/callback?accountName=${account}`
    
        const response = await vtexCallback.execute(callbackUrl, {
            paymentId: payment_id,
            authorizationId: paymentIntentId,
            tid: `${paymentIntentId}#card`,
            nsu: `${paymentIntentId}#card`,
            code: "400",
            message: `${status} the payment has been failed please try again`,
            status: status,
            delayToAutoSettle: 10
        })
    
        console.log({response})
    }


    ctx.body = { status: true }
    ctx.status = 200

    await next()

}