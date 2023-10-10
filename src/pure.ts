import { IStripeConnectInitParams, StripeConnectInstance } from "../types";
import { loadScript, initStripeConnect, LoadConnect } from "./shared";

export const loadConnect: LoadConnect = (
  initParams: IStripeConnectInitParams
): StripeConnectInstance => {
  const maybeConnect = loadScript();
  return initStripeConnect(maybeConnect, initParams);
};
