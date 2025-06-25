// ** Next Imports
import Head from 'next/head';
import { Router } from 'next/router';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

// ** Loader Import
import NProgress from 'nprogress';

// ** Emotion Imports
import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/cache';

// ** Config Imports
import themeConfig from 'src/configs/themeConfig';

// ** Third Party Import
import { Toaster } from 'react-hot-toast';

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout';
import ThemeComponent from 'src/@core/theme/ThemeComponent';

// ** Contexts
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext';
import { CartProvider } from 'src/context/CartContext';

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache';

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css';

// ** Global css styles
import '../../styles/globals.css';

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage;
  emotionCache: EmotionCache;
};

const clientSideEmotionCache = createEmotionCache();

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start();
  });
  Router.events.on('routeChangeError', () => {
    NProgress.done();
  });
  Router.events.on('routeChangeComplete', () => {
    NProgress.done();
  });
}

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  // Variables
  const getLayout = Component.getLayout ?? ((page) => <UserLayout>{page}</UserLayout>);

  return (
    <SessionProvider session={pageProps.session}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>{`${themeConfig.templateName}`}</title>
          <meta
            name="description"
            content={`${themeConfig.templateName}`}
          />
          <meta name="keywords" content="AgriConnect, agriculture, commande, paiement, produits agricoles, React, MUI, marketplace, admin, template, gestion, livraison, OTP, OwoPay, e-commerce, Afrique, plateforme, moderne, sécurité, transaction, panier, commande en ligne" />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>

        <SettingsProvider>
          <SettingsConsumer>
            {({ settings }) => (
              <ThemeComponent settings={settings}>
                <CartProvider>
                  <Toaster position="top-right" />
                  {getLayout(<Component {...pageProps} />)}
                </CartProvider>
              </ThemeComponent>
            )}
          </SettingsConsumer>
        </SettingsProvider>
      </CacheProvider>
    </SessionProvider>
  );
};

export default App;