import { Button, Card, Popover, Spin, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  useConnection,
  useConnectionConfig,
  useSlippageConfig,
} from '../utils/connection';
import { useWallet } from '../utils/wallet';
import { CurrencyInput } from '../components/currencyInput/index';
import {
  LoadingOutlined,
  SwapOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  swap,
  usePoolForBasket,
  PoolOperation,
  LIQUIDITY_PROVIDER_FEE,
} from '../utils/pools';
import { notify } from '../utils/notifications';
import { useCurrencyPairState } from '../utils/currencyPair';
import { generateActionLabel, POOL_NOT_AVAILABLE, SWAP_LABEL } from './labels';
import './trade.less';
import { colorWarning, getTokenName } from '../utils/utils';
import { AdressesPopover } from '../components/pool/address';
import { PoolInfo } from '../models';
import { useEnrichedPools } from '../utils/markets';
import { CgArrowsExchangeAlt } from 'react-icons/cg';
import { MigrationModal } from '../components/migration';
import styled from 'styled-components';
import Div from '../components/DivComponent';

const SwapWrapper = styled.div`
  border: 1px solid gray;
`;

const { Text } = Typography;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export const ConvertForm = () => {
  const { wallet, connect, connected } = useWallet();
  const connection = useConnection();
  const [pendingTx, setPendingTx] = useState(false);
  const { A, B, setLastTypedAccount, setPoolOperation } =
    useCurrencyPairState();
  const pool = usePoolForBasket([A?.mintAddress, B?.mintAddress]);
  // console.log('pool data here' , pool);

  const { slippage } = useSlippageConfig();
  const { tokenMap } = useConnectionConfig();

  const swapAccounts = () => {
    const tempMint = A.mintAddress;
    const tempAmount = A.amount;
    A.setMint(B.mintAddress);
    A.setAmount(B.amount);
    B.setMint(tempMint);
    B.setAmount(tempAmount);
    // @ts-ignore
    setPoolOperation((op: PoolOperation) => {
      switch (+op) {
        case PoolOperation.SwapGivenInput:
          return PoolOperation.SwapGivenProceeds;
        case PoolOperation.SwapGivenProceeds:
          return PoolOperation.SwapGivenInput;
        case PoolOperation.Add:
          return PoolOperation.SwapGivenInput;
      }
    });
  };

  const handleSwap = async () => {
    if (A.account && B.mintAddress) {
      try {
        setPendingTx(true);

        const components = [
          {
            account: A.account,
            mintAddress: A.mintAddress,
            amount: A.convertAmount(),
          },
          {
            mintAddress: B.mintAddress,
            amount: B.convertAmount(),
          },
        ];

        await swap(connection, wallet, components, slippage, pool);
      } catch(error) {
        console.log('error from swap' , error);
        
        notify({
          description:
            'Please try again and approve transactions from your wallet',
          message: 'Swap trade cancelled.',
          type: 'error',
        });
      } finally {
        setPendingTx(false);
      }
    }
  };

  return (
    <>
      <div className="input-card mt-5">
        <AdressesPopover pool={pool} />
        <div className="d-flex mobileView bd-highlight">
          <div className="p-2 flex-fill bd-highlight">
            <div className={'boardContainer'}>
              <CurrencyInput
                title="Input"
                onInputChange={(val: any) => {
                  setPoolOperation(PoolOperation.SwapGivenInput);
                  if (A.amount !== val) {
                    setLastTypedAccount(A.mintAddress);
                  }

                  A.setAmount(val);
                }}
                amount={A.amount}
                mint={A.mintAddress}
                onMintChange={(item) => {
                  A.setMint(item);
                }}
              />
            </div>
          </div>
          <div className="p-2 align-self-center flex-fill bd-highlight">
            {/* <Button
                type="primary"
                className="swap-button"
                onClick={swapAccounts}
              >
                ⇅
              </Button> */}
            <CgArrowsExchangeAlt
              className="swap-button"
              onClick={swapAccounts}
            />
          </div>
          <div className="p-2 flex-fill bd-highlight">
            <div className={'boardContainer'}>
              <CurrencyInput
                title="To (Estimate)"
                onInputChange={(val: any) => {
                  setPoolOperation(PoolOperation.SwapGivenProceeds);
                  if (B.amount !== val) {
                    setLastTypedAccount(B.mintAddress);
                  }

                  B.setAmount(val);
                }}
                amount={B.amount}
                mint={B.mintAddress}
                onMintChange={(item) => {
                  B.setMint(item);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Div classes="row  mx-0 payment-data mb-4">
        <Div classes="inner-payment-data w-100">
          <Div classes={'row m-0 justify-content-around'}>
            <Div classes={'rate-row'}>
              <Div classes={'mb-4'}>
                <Div classes={'oExiL'}>Rate</Div>
                <Div classes="d-flex oExiL">
                  <span className={'gray-text'}>1 SOL</span> 3.6533137 RAY
                </Div>
              </Div>
              <Div>
                <Div classes={'oExiL'}>Inverse Rate</Div>
                <Div classes="d-flex oExiL">
                  <span className={'gray-text'}>1 RAY</span> 3.6533137 SOL
                </Div>
              </Div>
            </Div>
            <Div classes={'vertical-line d-none d-md-block'}></Div>
            <Div classes={'estimate-row'}>
              <Div classes={'mb-4'}>
                <Div classes={'oExiL'}>USD Price</Div>
                <Div classes="d-flex oExiL">
                  <span className={'gray-text'}>1 SOL</span> $3.6533137
                </Div>
              </Div>
              <Div>
                <Div classes={'oExiL'}>Estimated Fee</Div>
                <Div classes="d-flex oExiL">≈ $2.5</Div>
              </Div>
            </Div>
            <Div classes={'vertical-line d-none d-md-block'}></Div>
            <Div classes={'save-row'}>
              <Div classes={'mb-4'}>
                <Div classes={'oExiL'}>You Save</Div>
                <Div classes="d-flex oExiL">≈ $10.5</Div>
              </Div>
            </Div>
          </Div>
        </Div>
      </Div>

      <div className={'boardContainer ml-2'}>
        <Button
          className="trade-button"
          size="large"
          onClick={connected ? handleSwap : connect}
          style={{ width: '100%', borderRadius: 14 }}
          disabled={
            connected &&
            (pendingTx ||
              !A.account ||
              !B.mintAddress ||
              A.account === B.account ||
              !A.sufficientBalance() ||
              !pool)
          }
        >
          {generateActionLabel(
            !pool
              ? POOL_NOT_AVAILABLE(
                  getTokenName(tokenMap, A.mintAddress),
                  getTokenName(tokenMap, B.mintAddress),
                )
              : SWAP_LABEL,
            connected,
            tokenMap,
            A,
            B,
            true,
          )}
          {pendingTx && <Spin indicator={antIcon} className="add-spinner" />}
        </Button>
      </div>
      {/* <TradeInfo pool={pool} /> */}
    </>
  );
};

export const TradeInfo = (props: { pool?: PoolInfo }) => {
  const { A, B } = useCurrencyPairState();
  const { pool } = props;
  const { slippage } = useSlippageConfig();
  const pools = useMemo(() => (pool ? [pool] : []), [pool]);
  const enriched = useEnrichedPools(pools);

  const [amountOut, setAmountOut] = useState(0);
  const [priceImpact, setPriceImpact] = useState(0);
  const [lpFee, setLpFee] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [priceAccount, setPriceAccount] = useState('');

  useEffect(() => {
    if (!pool || enriched.length === 0) {
      return;
    }
    if (B.amount) {
      const minAmountOut = parseFloat(B?.amount) * (1 - slippage);
      setAmountOut(minAmountOut);
    }
    const liqA = enriched[0].liquidityA;
    const liqB = enriched[0].liquidityB;
    const supplyRatio = liqA / liqB;
    // We need to make sure the order matched the pool's accounts order
    const enrichedA = A.mintAddress === enriched[0].mints[0] ? A : B;
    const enrichedB = enrichedA.mintAddress === A.mintAddress ? B : A;
    const calculatedRatio =
      parseFloat(enrichedA.amount) / parseFloat(enrichedB.amount);
    // % difference between pool ratio and  calculated ratio
    setPriceImpact(Math.abs(100 - (calculatedRatio * 100) / supplyRatio));

    // 6 decimals without trailing zeros
    const lpFeeStr = (parseFloat(A.amount) * LIQUIDITY_PROVIDER_FEE).toFixed(6);
    setLpFee(parseFloat(lpFeeStr));

    if (priceAccount === B.mintAddress) {
      setExchangeRate(parseFloat(B.amount) / parseFloat(A.amount));
    } else {
      setExchangeRate(parseFloat(A.amount) / parseFloat(B.amount));
    }
  }, [A, B, slippage, pool, enriched, priceAccount]);

  const handleSwapPriceInfo = () => {
    if (priceAccount !== B.mintAddress) {
      setPriceAccount(B.mintAddress);
    } else {
      setPriceAccount(A.mintAddress);
    }
  };
  return !!parseFloat(B.amount) ? (
    <div className="pool-card" style={{ width: 'initial' }}>
      <div className="pool-card-row">
        <Text className="pool-card-cell">Price</Text>
        <div className="pool-card-cell " title={exchangeRate.toString()}>
          <Button
            shape="circle"
            size="middle"
            type="text"
            icon={<SwapOutlined />}
            onClick={handleSwapPriceInfo}
          >
            {exchangeRate.toFixed(6)}&nbsp;
            {priceAccount === B.mintAddress ? B.name : A.name} per&nbsp;
            {priceAccount === B.mintAddress ? A.name : B.name}&nbsp;
          </Button>
        </div>
      </div>
      <div className="pool-card-row">
        <Text className="pool-card-cell">
          <Popover
            trigger="hover"
            content={
              <div style={{ width: 300 }}>
                You transaction will revert if there is a large, unfavorable
                price movement before it is confirmed.
              </div>
            }
          >
            Minimum Received <QuestionCircleOutlined />
          </Popover>
        </Text>
        <div className="pool-card-cell " title={amountOut.toString()}>
          {amountOut.toFixed(6)} {B.name}
        </div>
      </div>
      <div className="pool-card-row">
        <Text className="pool-card-cell">
          <Popover
            trigger="hover"
            content={
              <div style={{ width: 300 }}>
                The difference between the market price and estimated price due
                to trade size.
              </div>
            }
          >
            Price Impact <QuestionCircleOutlined />
          </Popover>
        </Text>
        <div
          className="pool-card-cell "
          title={priceImpact.toString()}
          style={{ color: colorWarning(priceImpact) }}
        >
          {priceImpact < 0.01 ? '< 0.01%' : priceImpact.toFixed(3) + '%'}
        </div>
      </div>
      <div className="pool-card-row">
        <Text className="pool-card-cell">
          <Popover
            trigger="hover"
            content={
              <div style={{ width: 300 }}>
                A portion of each trade ({LIQUIDITY_PROVIDER_FEE * 100}%) goes
                to liquidity providers as a protocol incentive.
              </div>
            }
          >
            Liquidity Provider Fee <QuestionCircleOutlined />
          </Popover>
        </Text>
        <div className="pool-card-cell " title={lpFee.toString()}>
          {lpFee} {A.name}
        </div>
      </div>
    </div>
  ) : null;
};

export const TradeView = () => {
  return (
    <>
      <div className={' mt-5'}>
        <div className="exchange-card boardContainer">
          <Card
            className="exchange-card"
            headStyle={{ padding: 0 }}
            bodyStyle={{ position: 'relative' }}
          >
            <ConvertForm />
          </Card>
        </div>
      </div>
      <MigrationModal />
    </>
  );
};
