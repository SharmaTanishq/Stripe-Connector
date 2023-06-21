import { Address, Maybe } from "@vtex/payment-provider"
import getCountryISO2 from "./countryConvert"

export default (shippingAddress: Maybe<Address>) => {
    
    if(shippingAddress){
      return {
        city: shippingAddress.city,
        line1: String(`${shippingAddress.street}, ${shippingAddress.neighborhood}, ${shippingAddress.number}`),
        line2: `${shippingAddress.complement}`,
        state: shippingAddress.state,
        country: getCountryISO2(String(shippingAddress.country)),
        postal_code: shippingAddress.postalCode,
      }
    }

    return null
}