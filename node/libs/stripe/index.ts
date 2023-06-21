import Stripe from 'stripe'



export default ( stripeApiSecret: string, hasBoletoBeta: boolean = false, version: string) => {
  let apiVersion = '2020-03-02'

  if (hasBoletoBeta) {
    // apiVersion += ';boleto_beta=v1'
  }

  const stripeClient = new Stripe(stripeApiSecret, {
    //@ts-ignore
    apiVersion,
    appInfo: {
      name: "Stripe Official VTEX",
      version, 
      partner_id: "pp_partner_JI8ExJywRoRqKg",
      url: "https://www.stripe.com/partners/vtex"
    },
  })

  return stripeClient
}
