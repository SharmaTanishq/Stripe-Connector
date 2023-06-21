import { json } from "co-body"
import stripeClient from '../clients/stripe'
import VtexCallbackUrlClient from '../clients/vtexCallbackUrl'
import { VtexCallbackExecuteStatus } from "../clients/vtexCallbackUrl/types"

export async function notifications(ctx: any, next: () => Promise<any>) {

    const { callbackUrl, intentId, clientSecret, paymentId, appKey } = (await json(ctx.req)) as any

    const appSecret = appKey;

    const { userAgent } = ctx.vtex

    const version = userAgent.split("@")[1]

    const paymentIntent = await stripeClient.retrievePaymentIntent(intentId, appSecret, false, version, clientSecret)

    const status = paymentIntent.status === 'succeeded' ? VtexCallbackExecuteStatus.approved : VtexCallbackExecuteStatus.denied

    console.log(paymentId)
        
    const vtexCallback = new VtexCallbackUrlClient(ctx.clients.ctx)

    const response = await vtexCallback.execute(callbackUrl, {
        paymentId,
        authorizationId: intentId,
        tid: `${intentId}#card`,
        nsu: `${intentId}#card`,
        code: "200",
        message: `${status} by wallet`,
        status: status,
        delayToAutoSettle: 10
    })

    console.log({response})

    ctx.body = { status: true }
    ctx.status = 200

    await next()

}