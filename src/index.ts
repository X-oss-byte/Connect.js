// @ts-nocheck
import {
  ConnectElementTagName,
  IStripeConnectInitParams,
  IStripeConnectUpdateParams,
  StripeConnectInstance,
  StripeConnectWrapper,
} from "../types";
import { loadScript, initStripeConnect, LoadConnect } from "./shared";

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

const methodsToProxy = ["create", "update", "logout"];

export const loadConnectAndInitialize = (
  initParams: IStripeConnectInitParams
): StripeConnectInstance => {
  loadCalled = true;
  let connectInstance = null;

  const stripeConnectInstance = loadScript().then((wrapper) =>
    wrapper.initialize(initParams)
  );
  return {
    create: (tagName) => {
      if (connectInstance !== null) {
        return connectInstance.create(tagName);
      }
      const element = document.createElement(tagName);
      stripeConnectInstance.then((instance) => {
        connectInstance = instance;
        (element as any).setConnector(instance);
      });

      return element;
    },
    update: (updateOptions) => {
      if (connectInstance !== null) {
        connectInstance.update(updateOptions);
      }
      stripeConnectInstancePromise.then((instance) => {
        instance.update(updateOptions);
      });
    },
  };
};

/* const dummyInitScript = (
  stripeConnectWrapper: Promise<StripeConnectWrapper>,
  initParams: IStripeConnectInitParams
) => {
  console.log("initializing");
  return stripeConnectWrapper.then((wrapper) => {
    wrapper.initialize(initParams);
  });
};

const stripeConnectInstancePromise = new DeferredPromise<ConnectInstance>();
const loadConnectAndInit = (initOptions) => {
  return {
    //create:  // This can be our existing create implementation, no need to change it!
    update: (updateOptions) => {
      stripeConnectInstancePromise.then((instance) => {
        instance.update(updateOptions);
      });
    },
  };
};

const initStripeConnectInstanceProxy = (
  stripeConnectWrapper: Promise<StripeConnectWrapper>,
  initParams: IStripeConnectInitParams
): StripeConnectInstance => {
  const connectWrapper = loadScript()
    .then((maybeConnect) => initStripeConnect(maybeConnect))
    .then((wrapper) => wrapper.initialize(initParams));
  const queuedMethods = [];
  const obj = {};

  dummyInitScript(stripeConnectWrapper, initParams).then((realConnect) => {
    console.log("real object loaded");
    console.log("method queue", queuedMethods);
    connectInstance = realConnect;
    for (const [method, args] of queuedMethods) {
      realConnect[method](...args);
    }
  });

  for (const method of methodsToProxy) {
    obj[method] = (...args) => {
      if (connectInstance) {
        return connectInstance[method](...args);
      } else {
        queuedMethods.push([method, args]);
      }
    };
  }
  return obj;
};
 */
