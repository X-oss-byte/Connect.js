import {
  ConnectElementTagName,
  IStripeConnectInitParams,
  StripeConnectInstance,
} from "../types";
import { loadScript, initStripeConnect, LoadConnect } from "./shared";

export type ConnectElementHTMLName =
  | "stripe-connect-payments"
  | "stripe-connect-payouts"
  | "stripe-connect-payment-details"
  | "stripe-connect-account-onboarding";

export const componentNameMapping: Record<
  ConnectElementTagName,
  ConnectElementHTMLName
> = {
  payments: "stripe-connect-payments",
  payouts: "stripe-connect-payouts",
  "payment-details": "stripe-connect-payment-details",
  "account-onboarding": "stripe-connect-account-onboarding",
};

// Execute our own script injection after a tick to give users time to do their
// own script injection.
const stripePromise = Promise.resolve().then(() => loadScript());

let loadCalled = false;

stripePromise.catch((err: Error) => {
  if (!loadCalled) {
    console.warn(err);
  }
});

export const loadConnect: LoadConnect = () => {
  loadCalled = true;

  return stripePromise.then((maybeConnect) => initStripeConnect(maybeConnect));
};

export const loadConnectAndInitialize = (
  initParams: IStripeConnectInitParams
): StripeConnectInstance => {
  loadCalled = true;

  const stripeConnectInstance = loadScript().then((wrapper) =>
    wrapper?.initialize(initParams)
  );
  return {
    create: (tagName) => {
      let htmlName = componentNameMapping[tagName];
      if (!htmlName) {
        htmlName = tagName as ConnectElementHTMLName;
      }
      const element = document.createElement(htmlName);
      stripeConnectInstance.then((instance) => {
        (element as any).setConnector((instance as any).connect);
      });

      return element;
    },
    update: (updateOptions) => {
      stripeConnectInstance.then((instance) => {
        instance?.update(updateOptions);
      });
    },
    debugInstance: () => {
      return stripeConnectInstance;
    },
    logout: () => {
      return stripeConnectInstance.then((instance) => {
        instance?.logout();
      });
    },
  };
};
