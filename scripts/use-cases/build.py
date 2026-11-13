#!/usr/bin/env python3
"""Builds /use-cases.html and one page per use case under /use-cases/.

Edit the USE_CASES list below, then run from the repo root:
    python3 scripts/use-cases/build.py
    node scripts/nav/apply-nav.mjs
    python3 scripts/seo/og-images.py
New pages also need a sitemap.xml entry (this script adds missing ones) and an llms.txt line.

Rules: no prices, no individual names, no outcome guarantees or invented statistics.
"""
import html, json, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SITE = 'https://marketcentaur.com'
TODAY = '2026-11-12'
GROUPS = {'local': 'Local &amp; consumer', 'b2b': 'B2B &amp; industrial', 'pro': 'Professional &amp; public'}

SERVICES = {
    'ai-front-desk': 'AI Front Desk', 'ai-search-visibility': 'AI Search Visibility', 'ai-content-studio': 'AI Content &amp; Video Studio',
    'ai-localization': 'AI Localization', 'ai-training': 'AI Training &amp; Workshops', 'ai-automation': 'AI &amp; Workflow Automation',
    'small-business-local-growth': 'Local, Retail &amp; Ecommerce Growth', 'weekly-growth-signal-watch': 'Weekly Growth Signal Watch',
    'account-persona-mapping': 'Account &amp; Persona Mapping', 'market-competitor-intelligence': 'Market &amp; Competitor Intelligence',
    'partner-channel-discovery': 'Partner &amp; Channel Discovery', 'business-intelligence': 'Business Intelligence',
}
SPRINTS = {'conversion-sprint': 'Website Conversion Sprint', 'account-sprint': 'B2B Account Intelligence Sprint', 'automation-sprint': 'AI Workflow Automation Sprint'}
SAMPLES = {
    'conversion': ('/samples/website-conversion-sprint', 'Website Conversion Sprint sample'),
    'account': ('/samples/b2b-account-intelligence-sprint', 'B2B Account Intelligence sample'),
    'automation': ('/samples/ai-workflow-automation-sprint', 'AI Workflow Automation sample'),
    'brief': ('/sample-intelligence-brief', 'Market intelligence brief sample'),
}
INDUSTRIES = {
    'healthcare-wellness': 'Clinics &amp; wellness', 'trades-field-services': 'Trades &amp; field services', 'multi-location-businesses': 'Multi-location businesses',
    'ecommerce': 'Ecommerce', 'hospitality-tourism': 'Hospitality &amp; tourism', 'education-training': 'Education &amp; training',
    'construction-engineering-architecture': 'Construction &amp; engineering', 'manufacturing-distribution': 'Manufacturing &amp; export',
    'logistics-supply-chain': 'Logistics &amp; supply chain', 'telecom-infrastructure': 'Telecom &amp; infrastructure', 'saas-technology': 'SaaS &amp; IT',
    'professional-services': 'Professional services', 'legal-services': 'Legal services', 'financial-services': 'Accounting &amp; financial',
    'nonprofits': 'Nonprofits', 'media-entertainment': 'Media &amp; entertainment', 'government-public-sector': 'Government &amp; public sector',
}

