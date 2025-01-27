import React from 'react';
import FaBalanceInOutChart from '../components/Stripe/FaBalanceInOutChart';
import FaBalanceWidget from '../components/Stripe/FaBalanceWidget';
import FaTransactionsWidget from '../components/Stripe/FaTransactionsWidget';
import {
  getFinancialAccountTransactionsExpanded,
  getFinancialAccountDetails,
  getFinancialAccountTransactionDetails,
} from '../utils/stripe_helpers.js';
import {decode} from '../utils/jwt_encode_decode';
import {parse} from 'cookie';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function getServerSideProps(context) {
  if ('cookie' in context.req.headers) {
    const cookie = parse(context.req.headers.cookie);
    if ('app_auth' in cookie) {
      const session = decode(cookie.app_auth);
      if (session.requiresOnboarding === true) {
        return {
          redirect: {
            destination: '/onboard',
          },
        };
      }
      const StripeAccountID = session.accountId;
      let responseFaDetails = await getFinancialAccountDetails(StripeAccountID);
      const financialAccount = responseFaDetails.financialaccount;
      let responseFaTransations = await getFinancialAccountTransactionsExpanded(
        StripeAccountID,
      );
      const faTransactions = responseFaTransations.fa_transactions;
      let responseFaTransations_chart =
        await getFinancialAccountTransactionDetails(StripeAccountID);
      const faTransactionsChart =
        responseFaTransations_chart.faTransactions_chart;
      return {
        props: {financialAccount, faTransactions, faTransactionsChart}, // will be passed to the page component as props
      };
    }
  }
  return {
    redirect: {
      destination: '/signin',
    },
  };
}

const Dashboard = (props) => {
  return (
    <div>
      <FaBalanceWidget financialAccount={props.financialAccount} />
      <FaBalanceInOutChart faTransactionsChart={props.faTransactionsChart} />
      <FaTransactionsWidget faTransactions={props.faTransactions} />
    </div>
  );
};

export default Dashboard;
