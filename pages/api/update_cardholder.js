import { parse } from "cookie";
import { decode } from "../../utils/jwt_encode_decode";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { app_auth } = parse(req.headers.cookie || "");
    const session = decode(app_auth);
    const StripeAccountId = session.accountId;
    try {
      const ip = req.headers["x-real-ip"] || req.connection.remoteAddress;
      const cardholder = await stripe.issuing.cardholders.update(
        req.body.cardholderId,
        {
          individual: {
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            card_issuing: {
              user_terms_acceptance: {
                date: Date.now(),
                ip: ip,
              },
            },
          },
        },
        {
          stripeAccount: StripeAccountId,
        }
      );
      return res.json({ ok: true });
    } catch (err) {
      return res.status(401).json({
        error: err.message,
      });
    }
  } else {
    res.status(400).json({ error: "Bad Request" });
  }
}
