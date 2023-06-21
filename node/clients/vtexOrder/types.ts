export interface PayloadVtexOrder {
    orderId: string
}

export interface DataVtexOrder {
    orderId:                     string;
    sequence:                    string;
    marketplaceOrderId:          string;
    marketplaceServicesEndpoint: string;
    sellerOrderId:               string;
    origin:                      string;
    affiliateId:                 string;
    salesChannel:                string;
    merchantName:                null;
    status:                      string;
    statusDescription:           string;
    value:                       number;
    creationDate:                string;
    lastChange:                  string;
    orderGroup:                  string;
    totals:                      Total[];
    items:                       ItemElement[];
    marketplaceItems:            any[];
    clientProfileData:           ClientProfileData;
    giftRegistryData:            null;
    marketingData:               null;
    ratesAndBenefitsData:        RatesAndBenefitsData;
    shippingData:                ShippingData;
    paymentData:                 PaymentData;
    packageAttachment:           PackageAttachment;
    sellers:                     Seller[];
    callCenterOperatorData:      null;
    followUpEmail:               string;
    lastMessage:                 null;
    hostname:                    string;
    invoiceData:                 null;
    changesAttachment:           null;
    openTextField:               null;
    roundingError:               number;
    orderFormId:                 string;
    commercialConditionData:     null;
    isCompleted:                 boolean;
    customData:                  null;
    storePreferencesData:        StorePreferencesData;
    allowCancellation:           boolean;
    allowEdition:                boolean;
    isCheckedIn:                 boolean;
    marketplace:                 Marketplace;
    authorizedDate:              null;
    invoicedDate:                null;
    cancelReason:                null;
    itemMetadata:                ItemMetadata;
    subscriptionData:            null;
    taxData:                     null;
    checkedInPickupPointId:      null;
    cancellationData:            null;
}

export interface ClientProfileData {
    id:                string;
    email:             string;
    firstName:         string;
    lastName:          string;
    documentType:      string;
    document:          string;
    phone:             string;
    corporateName:     null;
    tradeName:         null;
    corporateDocument: null;
    stateInscription:  null;
    corporatePhone:    null;
    isCorporate:       boolean;
    userProfileId:     string;
    customerClass:     null;
}

export interface ItemMetadata {
    Items: Item[];
}

export interface Item {
    Id:              string;
    Seller:          string;
    Name:            string;
    SkuName:         string;
    ProductId:       string;
    RefId:           string;
    Ean:             string;
    ImageUrl:        string;
    DetailUrl:       string;
    AssemblyOptions: any[];
}

export interface ItemElement {
    uniqueId:              string;
    id:                    string;
    productId:             string;
    ean:                   string;
    lockId:                string;
    itemAttachment:        ItemAttachment;
    attachments:           any[];
    quantity:              number;
    seller:                string;
    name:                  string;
    refId:                 string;
    price:                 number;
    listPrice:             number;
    manualPrice:           null;
    priceTags:             any[];
    imageUrl:              string;
    detailUrl:             string;
    components:            any[];
    bundleItems:           any[];
    params:                any[];
    offerings:             any[];
    sellerSku:             string;
    priceValidUntil:       null;
    commission:            number;
    tax:                   number;
    preSaleDate:           null;
    additionalInfo:        AdditionalInfo;
    measurementUnit:       string;
    unitMultiplier:        number;
    sellingPrice:          number;
    isGift:                boolean;
    shippingPrice:         null;
    rewardValue:           number;
    freightCommission:     number;
    priceDefinitions:      null;
    taxCode:               string;
    parentItemIndex:       null;
    parentAssemblyBinding: null;
    callCenterOperator:    null;
    serialNumbers:         null;
    assemblies:            any[];
    costPrice:             number;
}

export interface AdditionalInfo {
    brandName:             string;
    brandId:               string;
    categoriesIds:         string;
    categories:            Category[];
    productClusterId:      string;
    commercialConditionId: string;
    dimension:             Dimension;
    offeringInfo:          null;
    offeringType:          null;
    offeringTypeId:        null;
}

export interface Category {
    id:   number;
    name: string;
}

export interface Dimension {
    cubicweight: number;
    height:      number;
    length:      number;
    weight:      number;
    width:       number;
}

export interface ItemAttachment {
    content: Content;
    name:    null;
}

