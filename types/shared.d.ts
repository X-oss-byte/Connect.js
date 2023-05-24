export declare type LoadConnect = () => Promise<StripeConnectWrapper>;

export declare type OverlayOption = "dialog" | "drawer";

export declare type UIConfigOptions = {
  overlay?: OverlayOption;
  overlayZIndex?: number;
};

export declare type AppearanceOptions = {
  colorPrimary?: string;
  fontFamily?: string;
};

export type IStripeConnectUpdateParams = {
  appearance?: AppearanceOptions;
};

export interface IStripeConnectInitParams {
  publishableKey: string;
  clientSecret: string;
  appearance?: AppearanceOptions;
  uiConfig?: UIConfigOptions;
  refreshClientSecret?: () => Promise<string>;
  locale?: string;
}

export interface StripeConnectWrapper {
  initialize: (params: IStripeConnectInitParams) => StripeConnectInstance;
}

export interface StripeConnectInstance {
  create: (tagName: string) => HTMLElement | null;
  update: (options: IStripeConnectUpdateParams) => void;
}
export declare const findScript: () => HTMLScriptElement | null;

export declare const loadScript: () => Promise<any | null>;

export declare const initStripeConnect: (
  stripeConnectPromise: StripeConnectWrapper | null
) => any | null;
