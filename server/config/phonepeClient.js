/**
 * PhonePe SDK – Singleton StandardCheckoutClient
 *
 * Initialised ONCE on first require() and re-used everywhere.
 * All credentials come from environment variables.
 */

const { StandardCheckoutClient, Env } = require('pg-sdk-node');

const clientId      = process.env.PHONEPE_CLIENT_ID;
const clientSecret  = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = Number(process.env.PHONEPE_CLIENT_VERSION) || 1;
const env           = process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

if (!clientId || !clientSecret) {
  throw new Error(
    '[PhonePe] PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET must be set in environment variables.'
  );
}

const phonepeClient = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env,
  true, // shouldPublishEvents
);

console.log(`[PhonePe] StandardCheckoutClient initialised (${env})`);

module.exports = phonepeClient;