# slug, group, card title, H1, lead, short answer (40-60 words), problems, steps, deliverables, service, sprint, sample, industry, faq
USE_CASES = [
 dict(slug='ai-receptionist-for-clinics', group='local', title='AI receptionist for clinics',
  h1='An AI receptionist that books clinic appointments after hours',
  lead='For clinics and wellness practices that miss calls and messages when the front desk is busy or closed.',
  short='An AI receptionist answers calls, WhatsApp and website chat, books routine appointments into your existing calendar and passes anything clinical, sensitive or urgent to your staff. We set it up on your services, opening hours and booking rules, review conversations every month and keep improving it. It does not give medical advice.',
  problems=['Calls go unanswered during consultations and after hours, and many callers book elsewhere.', 'Reception time goes on the same questions: prices, parking, availability and preparation.', 'Messages arrive across phone, WhatsApp and the website, and some are never followed up.'],
  steps=[('Map the questions', 'We list the routine questions and bookings the front desk handles each week, and the ones that must always go to a person.'), ('Set the rules', 'Booking rules, opening hours, services and escalation paths are agreed with you and written down.'), ('Launch on your channels', 'The receptionist goes live on phone, WhatsApp or chat, connected to the calendar you already use.'), ('Review monthly', 'We read a sample of conversations each month, fix gaps and report what changed.')],
  gets=['An AI receptionist trained on your services and booking rules', 'Clear handoff to staff for clinical, urgent or sensitive questions', 'A monthly review of conversations, with fixes applied'],
  service='ai-front-desk', sprint='conversion-sprint', sample='conversion', industry='healthcare-wellness',
  faq=[('Will it give medical advice?', 'No. It handles routine questions and bookings. Anything clinical, urgent or sensitive is passed to your staff, and patients are told they are speaking with an automated assistant.'), ('Does it work with our booking system?', 'It works with most online calendars and booking tools. We confirm the connection for your system during scoping, before anything is quoted.'), ('How is patient data handled?', 'Data handling is agreed with you before launch: what the assistant can see, where conversations are stored and who can review them. It only receives what each task needs.')]),
 dict(slug='missed-calls-trades', group='local', title='Missed calls for trades businesses',
  h1='Booking more jobs from the calls trades businesses miss',
  lead='For plumbers, electricians, heating engineers and other field-service firms whose teams are on site when the phone rings.',
  short='When engineers are on a job, calls go to voicemail and many callers try the next company. An AI front desk answers calls and messages, takes the job details and postcode, offers available slots and logs each lead for your office. Emergencies go straight to a person. We set it up on your services, areas and booking rules.',
  problems=['Engineers can not answer the phone while working, and voicemails are often not returned the same day.', 'Website forms ask for too much, so mobile visitors give up before sending.', 'Leads arrive by phone, text and email with no single list of who is waiting.'],
  steps=[('Review the journey', 'We check how a customer reaches you today, from search result to call or form.'), ('Set up the front desk', 'An AI front desk answers calls and messages with your services, areas and call-out rules.'), ('Shorten the form', 'We cut the website form to the details your office actually uses.'), ('Log every lead', 'Each enquiry lands in one list or CRM, with emergencies flagged for a call back.')],
  gets=['Calls and messages answered while the team is on site', 'A shorter, mobile-friendly booking form', 'One list of every enquiry, with emergencies flagged'],
  service='ai-front-desk', sprint='conversion-sprint', sample='conversion', industry='trades-field-services',
  faq=[('What happens with emergency calls?', 'You decide what counts as an emergency. Those calls are passed to a person straight away, by transfer or an immediate alert, depending on your setup.'), ('Do customers know it is automated?', 'Yes. The assistant introduces itself as an automated assistant and offers a call back from the team when a caller prefers it.'), ('Can we see a sample of the website review?', 'Yes. The Website Conversion Sprint sample uses a fictional home-services company and shows the scorecard, fixes and rewritten copy.')]),
 dict(slug='local-visibility-multi-location', group='local', title='Local visibility across many locations',
  h1='Consistent local search and AI visibility for multi-location businesses',
  lead='For chains, franchises and groups whose locations show different details in search, maps and AI answers.',
  short='Customers find each location through maps, search and AI assistants, and they all read the same public facts. We audit every location for consistent names, hours, services and reviews, fix the gaps, give each location a page that answers local questions, and check how assistants describe you. Updates then follow one agreed process.',
  problems=['Opening hours, phone numbers and services differ between listings, the website and AI answers.', 'Location pages are thin copies of each other, so they rarely appear for local searches.', 'Reviews are answered at some locations and ignored at others.'],
  steps=[('Audit every location', 'We compare listings, location pages and AI answers for each site, and score the gaps.'), ('Fix the facts', 'Names, hours, services and contact details are made consistent everywhere they appear.'), ('Improve location pages', 'Each location gets a page that answers the questions local customers ask.'), ('Set an update routine', 'One process for holiday hours, closures and new services, so details stay in step.')],
  gets=['A location-by-location visibility scorecard', 'Consistent details across listings, website and AI answers', 'A simple routine for keeping every location up to date'],
  service='small-business-local-growth', sprint='conversion-sprint', sample='conversion', industry='multi-location-businesses',
  faq=[('Can you guarantee map or AI rankings?', 'No one can. We fix the factors you control, such as accurate details, useful location pages and review responses, and measure where you stand over time.'), ('How many locations can you cover?', 'Scope is set by the number of locations and listings. It is agreed in writing after the scoping call.'), ('Who keeps the details updated afterwards?', 'Your team, using the update routine we set up, or us through ongoing support if you prefer.')]),
 dict(slug='ai-shopping-visibility-ecommerce', group='local', title='AI shopping visibility for online stores',
  h1='Getting products recommended when shoppers ask AI assistants',
  lead='For online stores that want to appear when shoppers ask ChatGPT, Gemini or Perplexity what to buy.',
  short='Shoppers increasingly ask AI assistants for product recommendations before visiting a store. We test the questions your customers ask, record which products and competitors are recommended and why, then improve the product information, reviews and pages that assistants rely on. You get a ranked fix list and a measured baseline to track.',
  problems=['Product pages lack the specific facts assistants quote, such as sizes, materials, use cases and comparisons.', 'Reviews and ratings are not visible in a form assistants can read.', 'Nobody knows which questions trigger competitor recommendations instead.'],
  steps=[('Build the question set', 'We list the questions shoppers ask in your category, by product line.'), ('Test the assistants', 'Each question is tested across major AI assistants, recording who is named and the sources cited.'), ('Fix product information', 'We rank fixes to product pages, structured data and reviews by expected impact.'), ('Re-test', 'The same questions are re-run later so you can see what changed.')],
  gets=['A baseline of AI recommendations for your category', 'A ranked fix list for product pages and data', 'A re-test against the same questions'],
  service='ai-search-visibility', sprint='conversion-sprint', sample='conversion', industry='ecommerce',
  faq=[('Is this the same as SEO?', 'It overlaps. Good product information helps both, but AI assistants also weigh reviews, comparisons and how clearly a page answers a specific question.'), ('Can you guarantee our products will be recommended?', 'No. AI answers change over time. We show where you stand, fix what is in your control and measure progress against the same questions.'), ('Do you change our store directly?', 'We can implement agreed fixes or hand them to your team or developer as a ranked list with rewritten copy.'), ('Can you set up our business profile and product feed in ChatGPT?', 'Yes, where you are eligible. OpenAI began letting businesses claim profiles and add product feeds in November 2026, with business agents first offered to eligible US stores. We check what assistants say about you first, then set up the profile and feed and re-test. See <a class="textlink" href="/insights/chatgpt-business-profiles-what-to-check">what to check first</a>.')]),
 dict(slug='direct-bookings-hotels', group='local', title='More direct bookings for hotels',
  h1='More direct bookings for hotels and guesthouses',
  lead='For independent hotels and guesthouses that rely heavily on booking platforms and want more guests to book direct.',
  short='Many guests find a hotel on a booking platform, then check its own website before deciding. We review that website journey on mobile, from first visit to completed booking, fix what slows guests down, make sure key facts are clear in every language you serve, and check how AI assistants describe your property.',
  problems=['The booking button and room prices are hard to find on mobile.', 'Guests from abroad meet pages that are only partly translated.', 'Questions about parking, check-in and accessibility go to email instead of being answered on the page.'],
  steps=[('Review the booking journey', 'We test the journey on mobile, from landing page to confirmed booking.'), ('Rank the fixes', 'Fixes are ranked by impact and effort, with rewritten copy for key pages.'), ('Localize key pages', 'Room, location and policy pages are adapted for your main guest languages, with human review.'), ('Check AI answers', 'We test how assistants describe your property and correct the facts they rely on.')],
  gets=['A ranked fix list for the direct-booking journey', 'Key pages in your guests\' main languages', 'A check of how AI assistants describe your property'],
  service='ai-localization', sprint='conversion-sprint', sample='conversion', industry='hospitality-tourism',
  faq=[('Will this replace booking platforms?', 'No. Platforms remain useful for reach. The aim is that guests who visit your own site find it easy to book there.'), ('Which languages can you cover?', 'Most major languages. We agree a glossary of your property\'s terms, and a reviewer checks tone and accuracy.'), ('Do you work with our booking engine?', 'We review the journey through your existing booking engine and recommend changes it supports. Replacing it is not part of this work.')]),
 dict(slug='enquiries-to-enrolments-training', group='local', title='Course enquiries to enrolments',
  h1='Turning course enquiries into enrolments for training providers',
  lead='For training providers, academies and colleges whose enquiries arrive faster than the team can answer them.',
  short='Prospective students ask the same questions about dates, fees, entry requirements and formats, often outside office hours. An AI assistant answers those from your approved course information, collects details and books calls with your advisers. We also review the course pages, so the next step is clear before anyone needs to ask.',
  problems=['Enquiries peak in the evenings and at weekends, when no adviser is available.', 'Course pages bury dates, formats and entry requirements.', 'Follow-up depends on whoever picks up the inbox that day.'],
  steps=[('Collect the answers', 'We gather approved answers on dates, formats, requirements and policies.'), ('Set up the assistant', 'It answers routine questions on chat or WhatsApp and books calls with advisers.'), ('Improve course pages', 'Key facts move to the top of each course page, with one clear next step.'), ('Review monthly', 'We read a sample of conversations and fill gaps in the answers.')],
  gets=['Routine course questions answered at any hour', 'Calls booked with advisers, with enquiry details attached', 'Clearer course pages with one next step'],
  service='ai-front-desk', sprint='conversion-sprint', sample='conversion', industry='education-training',
  faq=[('Can it answer questions about fees?', 'It can share the fee information you publish and approve. Questions about individual circumstances, such as funding or discounts, go to an adviser.'), ('Will students know it is automated?', 'Yes. It introduces itself as an automated assistant and offers to book a call with a person.'), ('Can it work in more than one language?', 'Yes, if your approved answers are available in those languages. We can help translate them with human review.')]),

 dict(slug='tender-monitoring-engineering', group='b2b', title='Tender monitoring for engineering firms',
  h1='Tender and project monitoring for engineering and construction firms',
  lead='For engineering, construction and architecture firms that find out about relevant projects too late to prepare a strong bid.',
  short='Relevant projects show up first in tender portals, planning notices, funding announcements and client news. We agree a watchlist of regions, sectors and clients, monitor those sources, and send a short weekly digest of new opportunities and early signals. A person checks each item for fit and adds context and a suggested next step.',
  problems=['Tender alerts are noisy, and the relevant ones arrive with little time left to respond.', 'Early signals, such as planning approvals or funding awards, are spread across many sources.', 'Bid teams spend hours searching instead of preparing.'],
  steps=[('Agree the watchlist', 'Regions, sectors, project types, values and target clients that matter to you.'), ('Monitor the sources', 'Tender portals, planning notices, funding announcements and client news are checked continuously.'), ('Filter and review', 'A person removes poor-fit items and adds context to each relevant one.'), ('Send the digest', 'A short weekly digest with deadlines, fit notes and suggested next steps.')],
  gets=['A weekly digest of relevant tenders and early project signals', 'Fit notes and deadlines for every item', 'A watchlist you can change as priorities shift'],
  service='weekly-growth-signal-watch', sprint='account-sprint', sample='brief', industry='construction-engineering-architecture',
  faq=[('Which tender sources do you cover?', 'The public portals and sources relevant to your regions and sectors, agreed in your scope. We list them in writing so you know what is and is not covered.'), ('Do you write the bids?', 'No. We find and qualify opportunities. Your team decides what to bid and prepares the response.'), ('How quickly will we hear about new tenders?', 'In the weekly digest by default. Urgent items with short deadlines can be flagged sooner if that is agreed in scope.')]),
 dict(slug='export-buyer-research-manufacturers', group='b2b', title='Overseas buyer research for exporters',
  h1='Finding the right overseas buyers for manufacturers and exporters',
  lead='For manufacturers entering a new export market who need to know which companies to approach and who decides.',
  short='Entering a new market starts with a short, well-researched target list. We agree your ideal buyer with you, research and rank companies in the target market by fit and timing signals, map the roles involved in buying, and suggest how to open each conversation. Every account is checked by a person and its sources are recorded.',
  problems=['Trade directories are long, out of date and show little about fit.', 'It is unclear who decides on suppliers at each target company.', 'Generic outreach to a new market gets few replies.'],
  steps=[('Agree the ideal buyer', 'Company type, size, products and regions, based on your best current customers.'), ('Research and rank', 'Target companies are researched from public sources and ranked by fit and timing signals.'), ('Map buying roles', 'We identify the roles likely to evaluate, approve and use your products.'), ('Suggest angles', 'An opening angle for each segment, based on what those buyers care about.')],
  gets=['A ranked list of target companies with sources', 'A buying-role map for priority accounts', 'Outreach angles for each segment'],
  service='account-persona-mapping', sprint='account-sprint', sample='account', industry='manufacturing-distribution',
  faq=[('Do you provide contact details?', 'We identify roles and, where publicly available, the people in them. Contact data handling follows the privacy rules that apply in your target market.'), ('Can you cover markets outside Europe and North America?', 'Yes, where reliable public sources exist. Coverage is confirmed during scoping for each market.'), ('Do you do the outreach?', 'Your team does. We provide the list, the role map and the angles, so each conversation starts with you.'), ('We rely on one export market. Can you help us move into another?', 'Yes. The <a class="textlink" href="/practices/#export-pivot-pack">Export Pivot Pack</a> combines a market entry brief, a ranked buyer list, localized content and ready answers to buyer data requests, quoted as one engagement. See also <a class="textlink" href="/use-cases/export-pivot-to-europe">moving export sales towards Europe</a>.')]),
 dict(slug='quote-automation-manufacturers', group='b2b', title='Faster quotes for manufacturers',
  h1='Faster quote turnaround for manufacturers, with estimators in control',
  lead='For manufacturers whose quote requests are re-typed between email, spreadsheets and the ERP.',
  short='Most quote time goes on moving data, not pricing. We map how requests travel from email to the ERP today, rank what can be automated by hours saved, cost and risk, and design a pilot using tools you already own. Estimators still price and approve every quote before it is sent.',
  problems=['Request details are re-typed into a spreadsheet, then again into the ERP.', 'Missing drawings or quantities stall requests for days.', 'Quote totals and ERP records sometimes differ.'],
  steps=[('Map the process', 'We interview the people who handle quotes and map each step, with time and error points.'), ('Rank the opportunities', 'Automation options are ranked by hours saved, cost to build and risk.'), ('Design the pilot', 'A pilot for the top opportunity, with human approval steps and a clear exit.'), ('Document it', 'SOPs and an AI-use register entry, so the team knows what runs where.')],
  gets=['A workflow map with time and error points', 'A ranked automation shortlist', 'A pilot design with human approval built in'],
  service='ai-automation', sprint='automation-sprint', sample='automation', industry='manufacturing-distribution',
  faq=[('Will AI set our prices?', 'Not in this work. Pricing stays with your estimators. Automation handles capture, chasing missing information and data entry.'), ('Do we need a new ERP?', 'No. Pilots use the tools you already have, such as email, spreadsheets and your ERP\'s import function.'), ('Is the pilot build included?', 'The sprint designs the pilot. Building it is quoted separately once you have seen the design.')]),
 dict(slug='competitor-tracking-logistics', group='b2b', title='Competitor monitoring for logistics firms',
  h1='Tracking competitor moves and new lanes for logistics companies',
  lead='For freight forwarders, 3PLs and carriers that learn about competitor moves from customers.',
  short='Competitors announce new lanes, warehouses, partnerships and pricing changes in public long before customers mention them. We agree which competitors and topics matter, monitor public sources, and send a regular brief of what changed, what it likely means for you and what to do next. Observations and interpretation are always labelled separately.',
  problems=['Competitor moves are discovered late, often from a customer.', 'Nobody owns tracking competitors, so it happens in bursts before big pitches.', 'Market news is easy to find but hard to turn into decisions.'],
  steps=[('Agree the watchlist', 'Competitors, lanes, regions and topics that affect your business.'), ('Monitor public sources', 'Company announcements, job listings, filings, pricing pages and trade coverage.'), ('Review and interpret', 'A person checks each item and notes what it likely means for you.'), ('Brief your team', 'A regular brief with recommended actions, plus a deeper brief when needed.')],
  gets=['A regular brief on competitor and market moves', 'Each item sourced and dated', 'Recommended actions, labelled as recommendations'],
  service='market-competitor-intelligence', sprint='account-sprint', sample='brief', industry='logistics-supply-chain',
  faq=[('Is this legal and ethical?', 'Yes. We use public, verifiable sources only and never seek confidential information.'), ('How is this different from a news alert?', 'Alerts deliver everything. We filter for relevance, check facts, and say what an item likely means for you.'), ('Can we get a one-off deep dive?', 'Yes. A market and competitor brief can be scoped as a single project, with ongoing monitoring afterwards if useful.')]),
 dict(slug='telecom-infrastructure-signals', group='b2b', title='Deal signals for telecom infrastructure',
  h1='Tracking operator, tower and fibre deals for telecom infrastructure suppliers',
  lead='For suppliers, contractors and consultancies serving mobile operators, tower companies and fibre builders.',
  short='Work in telecom infrastructure follows operator and tower-company decisions: spectrum awards, rollout plans, asset sales and new partnerships. We monitor those signals across the operators and regions you serve, and send a short weekly digest of what changed and which accounts it affects. A person reviews every item before it reaches you.',
  problems=['Rollout and investment news is scattered across regulators, operators and trade press.', 'Opportunities appear when budgets are set, which is often before tenders are published.', 'Account teams track signals inconsistently.'],
  steps=[('Agree the watchlist', 'Operators, tower companies, regions and topics such as spectrum, rollouts and deals.'), ('Monitor the sources', 'Regulator notices, operator announcements, deal coverage and job listings.'), ('Review for relevance', 'A person checks each signal and links it to the accounts it affects.'), ('Send the digest', 'A weekly digest with suggested follow-ups for your account teams.')],
  gets=['A weekly digest of operator and infrastructure signals', 'Each signal linked to affected accounts', 'Suggested follow-ups for account teams'],
  service='weekly-growth-signal-watch', sprint='account-sprint', sample='brief', industry='telecom-infrastructure',
  faq=[('Which regions can you cover?', 'Coverage is agreed in scope, based on where you sell and where reliable public sources exist.'), ('Can this feed our CRM?', 'The digest arrives by email with a shared tracker. We can suggest how to log signals against accounts in your CRM.'), ('Do you also research new target accounts?', 'Yes. The B2B Account Intelligence Sprint builds a ranked account list, which the weekly watch can then monitor.')]),
 dict(slug='partner-discovery-saas', group='b2b', title='Channel and integration partners for SaaS',
  h1='Finding channel and integration partners for SaaS companies',
  lead='For SaaS companies that want growth through resellers, agencies or integrations, not just direct sales.',
  short='Good partners already serve your ideal customers without competing with you. We agree partner-fit criteria with you, research agencies, resellers, consultancies and technology companies that match, rank them by fit, and suggest a relationship angle and first approach for each. Your team then starts the conversations.',
  problems=['Partner programmes launch with a page but no list of who to approach.', 'Inbound partner requests vary in quality, with no way to compare them.', 'It is unclear which partner types fit the product best.'],
  steps=[('Define fit', 'The customers you share, the role a partner could play and the regions in scope.'), ('Research candidates', 'Agencies, resellers, consultancies and integration partners, from public sources.'), ('Rank and suggest angles', 'Each candidate is ranked by fit, with a suggested relationship type.'), ('Plan first approaches', 'We walk through the shortlist and agree which conversations to test first.')],
  gets=['A ranked shortlist of partner candidates', 'A suggested relationship angle for each', 'Agreed first conversations to test'],
  service='partner-channel-discovery', sprint='account-sprint', sample='account', industry='saas-technology',
  faq=[('Do you build the partner programme?', 'We find and qualify partners. Programme terms and commercial structure stay with your team.'), ('Can you find integration partners specifically?', 'Yes. Technology partners whose products your customers already use are one of the partner types we research.'), ('Do you contact the partners?', 'No. Your team makes the introductions, so each relationship starts with you.')]),

 dict(slug='export-pivot-to-europe', group='b2b', title='Moving export sales towards Europe',
  h1='Moving export sales towards Europe when one market gets harder',
  lead='For manufacturers and exporters, such as textile and engineering firms, that depend on one export market and want buyers in Europe.',
  short='When tariffs or demand shift in one market, the fix is a short, well-researched route into another. We size the opportunity in your target European markets, build a ranked buyer list with buying roles, adapt key content into buyers\' languages, and prepare answers to the sustainability and traceability questions European buyers now send suppliers.',
  problems=['Most export revenue depends on one market, so a tariff or demand change hits hard.', 'European buyers are hard to identify and qualify from trade directories alone.', 'Buyer questionnaires on sustainability, carbon and traceability arrive with no ready answers.'],
  steps=[('Size the market', 'A market entry brief on demand, competitors, routes to market and rules for your products.'), ('Rank the buyers', 'Target companies researched and ranked by fit, with the roles involved in buying.'), ('Localize key content', 'Catalogue, product and company pages adapted into buyers\' languages, with human review.'), ('Prepare data answers', 'An answer library and evidence for the data requests European buyers send suppliers.')],
  gets=['A decision-ready brief on your target markets', 'A ranked buyer list with buying roles and sources', 'Localized key content and ready answers to buyer data requests'],
  service='account-persona-mapping', sprint='account-sprint', sample='account', industry='manufacturing-distribution',
  start=('/practices/#export-pivot-pack', 'Export Pivot Pack'),
  faq=[('Which European markets can you cover?', 'Most EU countries and the UK, where reliable public sources exist. Coverage is confirmed for each market during scoping.'), ('Do you verify our carbon or traceability data?', 'No. We organise your answers and evidence and show where data is missing. Verification, where a buyer or regulation requires it, is done by an accredited third party.'), ('Do you contact the buyers for us?', 'No. Your team makes the approaches. We provide the list, the buying roles, the angles and the localized material.')]),
 dict(slug='e-invoicing-deadlines-finance-teams', group='b2b', title='E-invoicing deadlines for finance teams',
  h1='Getting ready for e-invoicing deadlines in India, the UAE and Saudi Arabia',
  lead='For finance teams, exporters and groups with entities in markets where e-invoicing becomes mandatory in 2027.',
  short='Several countries are widening e-invoicing in 2027, and most delays come from invoice data and processes, not software. We list the deadlines that apply to each of your entities, check your invoice data and billing steps against them, and prepare a cut-over and testing plan with your accredited provider or ERP partner.',
  problems=['Deadlines differ by country, entity and revenue, and nobody owns the full list.', 'Customer, tax and product data on invoices is incomplete or inconsistent.', 'Testing starts too late, so the first live invoices are rejected.'],
  steps=[('List the deadlines', 'Every e-invoicing date that applies to each of your entities, with sources.'), ('Check the data', 'Invoice fields, customer records and tax codes compared with what each system will need.'), ('Fix the process', 'Billing steps, approvals and exception handling updated for the new flow.'), ('Plan cut-over', 'A testing and go-live checklist agreed with your provider or ERP partner.')],
  gets=['A dated list of the deadlines that apply to you', 'A gap list for invoice data and billing steps', 'A cut-over and testing checklist'],
  service='ai-automation', sprint='automation-sprint', sample='automation', industry='financial-services',
  service_link=('/practices/operations-finance#finance-ops-automation', 'Finance Ops Automation'),
  start=('/practices/operations-finance#e-invoicing-readiness-review', 'E-invoicing Readiness Review'),
  contact='e-invoicing-readiness-review',
  extra='''  <section aria-labelledby="dates-heading">
    <div class="sectionhead"><div class="eyebrow">Key dates</div><h2 id="dates-heading">Deadlines reported so far</h2><p>Dates as reported in November 2026. Check the official notices for your entities; they can change.</p></div>
    <div class="table-wrap"><table class="uc-table">
      <thead><tr><th scope="col">Country</th><th scope="col">What changes</th><th scope="col">Date</th><th scope="col">Source</th></tr></thead>
      <tbody>
        <tr><td>India</td><td>E-invoicing extended to exports, reverse-charge supplies and imports of services; schema moves to version 1.2</td><td>1 January 2027</td><td><a class="textlink" href="https://www.caclubindia.com/news/cgst-rules-2026-amended-e-invoicing-scope-expanded-from-1st-january-2027-26904.asp" rel="noopener">CAclubindia</a></td></tr>
        <tr><td>UAE</td><td>Businesses with annual revenue of AED 50 million or more go live</td><td>1 January 2027</td><td><a class="textlink" href="https://www.arabianbusiness.com/finance/uae-e-invoicing-rules-key-deadlines" rel="noopener">Arabian Business</a></td></tr>
        <tr><td>UAE</td><td>Smaller businesses appoint an accredited provider, then go live</td><td>31 March 2027, then 1 July 2027</td><td><a class="textlink" href="https://www.arabianbusiness.com/finance/uae-e-invoicing-rules-key-deadlines" rel="noopener">Arabian Business</a></td></tr>
        <tr><td>Saudi Arabia</td><td>Businesses in integration Wave 25 must integrate</td><td>1 February 2027</td><td><a class="textlink" href="https://www.arabianbusiness.com/finance/saudi-2027-e-invoicing-deadline" rel="noopener">Arabian Business</a></td></tr>
        <tr><td>United Kingdom</td><td>Mandatory VAT e-invoicing announced</td><td>1 April 2029</td><td><a class="textlink" href="https://www.forvismazars.com/uk/en/insights/the-chancellors-budget-and-forecast-statements/autumn-budget-summary" rel="noopener">Forvis Mazars</a></td></tr>
      </tbody>
    </table></div>
  </section>
''',
  faq=[('Are you an accredited e-invoicing provider?', 'No. We prepare your processes, data and testing, and work alongside the accredited provider or ERP partner you choose.'), ('Does this replace our tax adviser?', 'No. Your tax adviser confirms which rules apply. We turn those rules into clean data, clear steps and a tested cut-over.'), ('Can you automate invoice handling at the same time?', 'Yes. Finance Ops Automation can automate a defined invoice or payables workflow, with human approvals, once the e-invoicing basics are in place.')]),

 dict(slug='target-accounts-consultancies', group='pro', title='Target account lists for consultancies',
  h1='Target account lists for consultancies and agencies',
  lead='For consultancies and agencies whose new business depends on a few partners\' networks.',
  short='Referrals are valuable but unpredictable. We agree the clients you serve best, research organizations that match, rank them by fit and timing signals such as leadership changes or expansion, map who decides, and suggest an angle for each segment. You get a focused list your partners can work through, with sources for every account.',
  problems=['New business depends on referrals and a few partners\' contacts.', 'Target lists are long and unprioritized, so outreach stalls.', 'Pitches are generic because there is no time to research each organization.'],
  steps=[('Agree the ideal client', 'Based on your best current clients and the work you want more of.'), ('Research and rank', 'Organizations are ranked by fit and recent timing signals.'), ('Map decision-makers', 'We identify the roles that buy your type of work at priority accounts.'), ('Suggest angles', 'An opening angle per segment, tied to what those clients care about now.')],
  gets=['A ranked target list with sources', 'Decision-maker roles for priority accounts', 'Outreach angles by segment'],
  service='account-persona-mapping', sprint='account-sprint', sample='account', industry='professional-services',
  faq=[('How many accounts are included?', 'The list size is agreed in your scope. A shorter, well-researched list is usually more useful than a long one; that is our view, not a rule.'), ('Is the research kept confidential?', 'Yes. Your target list and criteria are not shared with anyone else.'), ('Can you keep the list current?', 'Yes. The Weekly Growth Signal Watch can monitor your priority accounts for new signals.')]),
 dict(slug='ai-policy-training-law-firms', group='pro', title='AI-use policy and training for law firms',
  h1='An AI-use policy and practical training for law firms',
  lead='For law firms whose people already use AI tools, often without shared rules.',
  short='Staff are using AI tools, and clients are starting to ask how. We run hands-on workshops built around your firm\'s real tasks, and help you set up a plain-English AI-use policy and register that record which tools are allowed, for what, with which data. Your own counsel reviews the policy; we do not give legal advice.',
  problems=['Use of AI tools is uneven, and nobody is sure what is allowed.', 'Clients ask about AI use and confidentiality, and answers vary.', 'Training is generic and does not reflect the firm\'s actual work.'],
  steps=[('Discovery session', 'We meet a few team members to collect real tasks and current tool use.'), ('Hands-on workshop', 'Practical sessions on research, drafting support and checking output, built on your tasks.'), ('Policy and register', 'A plain-English AI-use policy and register, drafted for your firm to review.'), ('Follow-up', 'A short follow-up to answer questions and refine the prompt library.')],
  gets=['A workshop built around your firm\'s tasks', 'A draft AI-use policy and register for your review', 'A prompt library your team can keep using'],
  service='ai-training', sprint='automation-sprint', sample='automation', industry='legal-services',
  faq=[('Do you give legal or regulatory advice?', 'No. We provide practical training and draft documents for your firm to review. Your own counsel decides what applies.'), ('Can the workshop run on-site?', 'Yes. Workshops run on-site or online, as a half day, a full day or a short programme.'), ('What should staff never put into an AI tool?', 'The policy sets this out for your firm, typically covering client-confidential information and any data your approved tools are not cleared to handle.'), ('Should we bill clients for time saved by AI?', 'That is for your firm and its regulators to decide. Guidance is emerging: in November 2026 the New York State Bar adopted a report that treats general AI tools as overhead, billable only where matter-specific and disclosed (<a class="textlink" href="https://www.abajournal.com/news/article/ny-bar-tells-lawyers-not-to-bill-for-time-saved-by-ai" rel="noopener">ABA Journal</a>). Our AI Use &amp; Billing Policy Pack drafts options for your counsel to review.')]),
 dict(slug='client-reporting-accounting-firms', group='pro', title='Automated client reporting for accounting firms',
  h1='Automating monthly client reporting for accounting firms',
  lead='For accounting and advisory firms that rebuild similar client reports by hand every month.',
  short='Monthly reports take hours of copying figures between the ledger, spreadsheets and documents. We map how one or two reports are produced today, rank what can be automated safely, and design a pilot that drafts each report from your data. An accountant still reviews and approves every report before a client sees it.',
  problems=['Figures are copied between the ledger, spreadsheets and report templates each month.', 'Commentary is written from scratch, even when little has changed.', 'Small copying errors take time to find and correct.'],
  steps=[('Map one report', 'We follow one report from data export to client email, with time and error points.'), ('Rank the opportunities', 'Steps are ranked by hours saved, build cost and risk.'), ('Design the pilot', 'A pilot that drafts the report and flags unusual movements for review.'), ('Document controls', 'Review steps, an AI-use register entry and an SOP for the team.')],
  gets=['A map of the reporting workflow', 'A ranked automation shortlist', 'A pilot design with accountant review built in'],
  service='ai-automation', sprint='automation-sprint', sample='automation', industry='financial-services',
  faq=[('Will clients receive AI-written reports?', 'Only after an accountant has reviewed and approved them. Draft commentary is a starting point, not the final word.'), ('Which accounting software do you work with?', 'Most ledgers that export data or offer integrations. We confirm what is possible with yours during scoping.'), ('How is client data protected?', 'Each workflow only accesses the data it needs, and data handling is agreed with you before any pilot runs.')]),
 dict(slug='content-for-nonprofits', group='pro', title='Steady content for nonprofit teams',
  h1='A steady flow of content for busy nonprofit teams',
  lead='For nonprofits that have strong stories to tell and too little time to tell them.',
  short='Busy teams struggle to post, email and report regularly. We turn one interview or a few documents each month into short videos, posts, a newsletter and an article in your voice. A person checks every fact and you approve everything before it goes out. We also review your donation and volunteer pages, so new interest turns into action.',
  problems=['Content stops whenever the team is busy with programme work.', 'Impact stories exist but are never turned into posts or newsletters.', 'Donation and volunteer pages ask for too much, too early.'],
  steps=[('Monthly brief', 'One interview or a few documents set the month\'s stories and messages.'), ('Produce and review', 'Videos, posts, a newsletter and an article are drafted with AI and checked by a person.'), ('You approve', 'Nothing goes out without your approval.'), ('Improve sign-up pages', 'We review donation and volunteer pages and rank fixes.')],
  gets=['A monthly set of content in your voice', 'Facts checked before you see a draft', 'A ranked fix list for donation and volunteer pages'],
  service='ai-content-studio', sprint='conversion-sprint', sample='conversion', industry='nonprofits',
  faq=[('Will it sound like us?', 'We build a short voice guide from your existing material and refine it with your feedback over the first months.'), ('How do you handle beneficiary stories?', 'Only with the consent your organization has obtained, and with any details you ask us to remove taken out.'), ('Can we start small?', 'Yes. Scope and volume are agreed with you and can change from month to month.')]),
 dict(slug='repurposing-video-media', group='pro', title='Short video from long content for media companies',
  h1='Turning long content into short video for media and publishing teams',
  lead='For publishers, podcasters and media teams with an archive of long content and little capacity for short formats.',
  short='Long interviews, episodes and articles hold dozens of short moments that rarely get used. We find the strongest segments, script and produce short vertical videos with captions in your brand style, and adapt them for each platform. A person checks every clip for accuracy and context, and you approve before anything is published.',
  problems=['Long content is published once and rarely reused.', 'Short-form production competes with the main editorial schedule.', 'Clips lose context or misquote when cut in a hurry.'],
  steps=[('Select segments', 'We review your long content and propose the strongest moments.'), ('Script and produce', 'Short videos with captions and brand styling, made with AI tools and edited by a person.'), ('Check context', 'Every clip is checked so quotes keep their meaning.'), ('Adapt per platform', 'Formats and captions are adjusted for each platform you use.')],
  gets=['A monthly batch of short videos from your archive', 'Captions in your brand style', 'Every clip checked for accuracy and context'],
  service='ai-content-studio', sprint='automation-sprint', sample='automation', industry='media-entertainment',
  faq=[('Who owns the clips?', 'Rights in your source material stay with you. Usage terms for the produced clips are set out in your written scope.'), ('Do you use AI voices?', 'Only where you approve it, and labelled where platforms require it. Most clips use the original audio.'), ('Can you work from audio-only podcasts?', 'Yes. Audio can be paired with captions and visuals to make short video.')]),
 dict(slug='multilingual-public-information', group='pro', title='Multilingual information for public bodies',
  h1='Clear, multilingual public information for public bodies',
  lead='For councils, agencies and public services that need key information understood by people in several languages.',
  short='Residents can only act on information they understand. We adapt your most-used service pages and notices into the languages your communities speak, using AI for drafts and reviewers for meaning, tone and terminology. We also check the pages for plain language, so the original is clear before it is translated.',
  problems=['Key service information exists in one language only.', 'Translations are commissioned page by page, with inconsistent terms.', 'Original pages use jargon that does not translate well.'],
  steps=[('Choose the pages', 'We agree the most-used pages and notices, and the languages to cover.'), ('Plain-language pass', 'The source text is simplified first, so translations are clearer.'), ('Translate and review', 'AI drafts, then reviewers check meaning, tone and a shared glossary.'), ('Keep in step', 'A routine for updating translations when source pages change.')],
  gets=['Priority pages in the languages you serve', 'A shared glossary of approved terms', 'A routine for keeping translations current'],
  service='ai-localization', sprint='conversion-sprint', sample='conversion', industry='government-public-sector',
  faq=[('Are translations checked by people?', 'Yes. Reviewers check meaning, tone and terminology before anything is published.'), ('Can you meet our procurement and accessibility requirements?', 'We work within the requirements you share during scoping and confirm in writing what we can meet.'), ('Which languages can you cover?', 'Most widely spoken languages. Coverage for less common languages is confirmed during scoping.')]),
 dict(slug='dpdp-readiness-small-businesses', group='pro', title='DPDP readiness for small businesses',
  h1="Getting ready for India's DPDP Rules before 13 May 2027",
  lead='For small and mid-sized businesses that collect personal data from people in India, from customers and leads to staff.',
  short="India's DPDP Rules apply in phases, and the main duties on notice, consent, security, breach reporting and people's rights start on 13 May 2027. We map the personal data you hold, fix notices and consent wording, review vendor contracts, and set up breach and request handling. This is readiness work; your counsel confirms what applies.",
  problems=['Personal data sits in forms, WhatsApp, spreadsheets, the CRM and email, with no single map.', 'Privacy notices are generic and consent wording does not match how data is used.', 'There is no agreed process for a breach or for a request to see or delete data.'],
  steps=[('Map the data', 'Every place personal data comes in, where it is stored, who sees it and which vendors touch it.'), ('Fix notices and consent', 'Plain-language notices and consent wording for each collection point.'), ('Review vendors', 'Processor contracts checked for security and breach-notification terms.'), ('Set up handling', 'A breach process with the 72-hour report, and a simple request log with owners.')],
  gets=['A personal-data map you can keep current', 'Updated notices, consent wording and a vendor checklist', 'Breach and request workflows your team can follow'],
  service='ai-automation', sprint='automation-sprint', sample='automation', industry='professional-services',
  service_link=('/practices/cyber-privacy#data-privacy-readiness', 'Data Privacy Readiness'),
  start=('/practices/cyber-privacy#dpdp-readiness-kit', 'DPDP Readiness Kit &amp; Clinic'),
  contact='data-privacy-readiness',
  faq=[('Is this legal advice?', 'No. It is practical readiness work: maps, templates, workflows and training. Your own counsel confirms how the law applies to you.'), ('What started on 13 November 2026?', 'The rules for consent managers. Most businesses are not consent managers, so the main preparation is for 13 May 2027. See <a class="textlink" href="/insights/dpdp-what-to-finish-before-may-2027">our six-month plan</a>.'), ('We are outside India. Does it apply to us?', 'It can, if you process personal data in connection with offering goods or services to people in India. Your counsel can confirm.')]),
 dict(slug='study-abroad-immigration-advisers', group='pro', title='Enquiries and content for study-abroad advisers',
  h1='Handling enquiry spikes and rule changes for study-abroad and immigration advisers',
  lead='For study-abroad agents, education consultants and immigration advisers whose enquiries jump every time visa or study rules change.',
  short='When study or visa rules change, enquiries spike and the same questions arrive at all hours. An AI assistant answers routine questions from your approved information, collects documents and books calls with your advisers. We also turn each rule change into clear content. Advice on individual cases always stays with your qualified advisers.',
  problems=['Rule changes trigger a flood of the same questions on WhatsApp, phone and email.', 'Advisers spend time on routine answers instead of individual cases.', 'Content about each change is slow to publish, so prospects read it elsewhere first.'],
  steps=[('Collect approved answers', 'Your approved information on services, documents, timelines and processes.'), ('Set up the assistant', 'It answers routine questions, collects documents and books calls with advisers.'), ('Turn changes into content', 'Short articles, posts and videos explaining each change, checked against official sources.'), ('Review monthly', 'We review a sample of conversations and update answers as rules change.')],
  gets=['Routine questions answered at any hour, in your approved words', 'Calls booked with advisers, with documents attached', 'Clear content on each rule change, checked by a person'],
  service='ai-front-desk', sprint='conversion-sprint', sample='conversion', industry='education-training',
  faq=[('Will the assistant give immigration or visa advice?', 'No. It shares only your approved general information and passes anything about an individual case to your qualified advisers.'), ('Can you work in several languages?', 'Yes, where your approved answers are available in those languages. We can help translate them with human review.'), ('Can we offer this to our own clients under our brand?', 'Agencies can, through our <a class="textlink" href="/white-label">white-label desk</a>.')]),
]

