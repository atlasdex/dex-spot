import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import TradePage from './pages/TradePage';
import OpenOrdersPage from './pages/OpenOrdersPage';
import React from 'react';
import BalancesPage from './pages/BalancesPage';
import ConvertPage from './pages/ConvertPage';
import BasicLayout from './components/BasicLayout';
import ListNewMarketPage from './pages/ListNewMarketPage';
import NewPoolPage from './pages/pools/NewPoolPage';
import PoolPage from './pages/pools/PoolPage';
import PoolListPage from './pages/pools/PoolListPage';
import { getTradePageUrl } from './utils/markets';
import { CurrencyPairProvider } from './utils/currencyPair';
import { AccountsProvider } from './utils/accounts';
import LeaderBoardPage from './pages/leaderBoard';
import { NotFoundPage } from './pages/NotFoundPage/index';

export function Routes() {
  return (
    <>
      <HashRouter basename={'/'}>
        <BasicLayout>
          <AccountsProvider>
            <CurrencyPairProvider>
              <Switch>
                <Route exact path="/">
                  <Redirect to={getTradePageUrl()} />
                </Route>
                <Route exact path="/market/:marketAddress">
                  <TradePage />
                </Route>
                <Route exact path="/orders" component={OpenOrdersPage} />
                <Route exact path="/balances" component={BalancesPage} />
                {/* <Route exact path="/swap" component={ConvertPage} /> */}
                <Route exact path="/leader-board" component={LeaderBoardPage} />
                <Route
                  exact
                  path="/list-new-market"
                  component={ListNewMarketPage}
                />
                <Route component={NotFoundPage} />
              </Switch>
            </CurrencyPairProvider>
          </AccountsProvider>
        </BasicLayout>
      </HashRouter>
    </>
  );
}
