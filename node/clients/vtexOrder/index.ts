import { InstanceOptions, IOContext, ExternalClient } from '@vtex/api'
import {
    PayloadVtexOrder,
    DataVtexOrder
} from './types'

export class VtexOrder extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://${context.account}.myvtex.com/api/oms/pvt/orders`,context, {
        ...options,
        timeout: 5000,
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          VtexIdclientAutCookie: context.authToken,
          'X-Vtex-Use-Https': 'true',
        },
      })
  }

  public getOrder(data: PayloadVtexOrder) {
    return this.http.get<DataVtexOrder>(`/${data.orderId}`)
  }
}
