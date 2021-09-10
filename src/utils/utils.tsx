import { useCallback, useEffect, useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { TokenInfo } from '@solana/spl-token-registry';
import { MintInfo } from '@solana/spl-token';
import { PoolInfo, TokenAccount } from './../models';
import axios from 'axios';

export type KnownTokenMap = Map<string, TokenInfo>;

export function isValidPublicKey(key) {
  if (!key) {
    return false;
  }
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

export function isKnownMint(map: KnownTokenMap, mintAddress: string) {
  return !!map.get(mintAddress);
}

export function getPoolName(
  map: KnownTokenMap,
  pool: PoolInfo,
  shorten = true,
) {
  const sorted = pool.pubkeys.holdingMints.map((a) => a.toBase58()).sort();
  return sorted.map((item) => getTokenName(map, item, shorten)).join('/');
}
export function chunks<T>(array: T[], size: number): T[][] {
  return Array.apply<number, T[], T[][]>(
    0,
    new Array(Math.ceil(array.length / size)),
  ).map((_, index) => array.slice(index * size, (index + 1) * size));
}

export function getTokenName(
  map: KnownTokenMap,
  mintAddress: string,
  shorten = true,
  length = 5,
): string {
  const knownSymbol = map.get(mintAddress)?.symbol;
  if (knownSymbol) {
    return knownSymbol;
  }

  return shorten ? `${mintAddress.substring(0, length)}...` : mintAddress;
}
export function getTokenIcon(
  map: KnownTokenMap,
  mintAddress: string,
): string | undefined {
  return map.get(mintAddress)?.logoURI;
}
export const STABLE_COINS = new Set([
  'USDC',
  'wUSDC',
  'USDT',
  'wUSDT',
  'WUSDT',
]);

export const getLeaderData = async (time) => {
  const url = `https://api.atlasdex.finance/leaderboard?time=${time}`;
  const result: any = await axios.get(url);
  return result;
};

export const AddTxnInLeaderboard = async (wallet , amount) => {
  const url = `https://api.atlasdex.finance/leaderboard/add-transaction`;
  const result: any = await axios.post(url, {
    wallet,
    amount
  });
  return result;
};

export const formatPriceNumber = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
});

export function convert(
  account?: TokenAccount | number,
  mint?: MintInfo,
  rate: number = 1.0,
): number {
  if (!account) {
    return 0;
  }

  const amount =
    typeof account === 'number' ? new BN(account) : account.info.amount;

  const precision = new BN(10).pow(new BN(mint?.decimals || 0));

  // avoid overflowing 53 bit numbers on calling toNumber()
  let div = amount.div(precision).toNumber();
  let rem = amount.mod(precision).toNumber() / precision.toNumber();
  let result = (div + rem) * rate;

  return result;
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// shorten the checksummed version of the input address to have 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export const percentFormat = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function floorToDecimal(
  value: number,
  decimals: number | undefined | null,
) {
  return decimals
    ? Math.floor(value * 10 ** decimals) / 10 ** decimals
    : Math.floor(value);
}

export const formatUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const formatNumber = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPct = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatShortDate = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
});

export function roundToDecimal(
  value: number,
  decimals: number | undefined | null,
) {
  return decimals ? Math.round(value * 10 ** decimals) / 10 ** decimals : value;
}

export function getDecimalCount(value): number {
  if (
    !isNaN(value) &&
    Math.floor(value) !== value &&
    value.toString().includes('.')
  )
    return value.toString().split('.')[1].length || 0;
  if (
    !isNaN(value) &&
    Math.floor(value) !== value &&
    value.toString().includes('e')
  )
    return parseInt(value.toString().split('e-')[1] || '0');
  return 0;
}

export function divideBnToNumber(numerator: BN, denominator: BN): number {
  const quotient = numerator.div(denominator).toNumber();
  const rem = numerator.umod(denominator);
  const gcd = rem.gcd(denominator);
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}