src = open(os.path.join(ROOT, 'samples.html'), encoding='utf-8').read()
GA = re.search(r'<!-- GA4:start -->.*?<!-- GA4:end -->', src, re.S).group(0)
FOOT = src[src.rindex('<div class="wrap">', 0, src.rindex('<footer')):]
NAV_PLACEHOLDER = '<div class="wrap"><nav class="nav" aria-label="Main navigation"></nav></div>'

def page_head(url, title, desc, og, ld, extra_css=''):
    return f'''<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
{GA}
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#020C24">
<link rel="canonical" href="{SITE}{url}">
<link rel="icon" type="image/png" href="/assets/marketcentaur-mc-option-4-favicon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="MarketCentaur">
<meta property="og:title" content="{title.replace(' | MarketCentaur', '')}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{SITE}{url}">
<meta property="og:image" content="{SITE}/assets/og/{og}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{title.replace(' | MarketCentaur', '')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{SITE}/assets/og/{og}.png">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<link rel="stylesheet" href="/assets/site.css">
<link rel="stylesheet" href="/assets/page-visuals.css">
<link rel="preload" href="/assets/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site-nav.css">
<style>
.uc-links{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:18px}}
.uc-links a{{display:block;padding:16px;border:1px solid var(--line);border-radius:12px;background:var(--surface);text-decoration:none;color:var(--text);font-weight:700;font-size:14.5px;line-height:1.4}}
.uc-links a span{{display:block;margin-bottom:6px;color:var(--accent);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}}
.uc-links a:hover{{border-color:var(--accent)}}
.cards{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:18px}}
.cards .num{{color:var(--accent);font-size:11px;font-weight:800;letter-spacing:.08em;margin-bottom:8px}}
.cards h3{{margin:0 0 6px;font-size:17px}}.cards p{{margin:0;color:var(--muted);font-size:14.5px;line-height:1.6}}
.uc-list{{margin:8px 0 0;padding-left:20px}}
.table-wrap{{overflow-x:auto;margin-top:18px}}.uc-table{{width:100%;border-collapse:collapse;font-size:14.5px}}.uc-table th,.uc-table td{{text-align:left;vertical-align:top;padding:10px 12px;border-bottom:1px solid var(--line)}}.uc-table th{{color:var(--muted);font-size:12px;letter-spacing:.06em;text-transform:uppercase}}.uc-list li{{margin:8px 0;color:var(--muted);line-height:1.65}}
@media(max-width:900px){{.uc-links{{grid-template-columns:repeat(2,minmax(0,1fr))}}}}
@media(max-width:520px){{.uc-links{{grid-template-columns:1fr}}}}
{extra_css}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{NAV_PLACEHOLDER}
'''

