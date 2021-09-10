import React, { Suspense, useState } from 'react';
import 'dotenv/config';
import './App.less';
import { ConnectionProvider } from './utils/connection';
import { WalletProvider } from './utils/wallet';
import { PurpleThemeStyle } from './purpleTheme_style';
import { BlueThemeStyle } from './blueTheme_style';
import { Spin } from 'antd';
import ErrorBoundary from './components/ErrorBoundary';
import { Routes } from './routes';
import { PreferencesProvider } from './utils/preferences';
import { CurrencyPairProvider } from './utils/currencyPair';
import { ReferrerProvider } from './utils/referrer';
import { Helmet } from 'react-helmet';

//Making Theme interface
interface ThemeContextInterface {
  theme: boolean;
  nextTheme: boolean;
  toggleTheme: () => void;
}

//Create theme Context
export const ThemeContext = React.createContext<ThemeContextInterface>({
  theme: false, // true represent blue theme
  nextTheme: false, //here false represent purple theme
  toggleTheme: () => {},
});

export default function App() {
  console.log('process.env', process.env.REACT_APP_USDC_REFERRAL_FEES_ADDRESS);

  let localTheme = localStorage.getItem('theme') || '';
  const [theme, setTheme] = useState(localTheme === 'true' ? true : false); // by defualt is blue
  const nextTheme = !theme;

  const value = {
    theme,
    nextTheme,
    toggleTheme: () => {
      setTheme(!theme);
      localStorage.setItem('theme', JSON.stringify(!theme));
    },
  };

  return (
    <Suspense fallback={() => <Spin size="large" />}>
      {theme ? <BlueThemeStyle /> : <PurpleThemeStyle />}
      <ErrorBoundary>
        <ConnectionProvider>
          <ReferrerProvider>
            <WalletProvider>
              <ThemeContext.Provider value={value}>
                <PreferencesProvider>
                  <Suspense fallback={() => <Spin size="large" />}>
                    <Routes />
                  </Suspense>
                </PreferencesProvider>
              </ThemeContext.Provider>
            </WalletProvider>
          </ReferrerProvider>
        </ConnectionProvider>
      </ErrorBoundary>
    </Suspense>
  );
}
