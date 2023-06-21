export type VtexCallbackExecute = {
    paymentId: string,
    tid: string,
    authorizationId: string,
    nsu: string,
    status: VtexCallbackExecuteStatus
    code: string,
    message: string,
    delayToAutoSettle: number
}

export enum VtexCallbackExecuteStatus {
    approved = 'approved',
    denied = 'denied'
}