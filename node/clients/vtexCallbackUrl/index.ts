import { InstanceOptions, IOContext, JanusClient } from '@vtex/api'
import {
    VtexCallbackExecute,
} from './types'

export default class VtexCallbackUrl extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
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

  public execute(callbackUrl: string, data: VtexCallbackExecute) {

    console.log({callbackUrl, data})

    return this.http.post(callbackUrl, {
        ...data
    }, {
      metric: "VtexCallbackUrl-execute"
    })
  }
}