def strip(s): return html.unescape(re.sub(r'<[^>]+>', '', s))

# Insights posts publish on their front-matter date (scripts/build-insights.mjs). A link to a post that
# is not live yet is a 404 for crawlers, so until then the anchor is rendered as plain text. The Build
# Insights workflow reruns this script daily with BUILD_DATE, so the link appears on publication day.
BUILD_DATE = os.environ.get('BUILD_DATE') or __import__('datetime').date.today().isoformat()

def insight_dates():
    out = {}
    d = os.path.join(ROOT, 'content', 'insights')
    for name in os.listdir(d):
        m = re.match(r'(\d{4}-\d{2}-\d{2})-(.+)\.md$', name)
        if not m: continue
        fm = re.search(r'^date:\s*"?(\d{4}-\d{2}-\d{2})', open(os.path.join(d, name), encoding='utf-8').read(), re.M)
        out[m.group(2)] = fm.group(1) if fm else m.group(1)
    return out

INSIGHT_DATES = insight_dates()

def live_links(s):
    def repl(m):
        date = INSIGHT_DATES.get(m.group(1))
        return m.group(0) if date and date <= BUILD_DATE else m.group(2)
    return re.sub(r'<a [^>]*href="/insights/([a-z0-9-]+)"[^>]*>(.*?)</a>', repl, s)

