import { useLocalStorageState } from './utils';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { setCache, useAsyncData } from './fetch-loop';
import tuple from 'immutable-tuple';
import { ConnectionContextValues, EndpointInfo } from './types';
import {
  Account,
  clusterApiUrl,
  AccountInfo,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { notify } from './notifications';
import { ExplorerLink } from '../components/explorerLink';
import {
  TokenListProvider,
  ENV as ChainID,
  TokenInfo,
} from '@solana/spl-token-registry';
import { cache, getMultipleAccounts } from "./accounts";
import { setProgramIds } from "./ids";

export const ENDPOINTS: EndpointInfo[] = [
  {
    name: 'mainnet-beta',
    endpoint: 'https://solana-api.projectserum.com',
    custom: false,
    chainID: 101,
  },
  {
    name: 'localnet',
    endpoint: 'http://127.0.0.1:8899',
    custom: false,
    chainID: 103,
  },
];

const DEFAULT_SLIPPAGE = 0.25;
const DEFAULT = ENDPOINTS[0].endpoint;


const accountListenerCount = new Map();

const ConnectionContext = React.createContext<ConnectionContextValues>({
  endpoint: DEFAULT,
  setEndpoint: () => {},
  slippage: DEFAULT_SLIPPAGE,
  setSlippage: (val: number) => {},
  connection: new Connection(DEFAULT, "recent"),
  sendConnection: new Connection(DEFAULT, "recent"),
  availableEndpoints: ENDPOINTS,
  setCustomEndpoints: (newCustomEndpoints: EndpointInfo[]) => {},
  tokens: [],
  tokenMap: new Map<string, TokenInfo>(),
});

// const ConnectionContext: React.Context<null | ConnectionContextValues> =
//   React.createContext<null | ConnectionContextValues>(null);

export function ConnectionProvider({ children }) {
  const [endpoint, setEndpoint] = useLocalStorageState<string>(
    'connectionEndpts',
    ENDPOINTS[0].endpoint,
  );
  const [customEndpoints, setCustomEndpoints] = useLocalStorageState<
    EndpointInfo[]
  >('customConnectionEndpoints', []);
  const availableEndpoints = ENDPOINTS.concat(customEndpoints);

  const connection = useMemo(
    () => new Connection(endpoint, 'recent'),
    [endpoint],
  );
  const [slippage, setSlippage] = useLocalStorageState(
    "slippage",
    DEFAULT_SLIPPAGE.toString()
  );
  const sendConnection = useMemo(
    () => new Connection(endpoint, 'recent'),
    [endpoint],
  );
  const chain =
    ENDPOINTS.find((end) => end.endpoint === endpoint) || ENDPOINTS[0];

  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

  useEffect(() => {
    (async () => {
      const res = await new TokenListProvider().resolve();
      const list = res
        .filterByChainId(chain.chainID)
        .excludeByTag('nft')
        .getList();
      const knownMints = list.reduce((map, item) => {
        map.set(item.address, item);
        return map;
      }, new Map<string, TokenInfo>());

      const accounts = await getMultipleAccounts(
        connection,
        [...knownMints.keys()],
        'single',
      );
      accounts.keys.forEach((key, index) => {
        const account = accounts.array[index];
        if (!account) {
          knownMints.delete(accounts.keys[index]);
          return;
        }

        try {
          cache.addMint(new PublicKey(key), account);
        } catch {
          // ignore
        }
      });

      setTokenMap(knownMints);
      setTokens([...knownMints.values()]);
    })();
  }, [chain, connection]);

  // The websocket library solana/web3.js uses closes its websocket connection when the subscription list
  // is empty after opening its first time, preventing subsequent subscriptions from receiving responses.
  // This is a hack to prevent the list from every getting empty
  useEffect(() => {
    const id = connection.onAccountChange(new Account().publicKey, () => {});
    return () => {
      connection.removeAccountChangeListener(id);
    };
  }, [connection]);

  useEffect(() => {
    const id = connection.onSlotChange(() => null);
    return () => {
      connection.removeSlotChangeListener(id);
    };
  }, [connection]);

  useEffect(() => {
    const id = sendConnection.onAccountChange(
      new Account().publicKey,
      () => {},
    );
    return () => {
      sendConnection.removeAccountChangeListener(id);
    };
  }, [sendConnection]);

  useEffect(() => {
    const id = sendConnection.onSlotChange(() => null);
    return () => {
      sendConnection.removeSlotChangeListener(id);
    };
  }, [sendConnection]);
  const env = chain.name;

  setProgramIds(env);


  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        setEndpoint,
        slippage: parseFloat(slippage),
        setSlippage: (val) => setSlippage(val.toString()),
        connection,
        sendConnection,
        availableEndpoints,
        setCustomEndpoints,
        tokens,
        tokenMap,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useSlippageConfig() {
  const { slippage, setSlippage } = useContext(ConnectionContext);
  return { slippage, setSlippage };
}


export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('Missing connection context');
  }
  return context.connection;
}

