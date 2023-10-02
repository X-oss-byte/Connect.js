import { IStripeConnectInitParams, StripeConnectInstance } from "../types";
import { loadScript, initStripeConnect, LoadConnect } from "./shared";
import { useQuery } from "react-query";

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
  stripePromise.then((maybeConnect) => initStripeConnectProxy(maybeConnect));
  const { data } = useQuery([initParams], async () => {
    const stripeConnectWrapper = await stripePromise.then((maybeConnect) =>
      initStripeConnect(maybeConnect)
    );
    if (stripeConnectWrapper === null) {
      throw new Error("Stripe Connect has not loaded correctly");
    }

    return stripeConnectWrapper.initialize(initParams);
  });

  return data;
};

const methodsToProxy = ["init", "update"];

const dummyInitScript = () => {
  return new Promise((res) => {
    setTimeout(() => {
      res({
        init: () => console.log("init already called"),
        update: (...args) => console.log("real update called with", ...args),
      });
    }, 5000);
  });
};

const initStripeConnectProxy = () => {
  let loadedObj = null;
  let queuedMethods = [];
  const connectInstance = {};
  for (const method of methodsToProxy) {
    obj[method] = (...args) => {
      if (loadedObj) {
        return loadedObj[method](...args);
      }
      if (method == "init") {
        console.log("init called");
        dummyInitScript().then((realConnect) => {
          console.log("real object loaded");
          console.log("method queue", queuedMethods);
          loadedObj = realConnect;
          for (const [method, args] of queuedMethods) {
            realConnect[method](...args);
          }
        });
      } else {
        queuedMethods.push([method, args]);
      }
    };
  }
  return obj;
};

window.myConnect = { init: () => makeConnectObject() };

export {};