export interface Content {
}

export interface Marketplace {
    baseURL:     string;
    isCertified: null;
    name:        string;
}

export interface PackageAttachment {
    packages: any[];
}

export interface PaymentData {
    giftCards:    any[];
    transactions: Transaction[];
}

export interface Transaction {
    isActive:      boolean;
    transactionId: string;
    merchantName:  string;
    payments:      Payment[];
}

export interface Payment {
    id:                                             string;
    paymentSystem:                                  string;
    paymentSystemName:                              string;
    value:                                          number;
    installments:                                   number;
    referenceValue:                                 number;
    cardHolder:                                     null;
    cardNumber:                                     null;
    firstDigits:                                    null;
    lastDigits:                                     null;
    cvv2:                                           null;
    expireMonth:                                    null;
    expireYear:                                     null;
    url:                                            string;
    giftCardId:                                     null;
    giftCardName:                                   null;
    giftCardCaption:                                null;
    redemptionCode:                                 null;
    group:                                          string;
    tid:                                            string;
    dueDate:                                        null;
    connectorResponses:                             ConnectorResponses;
    giftCardProvider:                               null;
    giftCardAsDiscount:                             null;
    koinUrl:                                        null;
    accountId:                                      null;
    parentAccountId:                                null;
    bankIssuedInvoiceIdentificationNumber:          string;
    bankIssuedInvoiceIdentificationNumberFormatted: string;
    bankIssuedInvoiceBarCodeNumber:                 string;
    bankIssuedInvoiceBarCodeType:                   null;
    billingAddress:                                 null;
}

export interface ConnectorResponses {
    Tid:        string;
    ReturnCode: string;
    Message:    string;
}

export interface RatesAndBenefitsData {
    id:                         string;
    rateAndBenefitsIdentifiers: any[];
}

export interface Seller {
    id:                  string;
    name:                string;
    logo:                string;
    fulfillmentEndpoint: string;
}

export interface ShippingData {
    id:                string;
    address:           Address;
    logisticsInfo:     LogisticsInfo[];
    trackingHints:     null;
    selectedAddresses: Address[];
}

export interface Address {
    addressType:    string;
    receiverName:   string;
    addressId:      string;
    postalCode:     string;
    city:           string;
    state:          string;
    country:        string;
    street:         string;
    number:         string;
    neighborhood:   string;
    complement:     string;
    reference:      null;
    geoCoordinates: number[];
}

export interface LogisticsInfo {
    itemIndex:            number;
    selectedSla:          string;
    lockTTL:              string;
    price:                number;
    listPrice:            number;
    sellingPrice:         number;
    deliveryWindow:       null;
    deliveryCompany:      string;
    shippingEstimate:     string;
    shippingEstimateDate: null;
    slas:                 Sla[];
    shipsTo:              string[];
    deliveryIds:          DeliveryID[];
    deliveryChannel:      string;
    pickupStoreInfo:      PickupStoreInfo;
    addressId:            string;
    polygonName:          null;
    pickupPointId:        null;
    transitTime:          string;
}

export interface DeliveryID {
    courierId:          string;
    courierName:        string;
    dockId:             string;
    quantity:           number;
    warehouseId:        string;
    accountCarrierName: string;
}

export interface PickupStoreInfo {
    additionalInfo: null;
    address:        null;
    dockId:         null;
    friendlyName:   null;
    isPickupStore:  boolean;
}

export interface Sla {
    id:               string;
    name:             string;
    shippingEstimate: string;
    deliveryWindow:   null;
    price:            number;
    deliveryChannel:  string;
    pickupStoreInfo:  PickupStoreInfo;
    polygonName:      null;
    lockTTL:          string;
    pickupPointId:    null;
    transitTime:      string;
}

export interface StorePreferencesData {
    countryCode:        string;
    currencyCode:       string;
    currencyFormatInfo: CurrencyFormatInfo;
    currencyLocale:     number;
    currencySymbol:     string;
    timeZone:           string;
}

export interface CurrencyFormatInfo {
    CurrencyDecimalDigits:    number;
    CurrencyDecimalSeparator: string;
    CurrencyGroupSeparator:   string;
    CurrencyGroupSize:        number;
    StartsWithCurrencySymbol: boolean;
}

export interface Total {
    id:    string;
    name:  string;
    value: number;
}
