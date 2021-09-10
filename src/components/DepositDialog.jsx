import React from 'react';
import { Modal } from 'antd';
import {
  useSelectedBaseCurrencyAccount,
  useMarket,
  useSelectedQuoteCurrencyAccount,
} from '../utils/markets';
import { useWallet } from '../utils/wallet';
import Link from './Link';

export default function DepositDialog({ onClose, baseOrQuote }) {
  const { market, baseCurrency, quoteCurrency } = useMarket();

  const { providerName, providerUrl } = useWallet();
  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();
  let coinMint;
  let account;
  let depositCoin;
  if (baseOrQuote === 'base') {
    coinMint = market?.baseMintAddress;
    account = baseCurrencyAccount;
    depositCoin = baseCurrency;
  } else if (baseOrQuote === 'quote') {
    coinMint = market?.quoteMintAddress;
    account = quoteCurrencyAccount;
    depositCoin = quoteCurrency;
  } else {
    account = null;
  }
  if (!coinMint) {
    return null;
  }
  return (
    <Modal
      title={depositCoin}
      visible={!!coinMint}
      onOk={onClose}
      onCancel={onClose}
    >
      <div style={{ paddingTop: '20px', color: 'white' }}>
        <p>Mint address:</p>
        <p>{coinMint.toBase58()}</p>
        <div>
          <p>SPL Deposit address:</p>
          <p>
            {account ? (
              account.pubkey.toBase58()
            ) : (
              <>
                Visit{' '}
                <Link external to={providerUrl}>
                  {providerName}
                </Link>{' '}
                to create an account for this mint
              </>
            )}
          </p>
        </div>
      </div>
    </Modal>
  );
}