def crumbs(items):
    return {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': strip(n), 'item': f'{SITE}{u}'} for i, (n, u) in enumerate(items)]}

def build_page(uc):
    url = f"/use-cases/{uc['slug']}"
    title = f"{strip(uc['title'])} | MarketCentaur"
    desc = uc['lead'].replace('"', '&quot;')
    words = len(strip(uc['short']).split())
    assert 40 <= words <= 60, (uc['slug'], 'short answer words', words)
    svc_url, svc_name = uc.get('service_link') or (f"/services/{uc['service']}", SERVICES[uc['service']])
    spr_url, spr_name = uc.get('start') or (f"/services#{uc['sprint']}", SPRINTS[uc['sprint']])
    smp_url, smp_name = SAMPLES[uc['sample']]
    ind_url, ind_name = f"/industries/{uc['industry']}", INDUSTRIES[uc['industry']]
    for u in (svc_url, smp_url, ind_url):
        f = u.split('#')[0].lstrip('/')
        assert os.path.exists(os.path.join(ROOT, f + '.html')) or os.path.exists(os.path.join(ROOT, f)), (uc['slug'], u)
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', '@id': f'{SITE}{url}', 'name': strip(uc['h1']), 'description': strip(uc['lead']), 'url': f'{SITE}{url}',
         'dateModified': TODAY, 'inLanguage': 'en', 'isPartOf': {'@id': f'{SITE}/use-cases#collection'},
         'about': {'@type': 'Service', 'name': strip(svc_name), 'url': f'{SITE}{svc_url}', 'provider': {'@id': f'{SITE}/#organization'}}},
        {'@type': 'FAQPage', '@id': f'{SITE}{url}#faq', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': strip(a)}} for q, a in uc['faq']]},
        crumbs([('Home', '/'), ('Use cases', '/use-cases'), (uc['title'], url)])]}
    problems = ''.join(f'<li>{p}</li>' for p in uc['problems'])
    steps = ''.join(f'<article class="card"><div class="num">{i:02d} / STEP</div><h3>{t}</h3><p>{d}</p></article>' for i, (t, d) in enumerate(uc['steps'], 1))
    gets = ''.join(f'<li>{g}</li>' for g in uc['gets'])
    faq = ''.join(f'<details class="more"><summary>{q}</summary><p>{a}</p></details>' for q, a in uc['faq'])
    body = f'''
<main id="main">
<div class="wrap">
  <header class="hero" style="padding-bottom:28px">
    <div class="eyebrow">Use case · {GROUPS[uc['group']]}</div>
    <h1>{uc['h1']}</h1>
    <p class="lead">{uc['lead']}</p>
  </header>
  <div class="short-answer"><div class="tag">Short answer</div><p>{uc['short']}</p></div>

  <section aria-labelledby="problem-heading">
    <div class="sectionhead"><div class="eyebrow">The problem</div><h2 id="problem-heading">What usually goes wrong</h2></div>
    <ul class="uc-list">{problems}</ul>
  </section>

  <section aria-labelledby="how-heading">
    <div class="sectionhead"><div class="eyebrow">How it works</div><h2 id="how-heading">How we approach it</h2></div>
    <div class="cards cards-4">{steps}</div>
  </section>

{uc.get('extra', '')}
  <section aria-labelledby="get-heading">
    <div class="sectionhead"><div class="eyebrow">What you get</div><h2 id="get-heading">What you receive</h2></div>
    <ul class="uc-list">{gets}</ul>
    <div class="uc-links">
      <a href="{svc_url}"><span>Service</span>{svc_name} →</a>
      <a href="{spr_url}"><span>Start with</span>{spr_name} →</a>
      <a href="{smp_url}"><span>See an example</span>{smp_name} →</a>
      <a href="{ind_url}"><span>Industry</span>{ind_name} →</a>
    </div>
  </section>

  <section id="faq" aria-labelledby="faq-heading">
    <div class="sectionhead"><div class="eyebrow">Questions</div><h2 id="faq-heading">Frequently asked questions</h2></div>
    <div class="faq-list">{faq}</div>
  </section>

  <section aria-labelledby="cta-heading" style="border-top:0;padding-top:10px">
    <div class="cta">
      <div><h2 id="cta-heading">Is this your situation?</h2><p>Free 20-minute scoping call, then a written scope and a fixed quote before any work starts.</p></div>
      <a class="btn primary" href="/contact?service={uc.get('contact', uc['service'])}">Book a scoping call</a>
    </div>
  </section>
  <p class="muted small" style="margin-top:18px"><a class="textlink" href="/use-cases">← All use cases</a></p>
</div>
</main>

'''
    out = page_head(url, title, desc, f"use-cases-{uc['slug']}", ld) + body + FOOT
    os.makedirs(os.path.join(ROOT, 'use-cases'), exist_ok=True)
    path = os.path.join(ROOT, url.lstrip('/') + '.html')
    if os.path.exists(path):
        # keep the generated header that apply-nav.mjs inserted
        old = open(path, encoding='utf-8').read()
        m = re.search(r'<!-- mc-nav.*?<!-- /mc-nav -->', old, re.S)
        if m: out = out.replace(NAV_PLACEHOLDER, m.group(0))
    open(path, 'w', encoding='utf-8').write(live_links(out))
    return url

