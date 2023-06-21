import {
  AuthorizationRequest,
  AuthorizationResponse,
  Authorizations,
  BankInvoice,
  BankInvoiceAuthorization,
  CancellationRequest,
  CancellationResponse,
  Cancellations,
  CardAuthorization,
  PaymentMethod,
  PaymentProvider,
  RefundRequest,
  RefundResponse,
  Refunds,
  SettlementRequest,
  SettlementResponse,
  Settlements,
} from '@vtex/payment-provider'
import { randomString } from './utils'
import { executeAuthorization } from './flow'

import stripeClient from './clients/stripe'
import convertInCents from './helpers/convertInCents'
import { PaymentMethods, StripeStatus } from './clients/stripe/types'
import addressFormatter from './helpers/addressFormatter'

import StripePCI from './clients/stripePCI'
import { AVAILABLE_CARDS } from './consts'


//import { VtexOrder } from './clients/vtexOrder'
import { Clients } from './clients'


  export default class StripeConnector extends PaymentProvider<Clients> {
  
  public async authorize(
    authorization: AuthorizationRequest & {
      installmentsInterestRate: number
      installmentsValue: number
      paymentMethod: PaymentMethod & {
        OXXO?: string
      }
    }
  ): Promise<AuthorizationResponse> {

    if (this.isTestSuite) {
      return executeAuthorization(authorization, response =>
        this.callback(authorization, response)
      )
    }

    const {
      clients: { vbase, },
      vtex: { logger, account, userAgent },
      headers
    } = this.context

    const appKey = headers['x-provider-api-appkey'];
    const appSecret = headers['x-provider-api-apptoken'];

    await vbase.saveJSON(
      'stripecc',
      "stripecc",
      {
        appKey: String(appKey),
      }
    )
    
    console.log({ authorization: `authorization receveid: ${JSON.stringify(authorization)}`})
    logger.info({ authorization: `authorization receveid: ${JSON.stringify(authorization)}`})

    const version = userAgent.split("@")[1]

    const { value, currency, orderId, paymentId, transactionId, miniCart } = authorization;

    const { shippingAddress, buyer: {
      firstName, lastName, email, document
    } } = miniCart

    const addressFormatted = addressFormatter(shippingAddress)

    console.log({addressFormatted})

    //@ts-ignore
    const clientCtx = this.context.clients.ctx

    const { errorMessage, tid } = await this.orderValidate(authorization)

    if((errorMessage && errorMessage !== "Order Not Found") || tid === ''){
      console.log("cancelling order")
      return Authorizations.deny(authorization, {
        message: `vtex order search error, message: ${errorMessage}`
      })
    }

    if(tid){
      
      const tidSplitted = tid?.split("#")

      if(tidSplitted?.length){
        const [paymentIntentId, paymentMethod] = tidSplitted

        const hasBoleto = paymentMethod === "bankInvoice"
  
        const paymentIntent = await stripeClient.retrievePaymentIntent(paymentIntentId, String(appSecret), hasBoleto, version)

        console.log({ authorization: `authorization paymentIntent found: ${JSON.stringify(paymentIntent)}`})
        logger.info({ authorization: `authorization paymentIntent found: ${JSON.stringify(paymentIntent)}`})

        console.log(`authorization paymentIntent status ${paymentIntent.status}`)
        logger.info(`authorization paymentIntent status ${paymentIntent.status}`)

        if(paymentIntent.status === StripeStatus.succeeded){

          switch (paymentMethod) {
            case "bankInvoice":
              return Authorizations.approveBankInvoice(authorization as BankInvoiceAuthorization, {
                authorizationId: paymentIntent.id,
                code: '201',
                tid: `${paymentIntent.id}#${paymentMethod}`,
                nsu: `${paymentIntent.id}#${paymentMethod}`,
                message: `Boleto approved and waiting for settle`,
                delayToAutoSettle: 21600,
                delayToAutoSettleAfterAntifraud: 1800,
                delayToCancel: 21600
              } as any)
            case "oxxo":
              return Authorizations.approveBankInvoice(authorization as BankInvoiceAuthorization, {
                authorizationId: paymentIntent.id,
                code: '201',
                tid: `${paymentIntent.id}#${paymentMethod}`,
                nsu: `${paymentIntent.id}#${paymentMethod}`,
                message: `Oxxo approved and waiting for settle`,
                delayToAutoSettle: 21600,
                delayToAutoSettleAfterAntifraud: 1800,
                delayToCancel: 21600
              } as any)  
            default:
              return Authorizations.deny(authorization, {
                message: `${authorization.paymentMethod} denied, tid not found`
              })
          }

        } else if (paymentIntent.status === StripeStatus.canceled) {

          return Authorizations.deny(authorization, {
            message: `${paymentMethod} denied, status canceled`
          })
          
        }  else {

          switch (paymentMethod) {
            case "bankInvoice":
              return Authorizations.pendingBankInvoice(authorization as BankInvoiceAuthorization, {
                delayToCancel: 14400,
                barCodeImageNumber: paymentIntent.next_action.boleto_display_details.number,
                identificationNumber: paymentIntent.next_action.boleto_display_details.number,
                identificationNumberFormatted: paymentIntent.next_action.boleto_display_details.number,
                paymentUrl: paymentIntent.next_action.boleto_display_details.pdf,
                code: '201',
                tid: `${paymentIntent.id}#bankInvoice`,
                message: 'Boleto created and waiting for approval',
                delayToAutoSettle: 21600,
                delayToAutoSettleAfterAntifraud: 1800,
              } as any)
            case "oxxo":
              return Authorizations.pendingBankInvoice(authorization as BankInvoiceAuthorization, {
                delayToCancel: 14400,
                barCodeImageNumber: paymentIntent.next_action.boleto_display_details.number,
                identificationNumber: paymentIntent.next_action.boleto_display_details.number,
                identificationNumberFormatted: paymentIntent.next_action.boleto_display_details.number,
                paymentUrl: paymentIntent.next_action.boleto_display_details.pdf,
                code: '201',
                tid: `${paymentIntent.id}#bankInvoice`,
                message: 'Boleto created and waiting for approval',
                delayToAutoSettle: 21600,
                delayToAutoSettleAfterAntifraud: 1800,
              } as any)
            default:
              return Authorizations.deny(authorization, {
                message: `${authorization.paymentMethod} denied, tid not found`
              })
          }

        }
      } else {

        console.log(`tid splitted failed ${tid}`)
        logger.info(`tid splitted failed ${tid}`)

        return Authorizations.deny(authorization, {
          message: `${authorization.paymentMethod} denied, tid not found`
        })
      }

    }

    console.log(`creating ${authorization.paymentMethod} flow starting...`)
    logger.info(`creating ${authorization.paymentMethod} flow starting...`)

    if ((authorization.paymentMethod as any) === "Boleto Bancário") {
      authorization.paymentMethod = BankInvoice.BankInvoice
    }

    switch (authorization.paymentMethod) {
      case BankInvoice.BankInvoice:
        const bankInvoiceDefaultConfigs = {
          hasBoletoBeta: true,
          stripeApiSecret: String(appSecret),
          appVersion: version
        }

        const bankInvoiceIntentConfigs = {
          accountName: account,
          amount: convertInCents(value),
          currency: currency,
          orderId: orderId,
          paymentId: paymentId,
          transactionId: transactionId
        }

        const bankInvoicePaymentMethods = [PaymentMethods.boleto]

        let bankInvoicePaymentMethodData: any = {
            type: PaymentMethods.boleto,
            billing_details: {
              name: `${firstName} ${lastName}`,
              email: email
            },
            boleto: {
              tax_id: document
            }
        }

        if(addressFormatted){
          bankInvoicePaymentMethodData.billing_details.address = addressFormatted
        }

        const bankInvoiceIntent = await stripeClient.createPaymentIntent(bankInvoiceDefaultConfigs, bankInvoiceIntentConfigs, bankInvoicePaymentMethods, true, bankInvoicePaymentMethodData)

        console.log("bank invoice intent created: ", JSON.stringify(bankInvoiceIntent))
        logger.info(`bank invoice intent created: ${JSON.stringify(bankInvoiceIntent)}`)
        
        console.log(`bank invoice payment intetion created: ${bankInvoiceIntent.id}`)
        logger.info(`bank invoice payment intetion created: ${bankInvoiceIntent.id}`)

        return Authorizations.pendingBankInvoice(authorization as BankInvoiceAuthorization, {
          delayToCancel: 14400,
          barCodeImageNumber: bankInvoiceIntent.next_action.boleto_display_details.number,
          identificationNumber: bankInvoiceIntent.next_action.boleto_display_details.number,
          identificationNumberFormatted: bankInvoiceIntent.next_action.boleto_display_details.number,
          paymentUrl: bankInvoiceIntent.next_action.boleto_display_details.pdf,
          code: '201',
          tid: `${bankInvoiceIntent.id}#bankInvoice`,
          message: 'Boleto created and waiting for approval',
          delayToAutoSettle: 21600,
          delayToAutoSettleAfterAntifraud: 1800,
        } as any)
      case "OXXO":
        const oxxoDefaultConfigs = {
          hasBoletoBeta: false,
          stripeApiSecret: String(appSecret),
          appVersion: version
        }

        const oxxoIntentConfigs = {
          accountName: account,
          amount: convertInCents(value),
          currency: currency,
          orderId: orderId, 
          paymentId: paymentId,
          transactionId: transactionId
        }

        const oxxoPaymentMethods = [PaymentMethods.oxxo]

        let oxxoPaymentMethodData: any = {
          type: PaymentMethods.oxxo,
          billing_details: {
            name: `${firstName} ${lastName}`,
            email: email
          }
      }

      const oxxoIntent = await stripeClient.createPaymentIntent(oxxoDefaultConfigs, oxxoIntentConfigs, oxxoPaymentMethods, true, oxxoPaymentMethodData)

      console.log("oxxo intent created: ", JSON.stringify(oxxoIntent))
      logger.info(`oxxo intent created: ${JSON.stringify(oxxoIntent)}`)
      
      console.log(`oxxo payment intetion created: ${oxxoIntent.id}`)
      logger.info(`oxxo payment intetion created: ${oxxoIntent.id}`)

      return Authorizations.pendingBankInvoice(authorization as BankInvoiceAuthorization, {
        delayToCancel: 14400,
        barCodeImageNumber: oxxoIntent.next_action.oxxo_display_details.number,
        identificationNumber: oxxoIntent.next_action.oxxo_display_details.number,
        identificationNumberFormatted: oxxoIntent.next_action.oxxo_display_details.number,
        paymentUrl: oxxoIntent.next_action.oxxo_display_details.hosted_voucher_url,
        code: '201',
        tid: `${oxxoIntent.id}#oxxo`,
        message: 'Oxxo created and waiting for approval',
        delayToAutoSettle: 21600,
        delayToAutoSettleAfterAntifraud: 1800,
      } as any)
      case 'Google Pay':

        const walletDefaultConfigs = {
          hasBoletoBeta: false,
          stripeApiSecret: String(appSecret),
          appVersion: version
        }

        console.log({walletDefaultConfigs})

        const walletIntentConfigs = {
          accountName: account,
          amount: convertInCents(value),
          currency: currency,
          orderId: orderId,
          paymentId: paymentId,
          transactionId: transactionId
        }

        const walletIntent = await stripeClient.createPaymentIntent(walletDefaultConfigs, walletIntentConfigs, [], false)

        console.log(`Google Pay intent created ${JSON.stringify(walletIntent)}`)
        logger.info(`Google Pay intent created ${JSON.stringify(walletIntent)}`)

        const appPayload = {
          authorization,
          walletIntent,
          appKey
        }

        return Authorizations.redirect(authorization, {
          paymentId: authorization.paymentId,
          authorizationId: '',
          paymentAppData: {
            appName: 'stripe.google-pay-payment-authorization-app',
            payload: JSON.stringify(appPayload)
          },
          nsu: `${walletIntent.id}#card`,
          tid: `${walletIntent.id}#card`,
          code: '201',
          message: null,
          delayToAutoSettle: 10,
          delayToAutoSettleAfterAntifraud: 1800,
          delayToCancel: 21600,
        } as any)
      case 'Apple Pay':

        const applePayDefaultConfigs = {
          hasBoletoBeta: false,
          stripeApiSecret: String(appSecret),
          appVersion: version
        }

        console.log({applePayDefaultConfigs})

        const applePayIntentConfigs = {
          accountName: account,
          amount: convertInCents(value),
          currency: currency,
          orderId: orderId,
          paymentId: paymentId,
          transactionId: transactionId
        }

        const applePayIntent = await stripeClient.createPaymentIntent(applePayDefaultConfigs, applePayIntentConfigs, [], false)

        console.log(`Google Pay intent created ${JSON.stringify(applePayIntent)}`)
        logger.info(`Google Pay intent created ${JSON.stringify(applePayIntent)}`)

        const appleAppPayload = {
          authorization,
          walletIntent: applePayIntent,
          appKey
        }

        return Authorizations.redirect(authorization, {
          paymentId: authorization.paymentId,
          authorizationId: '',
          paymentAppData: {
            appName: 'stripe.apple-pay-payment-authorization-app',
            payload: JSON.stringify(appleAppPayload)
          },
          nsu: `${applePayIntent.id}#card`,
          tid: `${applePayIntent.id}#card`,
          code: '201',
          message: null,
          delayToAutoSettle: 10,
          delayToAutoSettleAfterAntifraud: 1800,
          delayToCancel: 21600,
        } as any)
      default:

        if(AVAILABLE_CARDS.includes(authorization.paymentMethod)){

          try {

            const { installments, installmentsInterestRate, installmentsValue } = authorization

            const hasInstallments = installments && installments > 1
                
            const creditCardDefaultConfigs = {
              hasBoletoBeta: false,
              stripeApiSecret: String(appSecret),
              appVersion: version
            }
            
              const stripePCI = new StripePCI({
                ...clientCtx,
              })
    
              const creditCardIntentConfigs = {
                accountName: account,
                amount: convertInCents(value),
                currency: currency,
                orderId: orderId,
                paymentId: paymentId,
                transactionId: transactionId
              }
      
            const creditCardPaymentMethods = [PaymentMethods.card]
    
            const creditCardIntent = await stripeClient.createPaymentIntent(creditCardDefaultConfigs, creditCardIntentConfigs, creditCardPaymentMethods, false, undefined, !!hasInstallments)
  
            console.log({creditCardIntent})

              let billingDetails = {
                name: `${firstName} ${lastName}`,
                email: email,
                address:addressFormatted
              }
              console.log("BILLING DETAILS",billingDetails)
            const { id: paymentMethodId } = await stripePCI.myPCIEndpoint(authorization as any, {
                orderId: orderId,
                paymentId: paymentId,
                transactionId: transactionId,
            }, creditCardDefaultConfigs.stripeApiSecret,billingDetails)

            await stripeClient.updatePaymentIntent(creditCardDefaultConfigs, creditCardIntent.id, paymentMethodId)

            const installmentsValues = {
              installments, 
              installmentsInterestRate, 
              installmentsValue
            }

            console.log({authorization})
            console.log({authorizationreturnUrl: authorization.returnUrl})
    
            const confirmedIntent = await stripeClient.confirmPaymentIntent(creditCardDefaultConfigs, creditCardIntent.id, installmentsValues, authorization.returnUrl)

            console.log({intentConfirmed: confirmedIntent})
            const cardAuthorization = authorization as CardAuthorization

            console.log("confirmedIntent.next_action", confirmedIntent.next_action)
            console.log("confirmedIntent.next_action.redirect_to_url", confirmedIntent.next_action?.redirect_to_url)

            if(confirmedIntent.status === 'requires_action' && confirmedIntent.next_action.type === 'redirect_to_url'){
              const redirect3dsUrl = confirmedIntent.next_action.redirect_to_url.url
              console.log({redirect3dsUrl})
              return Authorizations.redirect({
                ...authorization
              }, {
                delayToCancel: 21600,
                redirectUrl: redirect3dsUrl,
                code: "200",
                delayToAutoSettle: 10,
                message: "redirect_3ds_url",
                tid: `${creditCardIntent.id}#${PaymentMethods.card}`,
              } as any)
            }

            if(confirmedIntent.status === StripeStatus.succeeded){
              return Authorizations.approveCard(cardAuthorization, {
                authorizationId: creditCardIntent.id,
                nsu: `${creditCardIntent.id}#${PaymentMethods.card}`,
                tid: `${creditCardIntent.id}#${PaymentMethods.card}`,
                message: `Card Payment Approved, intentId ${creditCardIntent.id}`,
                delayToAutoSettle: 10
              })
            }
            
            return Authorizations.deny(authorization)
          } catch (error) {
            console.log(`error: ${error}`)
            logger.info(`error: ${error}`)
            return Authorizations.deny(authorization, {
              message: error.message
            })
          }

      }
    }

    return Authorizations.deny(authorization)
  }

  public async cancel(
    cancellation: CancellationRequest
  ): Promise<CancellationResponse> {
    if (this.isTestSuite) {
      return Cancellations.approve(cancellation, {
        cancellationId: randomString(),
      })
    }

    console.log(`received cancellation: ${JSON.stringify(cancellation)}`)

    return Cancellations.approve(cancellation, {
      cancellationId: String(cancellation.tid),
    })
  }

  public async refund(refund: RefundRequest): Promise<RefundResponse> {

    const {
      vtex: { logger, userAgent },
      headers
    } = this.context

    console.log(`received refund: ${JSON.stringify(refund)}`)
    logger.info(`received refund: ${JSON.stringify(refund)}`)
    
    const { tid } = refund

    const tidSplitted = tid?.split("#")

    console.log(`received tidSplitted to refund ${tidSplitted}`)
    logger.info(`received tidSplitted to refund ${tidSplitted}`)

    if(tidSplitted?.length){

      const [paymentIntent] = tidSplitted

      const appSecret = headers['x-provider-api-apptoken'];

      const version = userAgent.split("@")[1]

      const defaultConfigs = {
        hasBoletoBeta: false,
        stripeApiSecret: String(appSecret),
        appVersion: version
      }

      try {
        const paymentRefunded = await stripeClient.refundPaymentIntent(defaultConfigs, paymentIntent, refund.value)

        if(paymentRefunded.status === 'succeeded'){
          console.log(`payment refunded ${JSON.stringify(paymentRefunded)}`)
          logger.info(`payment refunded ${JSON.stringify(paymentRefunded)}`)
  
          return Refunds.approve(refund, {
            refundId: paymentIntent,
            message: `value ${refund.value} refunded`
          })
        }


      } catch (error) {
        return Refunds.deny(refund)
      }
      
      return Refunds.deny(refund)
    } else {
      return Refunds.deny(refund)
    }

  }

  public async settle(
    settlement: SettlementRequest
  ): Promise<SettlementResponse> {
    
    const {
      vtex: { logger, userAgent },
      headers
    } = this.context

    console.log({settlement})

    const { tid } = settlement

    const appSecret = headers['x-provider-api-apptoken'];

    const version = userAgent.split("@")[1]

    console.log({version})

    const stripeApiSecret = String(appSecret)

    const tidSplitted = tid?.split("#")

    console.log({tidSplitted})

    if(tidSplitted?.length){

      const [paymentIntentId, paymentMethod] = tidSplitted

      switch (paymentMethod) {
        case "bankInvoice":
          const bankInvoicePaymentIntent = await stripeClient.retrievePaymentIntent(paymentIntentId, stripeApiSecret, true, version)
          console.log(`bank invoice auto settle payment intent receveid ${JSON.stringify(bankInvoicePaymentIntent)}`)
          logger.info(`bank invoice auto settle payment intent receveid ${JSON.stringify(bankInvoicePaymentIntent)}`)

          if(bankInvoicePaymentIntent.status === StripeStatus.succeeded){
            return Settlements.approve(settlement, {
              settleId: String(settlement.transactionId),
              code: '201',
              message: 'Boleto approved',
            })
          } else if (bankInvoicePaymentIntent.status === StripeStatus.canceled) {
            return Settlements.deny(settlement, {
              message: "Boleto denied"
            })
          }
          break
        case "oxxo":
          const oxxoPaymentIntent = await stripeClient.retrievePaymentIntent(paymentIntentId, stripeApiSecret, false, version)
          console.log(`oxxo auto settle payment intent receveid ${JSON.stringify(oxxoPaymentIntent)}`)
          logger.info(`oxxo auto settle payment intent receveid ${JSON.stringify(oxxoPaymentIntent)}`)
          if(oxxoPaymentIntent.status === StripeStatus.succeeded){
            return Settlements.approve(settlement, {
              settleId: String(settlement.transactionId),
              code: '201',
              message: 'Oxxo approved',
            })
          } else if (oxxoPaymentIntent.status === StripeStatus.canceled) {
            return Settlements.deny(settlement, {
              message: "Oxxo denied",
            })
          }
          break
        default:
          if(paymentMethod === PaymentMethods.card){
            return Settlements.approve(settlement, {
              settleId: String(settlement.transactionId),
              code: '201',
              message: 'Card approved',
            })
          }

          return Settlements.deny(settlement)
      }
    }
    return Settlements.deny(settlement)
  }

  public inbound: undefined

  private async orderValidate(
    authorization: AuthorizationRequest & {
      installmentsInterestRate: number
      installmentsValue: number
      paymentMethod: PaymentMethod & {
        OXXO?: string
      }
    }
  ): Promise<{ tid?: string, errorMessage?: string }> {
    
    const {
      //@ts-ignore
      clients:{oms},
      vtex: { logger },
    } = this.context

    //@ts-ignore
    const clientCtx = this.context.clients.ctx
    
    //@ts-ignore
    // const vtexOrder = new VtexOrder({
    //   ...clientCtx,
    // })

    
    try {
      
      
      const response = await oms.order(authorization.orderId)
      logger.info(`vtex getting order ${authorization.orderId}`)

      console.log(`vtex getting order by sequence ${authorization.reference}`)
      logger.info(`vtex getting order by sequence ${authorization.reference}`)
      // const response = await vtexOrder.getOrder({orderId: `seq${authorization.reference}`})
      
      console.log("RESPONSE",response)
      console.log({response: response.paymentData.transactions[0].payments[0]})
      
      const tid = response.paymentData.transactions[0].payments[0].tid
      
      console.log(`tid found for orderId ${authorization.orderId}, tid: ${tid}`)
      
      logger.info(`tid found for orderId ${authorization.orderId}, tid: ${tid}`)
      
      return {
        tid:'response'
      };
    } catch (error) {

      if(error.response.data?.error?.message === "Order Not Found"){
        console.log(`tid not found for orderId ${authorization.orderId}`)
        logger.info(`tid not found for orderId ${authorization.orderId}`)
        return {
          errorMessage: "Order Not Found"
        }
      } else {
        return {
          errorMessage: error.message
        }
      }
    }

  }
}