export function useSendConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('Missing connection context');
  }
  return context.sendConnection;
}


export function useConnectionConfig() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('Missing connection context');
  }
  return {
    endpoint: context.endpoint,
    endpointInfo: context.availableEndpoints.find(
      (info) => info.endpoint === context.endpoint,
    ),
    setEndpoint: context.setEndpoint,
    slippage: DEFAULT_SLIPPAGE,
    setSlippage: (val: number) => {},
    availableEndpoints: context.availableEndpoints,
    setCustomEndpoints: context.setCustomEndpoints,
    tokenMap: context.tokenMap,
    tokens: context.tokens,
  };
}

export function useAccountInfo(
  publicKey: PublicKey | undefined | null,
): [AccountInfo<Buffer> | null | undefined, boolean] {
  const connection = useConnection();
  const cacheKey = tuple(connection, publicKey?.toBase58());
  const [accountInfo, loaded] = useAsyncData<AccountInfo<Buffer> | null>(
    async () => (publicKey ? connection.getAccountInfo(publicKey) : null),
    cacheKey,
    { refreshInterval: 60_000 },
  );
  useEffect(() => {
    if (!publicKey) {
      return;
    }
    if (accountListenerCount.has(cacheKey)) {
      let currentItem = accountListenerCount.get(cacheKey);
      ++currentItem.count;
    } else {
      let previousInfo: AccountInfo<Buffer> | null = null;
      const subscriptionId = connection.onAccountChange(publicKey, (info) => {
        if (
          !previousInfo ||
          !previousInfo.data.equals(info.data) ||
          previousInfo.lamports !== info.lamports
        ) {
          previousInfo = info;
          setCache(cacheKey, info);
        }
      });
      accountListenerCount.set(cacheKey, { count: 1, subscriptionId });
    }
    return () => {
      let currentItem = accountListenerCount.get(cacheKey);
      let nextCount = currentItem.count - 1;
      if (nextCount <= 0) {
        connection.removeAccountChangeListener(currentItem.subscriptionId);
        accountListenerCount.delete(cacheKey);
      } else {
        --currentItem.count;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);
  const previousInfoRef = useRef<AccountInfo<Buffer> | null | undefined>(null);
  if (
    !accountInfo ||
    !previousInfoRef.current ||
    !previousInfoRef.current.data.equals(accountInfo.data) ||
    previousInfoRef.current.lamports !== accountInfo.lamports
  ) {
    previousInfoRef.current = accountInfo;
  }
  return [previousInfoRef.current, loaded];
}

export function useAccountData(publicKey) {
  const [accountInfo] = useAccountInfo(publicKey);
  return accountInfo && accountInfo.data;
}

const getErrorForTransaction = async (connection: Connection, txid: string) => {
  // wait for all confirmation before geting transaction
  await connection.confirmTransaction(txid, 'max');

  const tx = await connection.getParsedConfirmedTransaction(txid);

  const errors: string[] = [];
  if (tx?.meta && tx.meta.logMessages) {
    tx.meta.logMessages.forEach((log) => {
      const regex = /Error: (.*)/gm;
      let m;
      while ((m = regex.exec(log)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        if (m.length > 1) {
          errors.push(m[1]);
        }
      }
    });
  }

  return errors;
};

export const sendTransaction = async (
  connection: Connection,
  wallet: any,
  instructions: TransactionInstruction[],
  signers: Account[],
  awaitConfirmation = true,
) => {
  let transaction = new Transaction();
  instructions.forEach((instruction) => transaction.add(instruction));
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash;
  transaction.setSigners(
    // fee payied by the wallet owner
    wallet.publicKey,
    ...signers.map((s) => s.publicKey),
  );
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  transaction = await wallet.signTransaction(transaction);
  const rawTransaction = transaction.serialize();
  let options = {
    skipPreflight: true,
    commitment: 'singleGossip',
  };
  
   
  const txid = await connection.sendRawTransaction(rawTransaction, options);

  console.log('txn id before ' , txid);
  
  if (awaitConfirmation) {
    try {
      const status = (
        await connection.confirmTransaction(
          txid,
          options && (options.commitment as any),
        )
      ).value;
    } catch (error) {
      console.log('Error in catch ' , error);
      
    }


    // const detail = await connection.getConfirmedTransaction(txid)
    // console.log('detail', detail);
    console.log("Before await confirmation")

    // if (status?.err) {
    //   console.log("status" , status)

    //   const errors = await getErrorForTransaction(connection, txid);
    //   notify({
    //     message: 'Transaction failed...',
    //     description: (
    //       <>
    //         {errors.map((err) => (
    //           <div>{err}</div>
    //         ))}
    //         <ExplorerLink address={txid} type="transaction" />
    //       </>
    //     ),
    //     type: 'error',
    //   });

    //   throw new Error(
    //     `Raw transaction ${txid} failed (${JSON.stringify(status)})`,
    //   );
    // }
  }

  console.log("After await confirmation")

  return txid;
};
