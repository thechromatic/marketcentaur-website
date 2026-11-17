# MarketCentaur Studio

Studio is the consumer (B2C) side of MarketCentaur: done-for-you AI services for individuals and
families, at `/studio` and `/studio/<offer-id>`.

## Pages

`offers.json` holds the nine offers. `scripts/build-studio.mjs` turns it into:

- `studio.html` (hub) and `studio/<offer-id>.html` (one page per offer, each with a brief form)
- the Studio entries in `sitemap.xml` and `llms.txt` (between the `studio:start` / `studio:end` markers)

After editing `offers.json`, run from the repo root:

```
node scripts/build-studio.mjs
python3 scripts/seo/og-images.py   # share images for new pages
node scripts/seo/audit.mjs
```

Never add prices. The script stops with an error if it finds a currency amount or a "% off".

## Quote-then-pay flow

1. A customer sends a brief. `assets/studio.js` adds an order ref (`MCS-YYMMDD-XXXX`) and writes
   every answer into one `message` field.
2. `assets/forms.js` sends it as usual (email to hello@ and the "MarketCentaur website leads"
   scenario, which logs it in *MarketCentaur Leads.xlsx*) and, for Studio forms only, also to the
   Studio webhook (`STUDIO_WEBHOOK_URL`).
3. The Make.com scenario **MarketCentaur Studio quotes** adds the order to the *Orders* sheet of
   *MarketCentaur Studio.xlsx* (adi@marketcentaur.com OneDrive), looks the offer up on the
   *Prices* sheet, and then:
   - sends the quote straight away if *Auto-send quote* is Yes and the price and a payment link
     for the customer's region are filled in (India: INR with Razorpay and UPI; elsewhere: USD
     with Stripe and PayPal; "Other payment" such as bank transfer is added to every quote);
   - otherwise saves the quote as a **draft** in Outlook with `[ADD …]` placeholders to finish
     and send by hand.

Keep the *Offer ID* column in the Prices sheet in step with the `id` values in `offers.json`.
