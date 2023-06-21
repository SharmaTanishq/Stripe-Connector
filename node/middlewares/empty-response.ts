export async function emptyResponse(ctx: any, next: () => Promise<any>) {

    ctx.body = { status: true }
    ctx.status = 200

    await next()

}