def build_hub():
    url = '/use-cases'
    desc = f'Real business problems and how we solve them: {len(USE_CASES)} use cases across local, B2B and professional organizations, each linked to a service and a sample report.'
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'CollectionPage', '@id': f'{SITE}/use-cases#collection', 'name': 'Use cases', 'description': desc, 'url': f'{SITE}{url}', 'publisher': {'@id': f'{SITE}/#organization'},
         'hasPart': [{'@id': f"{SITE}/use-cases/{u['slug']}"} for u in USE_CASES]},
        crumbs([('Home', '/'), ('Use cases', '/use-cases')])]}
    counts = {g: sum(1 for u in USE_CASES if u['group'] == g) for g in GROUPS}
    chips = f'<button type="button" data-filter="all" aria-pressed="true">All <span>{len(USE_CASES)}</span></button>' + ''.join(f'<button type="button" data-filter="{g}" aria-pressed="false">{l} <span>{counts[g]}</span></button>' for g, l in GROUPS.items())
    cards = ''.join(f'''<a class="card" data-group="{u['group']}" href="/use-cases/{u['slug']}"><div class="tag">{GROUPS[u['group']]}</div><h3>{u['title']}</h3><p>{u['lead']}</p><span class="textlink bottom">Read the use case →</span></a>''' for u in USE_CASES)
    body = f'''
<main id="main">
<div class="wrap">
  <header class="hero" style="padding-bottom:28px">
    <div class="eyebrow">Use cases</div>
    <h1>Find the problem that sounds like yours.</h1>
    <p class="lead">{len(USE_CASES)} common situations, from missed calls at a clinic to tender monitoring for an engineering firm. Each one shows how we approach it, what you receive, and which service, sprint and sample report fit.</p>
  </header>
  <section id="use-cases" aria-labelledby="list-heading" style="border-top:0;padding-top:0">
    <h2 id="list-heading" class="sr-only">All use cases</h2>
    <div class="mc-filter" role="group" aria-label="Filter use cases" data-filter-target="uc-grid">{chips}</div>
    <p class="sr-only" aria-live="polite" id="uc-grid-status"></p>
    <div class="grid g3" id="uc-grid">{cards}</div>
  </section>
  <section aria-labelledby="none-heading">
    <div class="sectionhead">
      <div class="eyebrow">Not listed?</div>
      <h2 id="none-heading">Most work starts with a problem like these.</h2>
      <p>If your situation is different, tell us what is slowing growth or eating time. We will suggest a starting point within one business day, or tell you plainly if it is not something we do. You can also browse <a class="textlink" href="/services">all services</a> or <a class="textlink" href="/industries">industries</a>.</p>
    </div>
  </section>
  <section aria-labelledby="cta-heading" style="border-top:0;padding-top:10px">
    <div class="cta">
      <div><h2 id="cta-heading">Talk it through</h2><p>Free 20-minute scoping call, then a written scope and a fixed quote before any work starts.</p></div>
      <a class="btn primary" href="/contact">Book a scoping call</a>
    </div>
  </section>
</div>
</main>

'''
    css = '#uc-grid .card{position:relative}#uc-grid .card:hover{border-color:var(--accent)}'
    out = page_head(url, 'Use Cases: Problems We Solve | MarketCentaur', desc, 'use-cases', ld, css) + body + FOOT
    path = os.path.join(ROOT, 'use-cases.html')
    if os.path.exists(path):
        m = re.search(r'<!-- mc-nav.*?<!-- /mc-nav -->', open(path, encoding='utf-8').read(), re.S)
        if m: out = out.replace(NAV_PLACEHOLDER, m.group(0))
    open(path, 'w', encoding='utf-8').write(live_links(out))
    return url

def update_sitemap(urls):
    p = os.path.join(ROOT, 'sitemap.xml'); s = open(p, encoding='utf-8').read()
    add = ''.join(f'  <url><loc>{SITE}{u}</loc><lastmod>{TODAY}</lastmod></url>\n' for u in urls if f'<loc>{SITE}{u}</loc>' not in s)
    if add: s = s.replace('</urlset>', add + '</urlset>'); open(p, 'w', encoding='utf-8').write(s)

if __name__ == '__main__':
    assert len({u['slug'] for u in USE_CASES}) == len(USE_CASES)
    urls = [build_hub()] + [build_page(u) for u in USE_CASES]
    update_sitemap(urls)
    print(f'built {len(urls)} pages')
