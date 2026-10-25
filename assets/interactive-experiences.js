(function(){
"use strict";
var serviceFinder = {
  goals: {
    customers: {
      title: "Find and prioritise the right customers",
      intro: "Start by defining which organisations fit, which people influence a decision, and where focused demand-generation activity may be useful.",
      services: [
        ["Core intelligence","B2B Growth Intelligence","Build a clearer view of target markets, account fit and relevant developments.","/services/b2b-growth-intelligence.html"],
        ["Account focus","Account & Persona Mapping","Turn an ideal-customer profile into a more usable account list and relevant buying-role map.","/services/account-persona-mapping.html"],
        ["Activation","Demand & Revenue Generation","Plan outreach and campaigns around the audience and qualification criteria you have defined.","/services/demand-revenue.html"]
      ]
    },
    conversion: {
      title: "Turn more of the right visits into enquiries",
      intro: "Review the path from visitor intent to a useful next step, then prioritise changes you can test.",
      services: [
        ["First step","Digital Presence","Review messaging, landing-page clarity and conversion paths.","/services/digital-presence.html"],
        ["Activation","Demand & Revenue Generation","Align campaigns and calls to action with audience needs.","/services/demand-revenue.html"],
        ["Measurement","Analytics & Optimisation","Identify useful funnel measures and a practical testing sequence.","/services/analytics-optimisation.html"]
      ]
    },
    market: {
      title: "Understand your market and competitors",
      intro: "Separate observed market developments from assumptions, then decide which questions deserve further research.",
      services: [
        ["Market context","B2B Growth Intelligence","Bring account, market and growth questions into one decision-focused brief.","/services/b2b-growth-intelligence.html"],
        ["Competitive view","Market & Competitor Intelligence","Track relevant competitor activity and assess its possible implications.","/services/market-competitor-intelligence.html"],
        ["Ongoing context","Weekly Growth Signal Watch","Review selected developments over time against agreed priorities.","/services/weekly-growth-signal-watch.html"]
      ]
    },
    partners: {
      title: "Find potential partners and routes to market",
      intro: "Define partner fit first, then build a shortlist and a practical approach for evaluating possible collaborations.",
      services: [
        ["Partner shortlist","Partner & Channel Discovery","Identify and assess potential partners against agreed fit criteria.","/services/partner-channel-discovery.html"],
        ["Market context","B2B Growth Intelligence","Understand the target segment and commercial context around potential partners.","/services/b2b-growth-intelligence.html"],
        ["Activation","Demand & Revenue Generation","Plan co-marketing, referral or channel activation around a clear audience.","/services/demand-revenue.html"]
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
    verify:"Confirm that the roles are current, examine the team's stated remit, and compare the organisation with your agreed account-fit criteria.",
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
 var goal="customers", type="both";
 function render(){
  var item=serviceFinder.goals[goal];
  if(type==="B2C" && goal==="customers") item={
    title:"Reach and convert the right customer audiences",
    intro:"For B2C goals, start with audience clarity and a relevant customer journey, then align campaigns with the action you want people to take.",
    services:[
      ["Audience & offer","Strategy & Growth","Clarify priority audiences, positioning and the customer problem your offer addresses.","/services/strategy-growth.html"],
      ["Digital journey","Digital Presence","Review the website, landing pages and discovery paths that help visitors understand the offer.","/services/digital-presence.html"],
      ["Activation","Demand & Revenue Generation","Plan campaigns and acquisition activity around the audience, message and conversion goal.","/services/demand-revenue.html"]
    ]
  };
  if((type==="small-local" || type==="retail-ecommerce" || type==="traditional") && goal==="customers"){
    var profiles={
      "small-local":{
        title:"Bring more relevant customers to your local business",
        intro:"Start with local discovery, a clear offer, trustworthy business information and a simple path from search or social media to enquiry or visit.",
        services:[
          ["Local discovery","Local Visibility & Digital Presence","Improve the clarity of your website, local search presence and customer contact paths.","/services/small-business-local-growth.html"],
          ["Customer reach","Social Media & Content","Plan useful social content and local promotions around your customers and community.","/services/content-creative.html"],
          ["Enquiries & visits","Demand & Revenue Generation","Connect campaigns, offers and calls to action to a practical enquiry or store-visit goal.","/services/demand-revenue.html"]
        ]
      },
      "retail-ecommerce":{
        title:"Turn product discovery into store visits and online orders",
        intro:"Connect product presentation, social content, search visibility and the purchase journey across your retail store or ecommerce shop.",
        services:[
          ["Product discovery","Ecommerce & Digital Presence","Improve product messaging, search visibility and the journey from product page to purchase.","/services/small-business-local-growth.html"],
          ["Campaigns","Social Media & Content","Plan product-led content, promotions and creator collaborations that fit your audience.","/services/content-creative.html"],
          ["Repeat purchases","Analytics & Optimisation","Identify useful measures and opportunities to improve conversion and customer retention.","/services/analytics-optimisation.html"]
        ]
      },
      "traditional":{
        title:"Modernise marketing without losing what makes your business trusted",
        intro:"For established businesses and traditional industries, begin with customer and market clarity, a practical digital foundation and manageable improvements.",
        services:[
          ["Market understanding","Strategy & Growth","Review customer segments, competitors and the clearest opportunities for growth.","/services/strategy-growth.html"],
          ["Digital foundation","Digital Presence","Improve website clarity, search discoverability and enquiry paths step by step.","/services/small-business-local-growth.html"],
          ["Practical execution","AI & Marketing Automation","Identify appropriate workflow improvements with human review and a realistic implementation scope.","/services/ai-automation.html"]
        ]
      }
    };
    item=profiles[type];
  }
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
  root.querySelector("[data-finder-context]").textContent="Selected audience: "+typeText+". These are starting points to consider, not a guarantee of results; the best mix depends on your offer, market and available evidence.";
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
   ["followup","Make enquiries easy to complete","Keep forms proportionate and explain what happens after someone submits."]
  ];
  var answered=0;
  questions.forEach(function(q){
   var value=Number(data.get(q[0]));
   if(data.get(q[0])!==null){score+=value;answered++;}
   if(value<2)gaps.push(q[1]+": "+q[2]);
  });
  if(answered<questions.length){result.hidden=false;result.innerHTML="<h3>Finish the quick check</h3><p>Please choose one response for each of the six questions to get a useful summary.</p>";result.scrollIntoView({behavior:"smooth",block:"nearest"});return;}
  var title,summary;
  if(score>=10){title="A solid starting point";summary="Your answers suggest several important basics are in place. Focus next on validating the journey with real visitor behaviour and testing one improvement at a time.";}
  else if(score>=6){title="Some useful foundations, with room to improve";summary="Your answers suggest a few parts of the enquiry journey may be inconsistent. Prioritise the gaps below that create the most friction for your intended audience.";}
  else{title="Start with the essentials";summary="Your answers suggest the enquiry path may need clearer foundations before adding more complexity. Begin with the highest-impact basics below.";}
  result.textContent="";
  var h=document.createElement("h3");h.textContent=title;
  var p=document.createElement("p");p.textContent=summary+" Self-assessment score: "+score+" out of 12.";
  var heading=document.createElement("strong");heading.textContent=gaps.length?"Suggested priorities":"What to do next";
  var ul=document.createElement("ul");
  (gaps.length?gaps:["Review your main conversion path with a small set of users, then choose one measurable improvement to test."]).forEach(function(g){var li=document.createElement("li");li.textContent=g;ul.appendChild(li);});
  var note=document.createElement("p");note.textContent="This is a directional self-check based only on your answers. It does not scan your website, verify accessibility or analytics, or predict enquiry volume. Actual priorities depend on your audience and evidence.";
  var link=document.createElement("a");link.className="experience-btn";link.href="/contact.html";link.textContent="Discuss your website goals";
  result.append(h,p,heading,ul,note,link);result.hidden=false;result.scrollIntoView({behavior:"smooth",block:"nearest"});
 });
}
document.addEventListener("DOMContentLoaded",function(){initFinder();initExplorer();initReadiness();});
})();