export function getTokenMultiplierFromDecimals(decimals: number): BN {
  return new BN(10).pow(new BN(decimals));
}

const localStorageListeners = {};

export function useLocalStorageStringState(
  key: string,
  defaultState: string | null = null,
): [string | null, (newState: string | null) => void] {
  const state = localStorage.getItem(key) || defaultState;

  const [, notify] = useState(key + '\n' + state);

  useEffect(() => {
    if (!localStorageListeners[key]) {
      localStorageListeners[key] = [];
    }
    localStorageListeners[key].push(notify);
    return () => {
      localStorageListeners[key] = localStorageListeners[key].filter(
        (listener) => listener !== notify,
      );
      if (localStorageListeners[key].length === 0) {
        delete localStorageListeners[key];
      }
    };
  }, [key]);

  const setState = useCallback<(newState: string | null) => void>(
    (newState) => {
      const changed = state !== newState;
      if (!changed) {
        return;
      }

      if (newState === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, newState);
      }
      localStorageListeners[key]?.forEach((listener) =>
        listener(key + '\n' + newState),
      );
    },
    [state, key],
  );

  return [state, setState];
}

export function useLocalStorageState<T = any>(
  key: string,
  defaultState: T | null = null,
): [T, (newState: T) => void] {
  let [stringState, setStringState] = useLocalStorageStringState(
    key,
    JSON.stringify(defaultState),
  );
  return [
    useMemo(() => stringState && JSON.parse(stringState), [stringState]),
    (newState) => setStringState(JSON.stringify(newState)),
  ];
}

export function useEffectAfterTimeout(effect, timeout) {
  useEffect(() => {
    const handle = setTimeout(effect, timeout);
    return () => clearTimeout(handle);
  });
}

export function useListener(emitter, eventName) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const listener = () => forceUpdate((i) => i + 1);
    emitter.on(eventName, listener);
    return () => emitter.removeListener(eventName, listener);
  }, [emitter, eventName]);
}

export function abbreviateAddress(address: PublicKey, size = 4) {
  const base58 = address.toBase58();
  return base58.slice(0, size) + '…' + base58.slice(-size);
}

export function isEqual(obj1, obj2, keys) {
  if (!keys && Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  keys = keys || Object.keys(obj1);
  for (const k of keys) {
    if (obj1[k] !== obj2[k]) {
      // shallow comparison
      return false;
    }
  }
  return true;
}

export function flatten(obj, { prefix = '', restrictTo }) {
  let restrict = restrictTo;
  if (restrict) {
    restrict = restrict.filter((k) => obj.hasOwnProperty(k));
  }
  const result = {};
  (function recurse(obj, current, keys) {
    (keys || Object.keys(obj)).forEach((key) => {
      const value = obj[key];
      const newKey = current ? current + '.' + key : key; // joined key with dot
      if (value && typeof value === 'object') {
        // @ts-ignore
        recurse(value, newKey); // nested object
      } else {
        result[newKey] = value;
      }
    });
  })(obj, prefix, restrict);
  return result;
}

// returns a Color from a 4 color array, green to red, depending on the index
// of the closer (up) checkpoint number from the value
export const colorWarning = (value = 0, valueCheckpoints = [1, 3, 5, 100]) => {
  const defaultIndex = 1;
  const colorCodes = ['#27ae60', 'inherit', '#f3841e', '#ff3945'];
  if (value > valueCheckpoints[valueCheckpoints.length - 1]) {
    return colorCodes[defaultIndex];
  }
  const closest = [...valueCheckpoints].sort((a, b) => {
    const first = a - value < 0 ? Number.POSITIVE_INFINITY : a - value;
    const second = b - value < 0 ? Number.POSITIVE_INFINITY : b - value;
    if (first < second) {
      return -1;
    } else if (first > second) {
      return 1;
    }
    return 0;
  })[0];
  const index = valueCheckpoints.indexOf(closest);
  if (index !== -1) {
    return colorCodes[index];
  }
  return colorCodes[defaultIndex];
};
