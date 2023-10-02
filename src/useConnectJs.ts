import { loadScript, initStripeConnect} from "./shared";



export const loadConnectAndInitialize: React.FC = (stripePromise) => {

const [stripeConnectWrapper, setStripeConnectWrapper] = React.useState(loadScript().then(maybeStripe => initStripeConnect(maybeStripe)));

const stripeConnectInstance = stripeConnectWrapper.initialize(initParams);

const [loadingConnectJs, setLoadingConnectJs] = React.useState(true);
const [errorLoadingConnectJs, setErrorLoadingConnectJs] = React.useState(false);
const [initializedConnectJs, setInitializedConnectJs] = React.useState(false);
const [initParams, setInitParams] = React.useState<IStripeConnectInitParams | null>(null);
const [stripeConnectInstance, setStripeConnectInstance] = React.useState<StripeConnectInstance | null>(null);



  const connectJsScriptInitialized = React.useRef(false);
  const [isConnectJsInitError, setIsConnectJsInitError] = React.useState(false);
  const [connectInstance, setConnectInstance] =
    React.useState<StripeConnectInstance | null>(null);

  const initConnectJs = React.useCallback(() => {


    try {
      setConnectInstance(
        stripeConnectWrapper.initialize({

            ...initParams
         
        }),
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      setErrorLoadingConnectJs(true);
    }
  }, [
    
  ]);

  React.useEffect(() => {
    if (
      !canSeeConnectElements &&
      // TODO(BOOTSTRAP, 2023-01-31): [capital-express] Exceptions to initialize Connect.js for instant payouts and Capital in Express
      !canSeeInstantPayouts &&
      !canSeeCapitalEmbeddedComponents
    ) {
      return;
    }
    if (!currentMerchantId) {
      return;
    }

    if (!connectJsScriptInitialized.current) {
      connectJsScriptInitialized.current = true;
      const jsPath = 'v0.1/connect.js';
      const baseAssetUrl = getUrlFromEnvironment();

      const script = document.createElement('script');
      script.src = `${baseAssetUrl}${jsPath}`;
      document.head.appendChild(script);

      script.onerror = (error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        setIsConnectJsInitError(true);
      };

      script.onload = () => {
        window.StripeConnect ||= {};
        window.StripeConnect.onLoad = () => {
          initConnectJs();
        };
      };
    } else {
      initConnectJs();
    }
  }, [
    canSeeConnectElements,
    canSeeInstantPayouts,
    canSeeCapitalEmbeddedComponents,
    sessionApiKey,
    currentMerchantId,
    initConnectJs,
  ]);

  return (
    <ConnectJsContext.Provider value={{isConnectJsInitError}}>
      <ConnectComponentsProvider
        connectInstance={connectInstance as StripeConnectInstance}
      >
        {children}
      </ConnectComponentsProvider>
    </ConnectJsContext.Provider>
  );
};

export const ConnectJsErrorWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const {isConnectJsInitError} = useConnectJs();
  if (isConnectJsInitError) {
    return (
      <view.div
        css={{stack: 'y', paddingY: 'xxlarge', alignX: 'center', gap: 'small'}}
      >
        <ErrorState size="small" />
        <FormattedMessage {...messages.initConnectJsError} />
      </view.div>
    );
  } else {
    return <>{children}</>;
  }
};