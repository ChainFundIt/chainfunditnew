import { calculateCollectionCheckoutFees } from "./checkout-fees";

describe("calculateCollectionCheckoutFees", () => {
  it("charges provider fee plus custom support amount when supporting", () => {
    const fees = calculateCollectionCheckoutFees({
      contributionAmount: 100,
      currency: "GBP",
      paymentMethod: "paypal",
      supportChainfundit: true,
      chainfunditSupportAmount: 2.5,
    });
    expect(fees.providerFee).toBe(2);
    expect(fees.platformFee).toBe(2.5);
    expect(fees.totalCharged).toBe(104.5);
  });

  it("charges provider fee only when not supporting", () => {
    const fees = calculateCollectionCheckoutFees({
      contributionAmount: 100,
      currency: "GBP",
      paymentMethod: "paypal",
      supportChainfundit: false,
      chainfunditSupportAmount: 5,
    });
    expect(fees.platformFee).toBe(0);
    expect(fees.totalCharged).toBe(102);
  });

  it("includes zero support in fee preview only when amount not set yet", () => {
    const fees = calculateCollectionCheckoutFees({
      contributionAmount: 10,
      currency: "USD",
      paymentMethod: "paystack",
      supportChainfundit: true,
      chainfunditSupportAmount: 0,
    });
    expect(fees.platformFee).toBe(0);
    expect(fees.totalCharged).toBe(10.1);
  });
});