import React, { useEffect, useMemo, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { PaymentRequestButtonElement } from '@stripe/react-stripe-js';

/**
 * WalletPaymentButton — Renders Apple Pay / Google Pay button when the user's
 * device / browser supports it. Uses Stripe's Payment Request API.
 *
 * Props:
 *   amountCents (number, required) — Amount in the smallest currency unit (cents).
 *   currency (string) — ISO 4217 currency code, default 'eur'.
 *   country (string) — ISO 3166-1 alpha-2 country code, default 'FR'.
 *   label (string) — Line-item label shown in the wallet sheet.
 *   requestPayerName (bool) — default true
 *   requestPayerEmail (bool) — default true
 *   requestPayerPhone (bool) — default true
 *   onPaymentMethod (async fn) — Called with the Stripe PaymentMethod returned by the wallet.
 *       Should return { success: boolean, errorMessage?: string }.
 *       On success, the wallet sheet closes with a checkmark; on failure, an error is shown.
 *
 *   disabled (bool) — hides the button while `true`.
 */
const WalletPaymentButton = ({
  amountCents,
  currency = 'eur',
  country = 'FR',
  label = 'Zont transfer',
  requestPayerName = true,
  requestPayerEmail = true,
  requestPayerPhone = true,
  onPaymentMethod,
  disabled = false,
  testId = 'wallet-pay-btn',
}) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canPay, setCanPay] = useState(false);

  const cents = useMemo(() => {
    const n = Math.round(Number(amountCents) || 0);
    return n > 0 ? n : 0;
  }, [amountCents]);

  useEffect(() => {
    if (!stripe || cents <= 0) {
      setPaymentRequest(null);
      setCanPay(false);
      return undefined;
    }
    const pr = stripe.paymentRequest({
      country,
      currency,
      total: { label, amount: cents },
      requestPayerName,
      requestPayerEmail,
      requestPayerPhone,
    });

    let cancelled = false;
    pr.canMakePayment().then((result) => {
      if (cancelled) return;
      if (result) {
        setPaymentRequest(pr);
        setCanPay(true);
      } else {
        setCanPay(false);
      }
    }).catch(() => setCanPay(false));

    // eslint-disable-next-line consistent-return
    return () => { cancelled = true; };
  }, [stripe, cents, currency, country, label, requestPayerName, requestPayerEmail, requestPayerPhone]);

  useEffect(() => {
    if (!paymentRequest) return undefined;
    const handler = async (ev) => {
      try {
        const result = await onPaymentMethod?.(ev.paymentMethod, ev);
        if (result && result.success) {
          ev.complete('success');
        } else {
          ev.complete('fail');
        }
      } catch (err) {
        ev.complete('fail');
        // Surface caught error via console; parent should show its own toast
        // eslint-disable-next-line no-console
        console.error('Wallet payment handler error:', err);
      }
    };
    paymentRequest.on('paymentmethod', handler);
    return () => { paymentRequest.off('paymentmethod', handler); };
  }, [paymentRequest, onPaymentMethod]);

  if (!canPay || !paymentRequest || disabled) return null;

  return (
    <div className="w-full" data-testid={testId}>
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: 'default',   // 'default' shows brand-specific label (Apple Pay / Google Pay)
              theme: 'dark',
              height: '46px',
            },
          },
        }}
      />
      <div className="my-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex-1 h-px bg-gray-700" />
        <span className="uppercase tracking-wider">or pay by card</span>
        <span className="flex-1 h-px bg-gray-700" />
      </div>
    </div>
  );
};

export default WalletPaymentButton;
