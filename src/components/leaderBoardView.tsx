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
} from '@ant-design/icons';
import {
  swap,
  usePoolForBasket,
  PoolOperation,
  LIQUIDITY_PROVIDER_FEE,
} from '../utils/pools';
import { notify } from '../utils/notifications';
import { useCurrencyPairState } from '../utils/currencyPair';
import './trade.less';
import { colorWarning, getLeaderData, getTokenName } from '../utils/utils';
import { AdressesPopover } from '../components/pool/address';
import { PoolInfo } from '../models';
import { useEnrichedPools } from '../utils/markets';
import { MigrationModal } from '../components/migration';
import styled from 'styled-components';
import { ConfigProvider, Table } from 'antd';
import { parse } from 'querystring';
import { FaTrophy } from 'react-icons/fa';
import { RiMedalLine } from 'react-icons/ri';
import { ThemeContext } from '../App';
const queryString = require('query-string');

const SwapWrapper = styled.div`
  border: 1px solid gray;
`;

const { Text } = Typography;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export const BoardGrid = () => {
  const { wallet, connect, connected } = useWallet();

  const TimeObj = queryString.parse(window.location.search);
  const time = TimeObj.time;
  console.log('time', TimeObj);

  const connection = useConnection();
  const [pendingTx, setPendingTx] = useState(false);
  const {
    A,
    B,
    setLastTypedAccount,
    setPoolOperation,
  } = useCurrencyPairState();
  const pool = usePoolForBasket([A?.mintAddress, B?.mintAddress]);
  // console.log('pool data here' , pool);t

  const [leaderData, setLeaderData] = useState<any>([]);
  console.log('leaderData', leaderData);

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
      } catch {
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
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  const [loading, setLoading] = useState(false);
  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      render(text: any, record: any) {
        return {
          props: {
            style: {},
          },
          children: (
            <div style={{ display: 'flex' }}>
              {text} {text === 1 && <FaTrophy className={'top'} />}{' '}
              {(text === 2 || text === 3) && <RiMedalLine className={'top'} />}
            </div>
          ),
        };
      },
    },
    {
      title: 'Wallet Address',
      dataIndex: 'wallet_address',
      key: 'wallet_address',
    },
    {
      title: 'Volume',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render(text: string, record: any) {
        return {
          props: {
            style: {},
          },
          children: (
            <div style={{ display: 'flex' }}>
              $ {numberWithCommas(parseFloat(text).toFixed(2))}
            </div>
          ),
        };
      },
    },
  ];
  const [allSelect, setAllSelected] = useState('all');

  function compare(a, b) {
    const amountA = a.total_amount;
    const amountB = b.total_amount;

    let comparison = 0;
    if (amountA < amountB) {
      comparison = 1;
    } else if (amountA > amountB) {
      comparison = -1;
    }
    return comparison;
  }

  useEffect(() => {
    const dataFetching = async () => {
      setLoading(true);
      try {
        const response = await getLeaderData(
          allSelect === '24h' ? allSelect : '',
        );
        if (response.data.response.transactions.length > 0) {
          const sortData = response.data.response.transactions.sort(compare);
          sortData.map((item, index) => {
            item.rank = index + 1;
          });
          setLeaderData(sortData);
        }
      } catch (error) {
        leaderData.length = 0;
        setLeaderData(leaderData);
      }
      setLoading(false);
    };
    dataFetching();
  }, [allSelect]);

    //get theme from context
    const { theme} = React.useContext(ThemeContext);
  return (
    <div>
      <div className={'d-flex'}>
        <div
          className={
            (theme ? 'blueTime-btn' : 'time-btn') +
            ' ' +
            (allSelect === 'all' ? 'select' : '')
          }
          onClick={() => {
            leaderData.length = 0;
            setLeaderData(leaderData);
            setAllSelected('all');
          }}
        >
          All
        </div>
        <div
          className={
            (theme ? 'blueTime-btn' : 'time-btn') +
            ' ' +
            (allSelect === '24h' ? 'select' : '')
          }
          onClick={() => {
            leaderData.length = 0;
            setLeaderData(leaderData);
            setAllSelected('24h');
          }}
        >
          24 Hours
        </div>
      </div>

      {/* <div className={'leader-heading'}>Leader Board</div> */}
      <Table
        dataSource={leaderData}
        columns={columns}
        loading={loading}
        pagination={false}
      />
    </div>
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

export const BoardView = () => {
  return (
    <>
      <div className={' mt-5'}>
        <div className="trade-card boardContainer">
          <Card
            className="trade-card"
            headStyle={{ padding: 0 }}
            bodyStyle={{ position: 'relative' }}
          >
            <BoardGrid />
          </Card>
        </div>
      </div>

      <MigrationModal />
    </>
  );
};
