(function(){
"use strict";
var serviceFinder = {
  goals: {
    customers: {
      title: "Explore the people, needs or audiences involved",
      intro: "Start by defining which organizations fit, which people influence a decision, and where focused demand-generation activity may be useful.",
      services: [
        ["Core intelligence","B2B Growth Intelligence","Build a clearer view of target markets, account fit and relevant developments.","/services/b2b-growth-intelligence"],
        ["Account focus","Account & Persona Mapping","Turn an ideal-customer profile into a more usable account list and relevant buying-role map.","/services/account-persona-mapping"],
        ["Activation","Demand & Revenue Generation","Plan outreach and campaigns around the audience and qualification criteria you have defined.","/services/demand-revenue"]
      ]
    },
    conversion: {
      title: "Improve an experience or outcome",
      intro: "Review the current experience, identify points of friction and prioritize changes worth exploring.",
      services: [
        ["First step","Digital Presence","Review messaging, landing-page clarity and conversion paths.","/services/digital-presence"],
        ["Activation","Demand & Revenue Generation","Align campaigns and calls to action with audience needs.","/services/demand-revenue"],
        ["Measurement","Analytics & Optimization","Identify useful funnel measures and a practical testing sequence.","/services/analytics-optimisation"]
      ]
    },
    market: {
      title: "Understand the wider situation",
      intro: "Separate what is known from assumptions, then identify which questions or external factors deserve closer attention.",
      services: [
        ["Market context","B2B Growth Intelligence","Bring account, market and growth questions into one decision-focused brief.","/services/b2b-growth-intelligence"],
        ["Competitive view","Market & Competitor Intelligence","Track relevant competitor activity and assess its possible implications.","/services/market-competitor-intelligence"],
        ["Ongoing context","Weekly Growth Signal Watch","Review selected developments over time against agreed priorities.","/services/weekly-growth-signal-watch"]
      ]
    },
    operations: {
      title: "Improve how work and experiences function",
      intro: "Look at how work gets done, where experiences break down and what could be made clearer, simpler or more reliable.",
      services: [
        ["Customer lifecycle","Lifecycle, Retention & Loyalty","Map useful onboarding, repeat-purchase or win-back journeys around customer needs.","/services/ai-automation"],
        ["Workflow improvement","AI & Marketing Automation","Identify suitable workflow improvements with clear boundaries and human review.","/services/ai-automation"],
        ["Measurement","Analytics & Optimization","Choose practical measures to understand follow-up, conversion and retention.","/services/analytics-optimisation"]
      ]
    },
    partners: {
      title: "Explore useful connections and collaboration",
      intro: "Clarify the purpose of a potential connection, then consider fit, shared interests and practical next steps.",
      services: [
        ["Partner shortlist","Partner & Channel Discovery","Identify and assess potential partners against agreed fit criteria.","/services/partner-channel-discovery"],
        ["Market context","B2B Growth Intelligence","Understand the target segment and commercial context around potential partners.","/services/b2b-growth-intelligence"],
        ["Activation","Demand & Revenue Generation","Plan co-marketing, referral or channel activation around a clear audience.","/services/demand-revenue"]
      ]
    },
    strategy: {
      title: "Clarify direction and priorities",
      intro: "Bring objectives, constraints, available information and different perspectives together to clarify priorities.",
      services: [
        ["Business direction","Strategy & Growth","Clarify the opportunity, audience, positioning and priorities that should guide your next steps.","/services/strategy-growth"],
        ["Market context","Market & Competitor Intelligence","Bring relevant market and competitor evidence into planning decisions.","/services/market-competitor-intelligence"],
        ["Practical roadmap","Business Modernization Roadmap","Turn broad ambitions into manageable improvements across customer acquisition, processes and reporting.","/growth-check?journey=modernisation"]
      ]
    },
    ai: {
      title: "Explore technology and automation possibilities",
      intro: "Start with a real need, assess possible approaches and consider the tools, safeguards and people involved.",
      services: [
        ["Workflow review","AI & Marketing Automation","Identify repetitive tasks and assess suitable automation opportunities with clear boundaries and human review.","/services/ai-automation"],
        ["Process improvement","Strategy & Growth","Clarify the underlying process and desired outcome before choosing tools.","/services/strategy-growth"],
        ["Measurement","Analytics & Optimization","Define how to assess usefulness, quality and operational impact.","/services/analytics-optimisation"]
      ]
    },
    digital: {
      title: "Improve digital tools and experiences",
      intro: "Review how people use your digital touchpoints and where clarity, accessibility or usability could improve.",
      services: [
        ["Digital foundation","Digital Presence","Improve website clarity, navigation, discoverability and the path to contact or purchase.","/services/digital-presence"],
        ["Quick starting point","Website Inquiry Readiness Check","Review key foundations of your website's inquiry journey.","/website-enquiry-readiness"],
        ["Evidence & iteration","Analytics & Optimization","Choose useful measures and a practical sequence for testing improvements.","/services/analytics-optimisation"]
      ]
    },
    data: {
      title: "Use information and evidence more effectively",
      intro: "Identify the questions at hand, what information is available and which gaps or assumptions need checking.",
      services: [
        ["Measurement","Analytics & Optimization","Choose practical metrics and a review process tied to business decisions.","/services/analytics-optimisation"],
        ["Market evidence","Market & Competitor Intelligence","Organize relevant external signals and competitor context for clearer planning.","/services/market-competitor-intelligence"],
        ["Ongoing awareness","Weekly Growth Signal Watch","Track selected developments against agreed priorities over time.","/services/weekly-growth-signal-watch"]
      ]
    },
    risk: {
      title: "Address risk, trust and responsibility",
      intro: "Consider the risks, responsibilities, trust and safeguards relevant to your situation.",
      services: [
        ["Governance & oversight","AI Governance & Responsible Adoption","Review appropriate oversight, accountability and human review for AI-enabled work.","/services/ai-automation"],
        ["Process clarity","Strategy & Growth","Map decision points, responsibilities and practical implementation priorities.","/services/strategy-growth"],
        ["Evidence & monitoring","Analytics & Optimization","Define useful indicators and review practices for ongoing oversight.","/services/analytics-optimisation"]
      ]
    },
    innovation: {
      title: "Explore ideas and possible directions",
      intro: "Turn an initial idea into questions you can explore, evidence you can gather and possibilities you can test.",
      services: [
        ["Opportunity framing","Strategy & Growth","Clarify the customer problem, value proposition and priorities for exploration.","/services/strategy-growth"],
        ["Market validation","Market & Competitor Intelligence","Research market context, alternatives and relevant competitor activity.","/services/market-competitor-intelligence"],
        ["Potential collaborators","Partner & Channel Discovery","Explore complementary organizations and possible routes to market.","/services/partner-channel-discovery"]
      ]
    },
    unsure: {
      title: "Find a useful place to start",
      intro: "You do not need a fully formed brief. We can help you explore your goals, current challenges, available evidence and realistic next steps.",
      services: [
        ["Clarify direction","Strategy & Growth","Bring your goals and open questions into a more focused set of priorities.","/services/strategy-growth"],
        ["Explore the landscape","Market & Competitor Intelligence","Build context around customers, competitors and possible opportunities.","/services/market-competitor-intelligence"],
        ["Review the foundations","Business Modernization Roadmap","Explore practical starting points across customer acquisition, processes and reporting.","/growth-check?journey=modernisation"]
      ]
    }
  }
};
var explorerData = {
  expansion: {
    observed:"A target company announces a new regional office.",
    why:"The move could indicate geographic expansion. It does not, by itself, establish a need for your product or service.",
    verify:"Check whether the region matches your ideal customer profile, confirm the business context, and identify the roles responsible for the initiative.",
    next:"Compare the account against agreed qualification criteria. If fit is strong, prepare a relevant, human-reviewed approach; otherwise, keep it off the priority list."
  },
  hiring: {
    observed:"A target company publishes several roles in a function relevant to your offer.",
    why:"Hiring may suggest investment or a changing team structure, but job listings alone do not confirm a buying project or budget.",
    verify:"Confirm that the roles are current, examine the team's stated remit, and compare the organization with your agreed account-fit criteria.",
    next:"Record the source and date, identify a relevant business question, and decide whether the evidence is strong enough to justify further research."
  },
  launch: {
    observed:"A target company announces a new product or service line.",
    why:"A launch may change the company's priorities, partner needs or competitive position. The commercial implications depend on the market and offer.",
    verify:"Review the announcement and supporting materials, check which audience it serves, and look for independent context before drawing conclusions.",
    next:"Map the development to a specific hypothesis. If the hypothesis is relevant, plan a low-pressure conversation; if not, continue monitoring."
  }
};
function initFinder(){
 var root=document.querySelector("[data-service-finder]"); if(!root)return;
 var goal="unsure", type="both";
 function render(){
  var item=serviceFinder.goals[goal];
  if(type==="B2C" && goal==="customers") item={
    title:"Understand relevant people and their needs",
    intro:"Start with the people involved, their needs and the experience or outcome you want to improve.",
    services:[
      ["Audience & offer","Strategy & Growth","Clarify priority audiences, positioning and the customer problem your offer addresses.","/services/strategy-growth"],
      ["Digital journey","Digital Presence","Review the website, landing pages and discovery paths that help visitors understand the offer.","/services/digital-presence"],
      ["Activation","Demand & Revenue Generation","Plan campaigns and acquisition activity around the audience, message and conversion goal.","/services/demand-revenue"]
    ]
  };
  if((type==="small-local" || type==="retail-ecommerce" || type==="traditional") && goal==="customers"){
    var profiles={
      "small-local":{
        title:"Explore local needs and context",
        intro:"Start with local discovery, a clear offer, trustworthy business information and a simple path from search or social media to inquiry or visit.",
        services:[
          ["Local discovery","Local Visibility & Digital Presence","Improve the clarity of your website, local search presence and customer contact paths.","/services/small-business-local-growth"],
          ["Customer reach","Social Media & Content","Plan useful social content and local promotions around your customers and community.","/services/content-creative"],
          ["Inquiries & visits","Demand & Revenue Generation","Connect campaigns, offers and calls to action to a practical inquiry or store-visit goal.","/services/demand-revenue"]
        ]
      },
      "retail-ecommerce":{
        title:"Explore the customer or user experience",
        intro:"Connect product presentation, social content, search visibility and the purchase journey across your retail store or ecommerce shop.",
        services:[
          ["Product discovery","Ecommerce & Digital Presence","Improve product messaging, search visibility and the journey from product page to purchase.","/services/small-business-local-growth"],
          ["Campaigns","Social Media & Content","Plan product-led content, promotions and creator collaborations that fit your audience.","/services/content-creative"],
          ["Repeat purchases","Analytics & Optimization","Identify useful measures and opportunities to improve conversion and customer retention.","/services/analytics-optimisation"]
        ]
      },
      "traditional":{
        title:"Explore practical ways to improve how things work",
        intro:"For established businesses and traditional industries, begin with customer and market clarity, a practical digital foundation and manageable improvements.",
        services:[
          ["Market understanding","Strategy & Growth","Review customer segments, competitors and the clearest opportunities for growth.","/services/strategy-growth"],
          ["Digital foundation","Digital Presence","Improve website clarity, search discoverability and inquiry paths step by step.","/services/small-business-local-growth"],
          ["Practical execution","AI & Marketing Automation","Identify appropriate workflow improvements with human review and a realistic implementation scope.","/services/ai-automation"]
        ]
      }
    };
    item=profiles[type];
  }

  var audienceProfiles={
   "both":{
    customers:{title:"Find the right customers across B2B and B2C",intro:"Clarify who or what is involved, then explore approaches suited to your particular context.",services:[["Audience & offer","Strategy & Growth","Clarify the customer groups you serve, the problems you solve and the strongest routes to reach them.","/services/strategy-growth"],["Digital journey","Digital Presence","Make your offer and next step clear across your website and key discovery channels.","/services/digital-presence"],["Activation","Demand & Revenue Generation","Connect campaigns and follow-up to the audience and outcome you want to improve.","/services/demand-revenue"]]},
    conversion:{title:"Improve the path from discovery to inquiry or purchase",intro:"Review the journey customers take from first visit to a meaningful next step, whether B2B or B2C.",services:[["Clarity","Digital Presence","Review page messaging, trust signals and relevant calls to action.","/services/digital-presence"],["Activation","Demand & Revenue Generation","Align campaigns with the customer journey and desired action.","/services/demand-revenue"],["Measurement","Analytics & Optimization","Choose useful measures and a practical testing sequence.","/services/analytics-optimisation"]]},
    market:{title:"Understand the market before choosing where to focus",intro:"Build a clearer view of customer needs, competitors and relevant changes before investing in activity.",services:[["Direction","Strategy & Growth","Clarify segments, positioning and growth priorities.","/services/strategy-growth"],["Competitive context","Market & Competitor Intelligence","Review relevant competitor activity and possible implications.","/services/market-competitor-intelligence"],["Priorities","Analytics & Optimization","Turn available evidence into a focused set of questions and measures.","/services/analytics-optimisation"]]},
    partners:{title:"Explore partnerships and routes to market",intro:"Identify where partnerships, referrals, channels or collaborations may complement your existing customer acquisition.",services:[["Partner fit","Partner & Channel Discovery","Assess potential partners against practical fit criteria.","/services/partner-channel-discovery"],["Market context","Strategy & Growth","Clarify the audience and commercial purpose of a potential collaboration.","/services/strategy-growth"],["Activation","Demand & Revenue Generation","Plan a relevant co-marketing, referral or channel test.","/services/demand-revenue"]]}
   },
   "small-local":{
    customers:{title:"Explore local needs and context",intro:"Start with local discovery, a clear offer, trustworthy information and a simple path from search or social media to inquiry or visit.",services:[["Local discovery","Local Visibility & Digital Presence","Improve website clarity, local search presence and customer contact paths.","/services/small-business-local-growth"],["Customer reach","Social Media & Content","Plan useful social content and local promotions around your community.","/services/content-creative"],["Inquiries & visits","Demand & Revenue Generation","Connect campaigns and calls to action to a practical inquiry or visit goal.","/services/demand-revenue"]]},
    conversion:{title:"Make it easier for local customers to take the next step",intro:"Focus on the route from finding your business to calling, booking, visiting or sending an inquiry.",services:[["Quick check","Local Business Growth Check","Review visibility, trust and the local inquiry journey.","/growth-check?journey=local"],["Website clarity","Digital Presence","Make services, location and contact options easy to understand.","/services/digital-presence"],["Follow-up","Analytics & Optimization","Track inquiries and learn which channels bring relevant conversations.","/services/analytics-optimisation"]]},
    market:{title:"Understand your local market and customer needs",intro:"Use customer questions, competitor context and local demand patterns to decide where to focus.",services:[["Business direction","Strategy & Growth","Clarify priority customer groups and the offer that fits them.","/services/strategy-growth"],["Local foundation","Local Business Growth Check","Review the basic visibility and trust factors customers rely on.","/growth-check?journey=local"],["Content ideas","Content & Creative","Plan useful content around customer questions and local context.","/services/content-creative"]]},
    partners:{title:"Find local partners and referral opportunities",intro:"Explore complementary businesses and community relationships that may help relevant customers discover you.",services:[["Partner shortlist","Partner & Channel Discovery","Define partner fit and assess possible collaborations.","/services/partner-channel-discovery"],["Local activation","Small Business & Local Growth","Connect local visibility, referrals and community campaigns.","/services/small-business-local-growth"],["Joint campaigns","Content & Creative","Plan useful co-created content or local promotions.","/services/content-creative"]]}
   },
   "retail-ecommerce":{
    customers:{title:"Explore the customer or user experience",intro:"Connect product presentation, social content, search visibility and the purchase journey across a retail store or ecommerce shop.",services:[["Product discovery","Ecommerce Growth Check","Review product discovery, purchase confidence and repeat-purchase opportunities.","/growth-check?journey=ecommerce"],["Campaigns","Content & Creative","Plan product-led content and promotions for your audience.","/services/content-creative"],["Repeat purchases","Analytics & Optimization","Identify useful measures for conversion and customer retention.","/services/analytics-optimisation"]]},
    conversion:{title:"Reduce friction between product discovery and purchase",intro:"Review the steps that help shoppers find a product, understand the offer and complete a purchase.",services:[["Store review","Ecommerce Growth Check","Assess product pages, trust details, mobile use and checkout friction.","/growth-check?journey=ecommerce"],["Digital journey","Digital Presence","Improve store messaging, product discovery and conversion paths.","/services/digital-presence"],["Testing","Analytics & Optimization","Choose a practical way to measure and test improvements.","/services/analytics-optimisation"]]},
    market:{title:"Understand customer demand and competitor positioning",intro:"Use customer questions, product categories and available market evidence to sharpen your focus.",services:[["Customer direction","Strategy & Growth","Clarify priority audiences, positioning and product-market context.","/services/strategy-growth"],["Store check","Ecommerce Growth Check","Review the customer journey and possible friction points.","/growth-check?journey=ecommerce"],["Content opportunities","Content & Creative","Plan content that answers product questions and supports discovery.","/services/content-creative"]]},
    partners:{title:"Explore retail and ecommerce partnerships",intro:"Consider relevant creators, complementary brands, marketplaces and channel partners against your audience and commercial goals.",services:[["Partner fit","Partner & Channel Discovery","Define criteria for useful partner relationships.","/services/partner-channel-discovery"],["Campaigns","Content & Creative","Plan creator or co-marketing activity with a clear audience and purpose.","/services/content-creative"],["Channel performance","Analytics & Optimization","Agree how to evaluate traffic quality, sales and retention.","/services/analytics-optimisation"]]}
   },
   "traditional":{
    customers:{title:"Modernize marketing while building on existing strengths",intro:"For established businesses and traditional industries, begin with customer clarity, a practical digital foundation and manageable improvements.",services:[["Market understanding","Strategy & Growth","Review customer segments, competitors and growth opportunities.","/services/strategy-growth"],["Digital foundation","Local & Business Growth Support","Improve website clarity, search discoverability and inquiry paths step by step.","/services/small-business-local-growth"],["Practical execution","AI & Marketing Automation","Identify scoped workflow improvements with human review.","/services/ai-automation"]]},
    conversion:{title:"Create a clearer, more consistent inquiry process",intro:"Review the customer-facing information and internal handoffs that affect inquiry quality and follow-up.",services:[["Roadmap","Business Modernization Roadmap","Assess marketing, lead handling and reporting foundations.","/growth-check?journey=modernisation"],["Digital journey","Digital Presence","Make your offer and next step clearer across digital touchpoints.","/services/digital-presence"],["Lead follow-up","Analytics & Optimization","Define practical measures for inquiry handling and conversion.","/services/analytics-optimisation"]]},
    market:{title:"Clarify customer and market priorities",intro:"Build a usable view of customer needs and competitor context before committing to a larger transformation.",services:[["Business direction","Strategy & Growth","Set priorities based on customer segments and commercial goals.","/services/strategy-growth"],["Modernization review","Business Modernization Roadmap","Identify practical process and reporting improvements.","/growth-check?journey=modernisation"],["Competitive context","Market & Competitor Intelligence","Review relevant market changes and possible implications.","/services/market-competitor-intelligence"]]},
    partners:{title:"Find practical routes to market and partnership opportunities",intro:"Explore distribution, referral and channel opportunities that fit your established business model.",services:[["Partner fit","Partner & Channel Discovery","Assess potential partners against agreed criteria.","/services/partner-channel-discovery"],["Market context","Strategy & Growth","Clarify the audience and purpose for a possible partnership.","/services/strategy-growth"],["Activation","Demand & Revenue Generation","Plan a manageable channel or co-marketing test.","/services/demand-revenue"]]}
   }
  };
  if(audienceProfiles[type] && audienceProfiles[type][goal]) item=audienceProfiles[type][goal];
  var title=root.querySelector("[data-finder-title]"); var intro=root.querySelector("[data-finder-intro]"); var list=root.querySelector("[data-finder-results]");
  title.textContent=item.title; intro.textContent=item.intro; list.textContent="";
  item.services.forEach(function(service){
   var article=document.createElement("article");article.className="recommendation-item";
   var tag=document.createElement("span");tag.textContent=service[0];
   var h=document.createElement("h4");h.textContent=service[1];
   var p=document.createElement("p");p.textContent=service[2];
   var a=document.createElement("a");a.href=service[3];a.textContent="Explore service →";
   article.append(tag,h,p,a);list.appendChild(article);
  });
  var typeLabels={"both":"B2B and B2C","small-local":"small and local businesses","retail-ecommerce":"retail and ecommerce businesses","traditional":"established businesses and traditional industries"};
  var typeText=typeLabels[type]||type;
  root.querySelector("[data-finder-context]").textContent="Recommendations tailored to "+typeText+". Explore the options below to find a practical next step for your business.";
  root.querySelectorAll("[data-goal]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.goal===goal));});
  root.querySelectorAll("[data-business-type]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.businessType===type));});
 }
 root.addEventListener("click",function(e){
  var g=e.target.closest("[data-goal]");var t=e.target.closest("[data-business-type]");
  if(g){goal=g.dataset.goal;render();}
  if(t){type=t.dataset.businessType;render();}
 });
 render();
}
function initExplorer(){
 var root=document.querySelector("[data-brief-explorer]");if(!root)return;
 var content=root.querySelector("[data-explorer-content]");
 function show(key){
  var d=explorerData[key];content.textContent="";
  var rows=[
   ["Observed development",d.observed,"Why it may matter",d.why],
   ["What to verify","Check the evidence before treating the development as relevant.","Qualification questions",d.verify],
   ["Recommended next step",d.next,"Decision principle","Use agreed criteria, source notes and human review; a signal is a prompt for research, not proof of buying intent."]
  ];
  rows.forEach(function(row){
   var el=document.createElement("div");el.className="reportrow";
   var left=document.createElement("div");var label=document.createElement("span");label.className="label";label.textContent=row[0];var strong=document.createElement("b");strong.textContent=row[1];left.append(label,strong);
   var right=document.createElement("div");var label2=document.createElement("span");label2.className="label";label2.textContent=row[2];var p=document.createElement("p");p.textContent=row[3];right.append(label2,p);el.append(left,right);content.appendChild(el);
  });
  root.querySelectorAll("[data-scenario]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.scenario===key));});
 }
 root.addEventListener("click",function(e){var b=e.target.closest("[data-scenario]");if(b)show(b.dataset.scenario);});
 show("expansion");
}
function buildEmailCapture(assessment,score,items){
 var wrap=document.createElement("form");wrap.className="email-capture";wrap.method="POST";wrap.action="https://formsubmit.co/hello@marketcentaur.com";
 wrap.style.cssText="margin:22px 0;padding:18px;border:1px solid var(--accent,#19D3FF);border-radius:12px;background:var(--surface,#071A45)";
 function hidden(n,v){var i=document.createElement("input");i.type="hidden";i.name=n;i.value=v;wrap.appendChild(i);}
 hidden("_subject","Free check results request: "+assessment);hidden("_template","table");
 hidden("_next","https://marketcentaur.com/contact-success?type=report");
 hidden("assessment",assessment);hidden("score",score+"/12");hidden("priorities",items.join(" | "));
 var honey=document.createElement("input");honey.type="text";honey.name="_honey";honey.style.display="none";honey.tabIndex=-1;honey.autocomplete="off";wrap.appendChild(honey);
 var h=document.createElement("strong");h.textContent="Want the full version?";
 var p=document.createElement("p");p.textContent="Get these results by email, plus three recommended next steps for your business, reviewed by a person. It's free, with no sales sequence.";p.style.margin="6px 0 12px";
 var row=document.createElement("div");row.style.cssText="display:flex;gap:10px;flex-wrap:wrap";
 var site=document.createElement("input");site.type="text";site.name="website";site.placeholder="yourcompany.com (optional)";site.setAttribute("aria-label","Website (optional)");
 var email=document.createElement("input");email.type="email";email.name="email";email.required=true;email.placeholder="you@company.com";email.setAttribute("aria-label","Email");
 [site,email].forEach(function(i){i.style.cssText="flex:1;min-width:180px;padding:11px 13px;border-radius:9px;border:1px solid var(--line,#1B3368);background:var(--bg,#020C24);color:inherit;font:inherit";});
 var btn=document.createElement("button");btn.type="submit";btn.className="experience-btn";btn.textContent="Email me my results";
 row.append(site,email,btn);wrap.append(h,p,row);return wrap;
}

function initReadiness(){
 var form=document.querySelector("[data-readiness-form]");if(!form)return;
 var result=document.querySelector("[data-readiness-result]");
 form.addEventListener("reset",function(){result.hidden=true;result.textContent="";});
 form.addEventListener("submit",function(e){
  e.preventDefault();
  var data=new FormData(form), score=0, gaps=[];
  var questions=[
   ["offer","Make the offer clear","Explain in plain language who you help, what you help them do, and why it matters."],
   ["audience","Define the audience","Describe the types of customers the business is best placed to serve."],
   ["cta","Make the next step obvious","Give visitors a relevant action such as booking a conversation, requesting a sample or trying a tool."],
   ["trust","Build confidence","Use accurate service details, transparent process information and relevant evidence where available."],
   ["mobile","Make mobile use easy","Check text, navigation, forms and calls to action on a small screen."],
   ["followup","Make inquiries easy to complete","Keep forms proportionate and explain what happens after someone submits."]
  ];
  var answered=0;
  questions.forEach(function(q){
   var value=Number(data.get(q[0]));
   if(data.get(q[0])!==null){score+=value;answered++;}
   if(value<2)gaps.push(q[1]+": "+q[2]);
  });
  if(answered<questions.length){result.hidden=false;result.innerHTML="<h3>Finish the quick check</h3><p>Please choose one response for each of the six questions to get a useful summary.</p>";result.scrollIntoView({behavior:"smooth",block:"nearest"});return;}
  var title,summary;
  if(score>=10){title="A solid starting point";summary="Your answers suggest several important basics are in place. Focus next on validating the journey with real visitor behavior and testing one improvement at a time.";}
  else if(score>=6){title="Some useful foundations, with room to improve";summary="Your answers suggest a few parts of the inquiry journey may be inconsistent. Prioritize the gaps below that create the most friction for your intended audience.";}
  else{title="Start with the essentials";summary="Your answers suggest the inquiry path may need clearer foundations before adding more complexity. Begin with the highest-impact basics below.";}
  result.textContent="";
  var h=document.createElement("h3");h.textContent=title;
  var p=document.createElement("p");p.textContent=summary+" Self-assessment score: "+score+" out of 12.";
  var heading=document.createElement("strong");heading.textContent=gaps.length?"Suggested priorities":"What to do next";
  var ul=document.createElement("ul");
  (gaps.length?gaps:["Review your main conversion path with a small set of users, then choose one measurable improvement to test."]).forEach(function(g){var li=document.createElement("li");li.textContent=g;ul.appendChild(li);});
  var note=document.createElement("p");note.textContent="This is a directional self-check based only on your answers. It does not scan your website, verify accessibility or analytics, or predict inquiry volume. Actual priorities depend on your audience and evidence.";
  var link=document.createElement("a");link.className="experience-btn";link.href="/contact";link.textContent="Discuss your website goals";
  var capture=buildEmailCapture("Website Inquiry Readiness Check",score,gaps.length?gaps:["No major gaps flagged"]);
  result.append(h,p,heading,ul,capture,note,link);result.hidden=false;result.scrollIntoView({behavior:"smooth",block:"nearest"});
 });
}

function initGrowthCheck(){
 var form=document.querySelector("[data-growth-check-form]");if(!form)return;
 var result=document.querySelector("[data-growth-check-result]");
 var params=new URLSearchParams(window.location.search);
 var journey=params.get("journey")||"local";
 if(journey==="modernization")journey="modernisation";
 var configs={
  local:{title:"Local Business Growth Check",intro:"A practical starting point for small businesses and local services that want to improve discovery, trust and the path to inquiries or visits.",heading:"Review your local growth basics",description:"Answer six questions about how customers find, evaluate and contact your business.",service:"small-business-local-growth",questions:[
   ["visibility","Can nearby customers find accurate information about your business?","Think about your website, business profile, opening hours, location and contact details."],
   ["offer","Is your offer and target customer clear at a glance?","A new visitor should quickly understand what you offer and who it is for."],
   ["trust","Do you provide useful trust signals?","Examples include current photos, clear service details, genuine reviews and helpful FAQs."],
   ["contact","Is it easy to inquire, call, book or visit?","Check the next step on both desktop and mobile."],
   ["social","Do your social channels or local promotions help customers decide?","Prioritize useful, current information over posting for its own sake."],
   ["followup","Do you have a consistent way to respond to new inquiries?","Consider response ownership, follow-up and how you learn from customer questions."]
  ],priorities:["Check and align your business name, location, hours and contact details across key listings.","Rewrite your main page headline to explain your offer and who you serve.","Make one primary action easy to find: call, inquire, book or visit.","Add accurate trust information such as current photos, clear process details and genuine reviews.","Choose a manageable local content or partnership activity and review whether it generates useful conversations.","Set a simple process for responding to and learning from inquiries."]},
  ecommerce:{title:"Ecommerce Growth Check",intro:"A guided review for retail stores, Shopify merchants and ecommerce businesses looking to make product discovery and the buying journey clearer.",heading:"Review your store journey",description:"Answer six questions about product discovery, purchase confidence and repeat business.",service:"ecommerce-growth-check",questions:[
   ["discovery","Can shoppers find relevant products quickly?","Consider navigation, categories, on-site search and product filtering."],
   ["product","Do product pages answer the main buying questions?","Check descriptions, sizing or specifications, images, availability and intended use."],
   ["trust","Are delivery, returns and support details easy to understand?","Important conditions should be visible before checkout."],
   ["checkout","Is the path from product page to checkout straightforward?","Look for unnecessary steps, unclear costs or confusing form fields."],
   ["mobile","Is the store easy to browse and buy from on a phone?","Check text, images, navigation, buttons and checkout flow."],
   ["retention","Do customers have a useful reason to return?","Consider product care, replenishment, relevant follow-up and customer service—without over-messaging."]
  ],priorities:["Review navigation and product categories using the terms customers naturally use.","Improve the highest-priority product pages with clear details, helpful imagery and answers to common questions.","Make delivery, returns, payment and support information easy to find before checkout.","Walk through the mobile purchase journey and record avoidable steps or surprises.","Review checkout friction and test one change at a time using suitable analytics.","Create a relevant post-purchase experience that supports service, repeat purchase or feedback."]
  },
  modernisation:{title:"Business Modernization Roadmap",intro:"A practical starting point for established businesses and traditional industries that want to modernize marketing, customer acquisition and reporting step by step.",heading:"Review your operating foundations",description:"Answer six questions about customer visibility, lead handling, marketing processes and decision-making.",service:"business-modernisation",questions:[
   ["audience","Do you have a current view of your priority customer groups?","Consider which customers are most valuable to serve and why."],
   ["presence","Can customers clearly understand your offer through digital channels?","Review the website, search presence and key customer information."],
   ["leads","Is there a consistent process for recording and following up leads?","Think about ownership, handoffs, response times and lost opportunities."],
   ["content","Do marketing activities follow a clear plan?","A simple calendar and defined audience can be more useful than more channels."],
   ["reporting","Can you see which activities lead to meaningful business conversations or sales?","Choose a small number of useful measures before building complex dashboards."],
   ["workflow","Have you identified repetitive tasks that could be simplified?","Start with a defined process and safeguards before adopting new technology."]
  ],priorities:["Document your priority customer groups, their needs and the reasons they choose your business.","Review the website and key customer touchpoints for outdated or unclear information.","Define a simple lead-recording, ownership and follow-up process.","Choose a manageable marketing rhythm with a clear audience, purpose and owner.","Create a small monthly scorecard tied to inquiries, opportunities, sales or retention where data is available.","Map one repetitive workflow and assess whether a simple process change or appropriately scoped automation would help."]
  }
 };
 if(!configs[journey])journey="local";
 var config=configs[journey];
 document.querySelector("[data-growth-title]").textContent=config.title;
 document.querySelector("[data-growth-intro]").textContent=config.intro;
 document.querySelector("[data-growth-heading]").textContent=config.heading;
 document.querySelector("[data-growth-description]").textContent=config.description;
 document.querySelectorAll("[data-journey-link]").forEach(function(link){if(link.dataset.journeyLink===journey)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");});
 config.questions.forEach(function(q,index){
  var field=document.createElement("div");field.className="growth-check-question";
  var legend=document.createElement("h3");legend.className="question-title";legend.id="growth-question-"+index;legend.textContent=(index+1)+". "+q[1];field.setAttribute("role","group");field.setAttribute("aria-labelledby",legend.id);
  var help=document.createElement("p");help.className="question-help";help.textContent=q[2];
  var choices=document.createElement("div");choices.className="choice-row";
  [["2","Yes, consistently"],["1","Partly / not sure"],["0","Not yet"]].forEach(function(option){
   var label=document.createElement("label"),input=document.createElement("input"),span=document.createElement("span");
   input.type="radio";input.name=q[0];input.value=option[0];input.required=index===0;
   span.textContent=option[1];label.append(input,span);choices.appendChild(label);
  });
  field.append(legend,help,choices);form.appendChild(field);
 });
 var actions=document.createElement("div");actions.className="growth-check-actions";
 var submit=document.createElement("button");submit.type="submit";submit.className="experience-btn";submit.textContent="Show my priorities";
 var reset=document.createElement("button");reset.type="reset";reset.className="experience-btn secondary";reset.textContent="Start again";actions.append(submit,reset);form.appendChild(actions);
 form.addEventListener("reset",function(){result.hidden=true;result.textContent="";});
 form.addEventListener("submit",function(e){
  e.preventDefault();var data=new FormData(form),score=0,answered=0;
  config.questions.forEach(function(q){var v=data.get(q[0]);if(v!==null){score+=Number(v);answered++;}});
  if(answered!==config.questions.length){result.hidden=false;result.textContent="Please answer each question to see your summary.";return;}
  var gaps=config.questions.filter(function(q){return Number(data.get(q[0]))<2;});
  var heading=score>=10?"Several foundations appear to be in place":score>=6?"There are some foundations to build on":"Start with a few practical essentials";
  var summary=score>=10?"Your answers suggest the basics are reasonably established. Validate the journey with customer feedback and choose one improvement to test.":score>=6?"Your answers suggest a mix of strengths and possible friction. Focus on the gaps most likely to affect your customers.":"Your answers suggest it may help to clarify the fundamentals before adding more channels, tools or complexity.";
  result.textContent="";
  var h=document.createElement("h3");h.textContent=heading;
  var p=document.createElement("p");p.textContent=summary+" Self-assessment score: "+score+" out of 12.";
  var strong=document.createElement("strong");strong.textContent="Suggested priorities";
  var ul=document.createElement("ul");
  var priorities=gaps.length?gaps.map(function(q){return config.priorities[config.questions.indexOf(q)];}):["Ask a small number of customers to describe what works well and where they experience friction.","Choose one measurable improvement, record a baseline where possible and review the result before making more changes."];
  priorities.forEach(function(item){var li=document.createElement("li");li.textContent=item;ul.appendChild(li);});
  var note=document.createElement("p");note.textContent="This is a directional result based on your answers, not a technical or commercial audit. Validate priorities against real customer feedback and available evidence.";
  var context="I completed the "+config.title+". My self-assessment score was "+score+"/12. Areas to review: "+(priorities.join(" "));
  var link=document.createElement("a");link.className="experience-btn";link.href="/contact?service="+encodeURIComponent(config.service)+"&context="+encodeURIComponent(context);link.textContent="Discuss these priorities with MarketCentaur";
  var secondary=document.createElement("a");secondary.className="experience-btn secondary";secondary.href="/";secondary.textContent="Back to homepage";
  var capture=buildEmailCapture(config.title,score,priorities);
  result.append(h,p,strong,ul,capture,note,link,document.createTextNode(" "),secondary);result.hidden=false;result.scrollIntoView({behavior:"smooth",block:"nearest"});
 });
}

document.addEventListener("DOMContentLoaded",function(){initFinder();initExplorer();initReadiness();initGrowthCheck();});
})();