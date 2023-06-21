/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-type-imports */

import { ClientsConfig, LRUCache, method } from '@vtex/api'
import { PaymentProviderService } from '@vtex/payment-provider'
import { Clients } from './clients'
// import { method } from '@vtex/payment-provider'

import StripeConnector from './connector'
import { emptyResponse } from './middlewares/empty-response'
import { notifications } from './middlewares/notifications'
import { webhookNotifications } from './middlewares/webhook-notications'



const TIMEOUT_MS = 5000

const memoryCache = new LRUCache<string, any>({ max: 5000 })

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    status: {
      memoryCache,
    },
  },
}



export default new PaymentProviderService({
  clients,
  connector: StripeConnector, 
  routes: {
    notifications: method({
      POST: [notifications],
    }),
    webhookNotifications: method({
      POST: [webhookNotifications],
    }),
    emptyResponse: method({
      POST: [emptyResponse],
    }),
  }

  
})
