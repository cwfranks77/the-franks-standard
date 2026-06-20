import{B as n}from"./BIVREZUd.js";const i="https://www.bcpoweraudio.com",_="bcMarketingAutomation",b="bc-marketing-queue-v1",h="bc-visibility-progress-v1",r={youtube_studio:"https://studio.youtube.com/channel/UC/videos/upload?d=ud",tiktok:"https://www.tiktok.com/upload",instagram:"https://www.instagram.com/",facebook:"https://www.facebook.com/",linkedin:"https://www.linkedin.com/post/new/",search_console:"https://search.google.com/search-console",bing:"https://www.bing.com/webmasters",google_business:"https://business.google.com/",google_ads:"https://ads.google.com/",lob_postcards:"https://dashboard.lob.com/register",lob_dashboard:"https://dashboard.lob.com/",capcut:"https://www.capcut.com/",canva_video:"https://www.canva.com/create/videos/",stripe_dashboard:"https://dashboard.stripe.com/",stripe_payouts:"https://dashboard.stripe.com/payouts",mercury_dashboard:"https://app.mercury.com/"},m=[{hook:"Competition-grade bass without the markup games",body:"Screen record bcpoweraudio.com catalog — subwoofers, amps, staging gear dropship to your door.",cta:"/bc-audio/catalog",topic:"catalog"},{hook:"Wholesale audio pricing — authorized distribution",body:"Show department filter: home, car, marine, Bluetooth. MSRP visible. Checkout on site.",cta:"/",topic:"wholesale"},{hook:"Open Door policy — talk to the owner",body:"Walk through /bc-audio/open-door — toll-free support, real fulfillment.",cta:"/bc-audio/open-door",topic:"support"},{hook:"Before you buy speakers online…",body:"Compare authorized SKUs vs gray market. Petra fulfillment. Louisiana-based dealer.",cta:"/bc-audio/catalog",topic:"trust"}],I=[{id:"google-search-console",label:"Google Search Console",why:"Get bcpoweraudio.com indexed in Google search.",url:r.search_console,steps:`Add ${i} → verify → submit sitemap ${i}/sitemap.xml → request indexing for / and /bc-audio/catalog`},{id:"bing-webmaster",label:"Bing Webmaster Tools",why:"Bing and Yahoo search visibility.",url:r.bing,steps:"Import from Google or add site manually → submit same sitemap"},{id:"google-business",label:"Google Business Profile",why:"Local and brand search for B&C Performance Audio LLC.",url:r.google_business,steps:"List B&C Performance Audio · website bcpoweraudio.com · phone (833) 722-4147"},{id:"youtube-channel",label:"YouTube channel",why:"Shorts demo product installs and catalog walkthroughs.",url:"https://www.youtube.com/",steps:"Create channel → link bcpoweraudio.com → upload Shorts from AI Video Ad Builder below"},{id:"google-ads",label:"Google Ads",why:"Paid search for car audio, subwoofers, marine speakers.",url:r.google_ads,steps:"Keywords: competition subwoofer, car audio wholesale, marine amplifier — link to catalog"},{id:"facebook-instagram",label:"Facebook & Instagram",why:"Car audio enthusiasts and install shops scroll Reels daily.",url:r.facebook,steps:"Post Reels with catalog link · use caption from weekly queue"},{id:"radio-local",label:"Local radio / car audio podcast",why:"SWLA stations and install podcasts need short dealer spots.",url:"mailto:bc-audio@thefranksstandard.com",steps:"Copy radio pitch below → email program director"}],w=[{slot:"mon-linkedin",dayOffset:0,dayLabel:"Monday",kind:"social",platform:"linkedin",title:"LinkedIn — authorized dealer post"},{slot:"tue-tiktok",dayOffset:1,dayLabel:"Tuesday",kind:"social",platform:"tiktok",title:"TikTok — bass demo Short"},{slot:"wed-instagram",dayOffset:2,dayLabel:"Wednesday",kind:"social",platform:"instagram",title:"Instagram Reel — catalog walkthrough"},{slot:"thu-facebook",dayOffset:3,dayLabel:"Thursday",kind:"social",platform:"facebook",title:"Facebook — install shop offer"},{slot:"fri-youtube",dayOffset:4,dayLabel:"Friday",kind:"social",platform:"youtube",title:"YouTube Short — product highlight"},{slot:"mon-email",dayOffset:0,dayLabel:"Monday",kind:"email",title:"Email — install shop outreach"},{slot:"wed-seo",dayOffset:2,dayLabel:"Wednesday",kind:"seo",title:"SEO — request indexing"}],c={linkedin:`${n.full} — authorized wholesale distribution for competition-grade audio.

Home · car · marine · Bluetooth — browse the live catalog, MSRP shown, dropship fulfillment.

${i}/bc-audio/catalog

#caraudio #subwoofer #marineaudio #competitionaudio`,tiktok:`POV: you found authorized competition audio without the runaround 🔊

${n.full} — subwoofers, amps, staging. Ships to your door.

${i}

#caraudio #bass #competitionaudio #subwoofer`,instagram:`Competition-grade sound — authorized dealer network 🏁

Browse departments → checkout on ${i.replace("https://","")}

#BCPerformanceAudio #CarAudio #Subwoofer #MarineAudio #CompetitionGrade`,facebook:`${n.full} — your authorized distribution center for serious sound.

Open catalog: ${i}/bc-audio/catalog
Questions? Call (833) 722-4147`,youtube:`Title: ${n.full} — Competition Audio Catalog Tour

Description: Authorized wholesale portal for subwoofers, amplifiers, marine and car audio. Browse ${i}

Tags: car audio, subwoofer, competition bass, B&C Performance Audio`},g=`Hi {{name}},

I'm with ${n.full} — authorized wholesale distribution for competition-grade subwoofers, amplifiers, and staging gear.

• Live catalog with MSRP and dropship checkout
• Home, car, marine, and Bluetooth departments
• Open-door owner support: (833) 722-4147

Browse: ${i}/bc-audio/catalog

— B&C Performance Audio LLC
${i}

Reply STOP to opt out.`,O=`${n.full.toUpperCase()}
AUTHORIZED COMPETITION AUDIO

Subwoofers · Amps · Marine · Car · Bluetooth
Browse catalog · Dropship checkout

${i}
(833) 722-4147`,L=`Subject: 60-second spot — local competition audio dealer

Hi [Program Director],

${n.full} is a Louisiana authorized distribution portal for competition subwoofers, amplifiers, and car/marine audio — with real checkout at bcpoweraudio.com.

I'd love a 60-second live read or pre-recorded spot for your listeners who install or upgrade car audio.

Phone: (833) 722-4147
Site: ${i}

Thank you,
B&C Performance Audio LLC`,$=[{id:"youtube",label:"YouTube Studio",url:r.youtube_studio},{id:"tiktok",label:"TikTok",url:r.tiktok},{id:"instagram",label:"Instagram",url:r.instagram},{id:"facebook",label:"Facebook",url:r.facebook}];function p(o=new Date){const e=new Date(o);e.setHours(12,0,0,0);const s=e.getDay(),a=s===0?-6:1-s;return e.setDate(e.getDate()+a),e}function u(o){return o.toISOString().slice(0,10)}function f(o=new Date){return u(p(o))}function C(o){return c[o]||c.facebook}function S(o,e){const s=new Date(e);s.setDate(s.getDate()+o.dayOffset);const a=u(s),t=`${f(e)}-${o.slot}`;return o.kind==="email"?{id:t,slot:o.slot,kind:"email",dayLabel:o.dayLabel,scheduledDate:a,title:o.title,status:"pending",postedAt:null,bodyTemplate:g,notes:"Only email shops/installers who gave permission to contact them."}:o.kind==="seo"?{id:t,slot:o.slot,kind:"seo",dayLabel:o.dayLabel,scheduledDate:a,title:o.title,status:"pending",postedAt:null,checklist:[`Search Console → request indexing for ${i}/`,`Request indexing for ${i}/bc-audio/catalog`,`Submit sitemap ${i}/sitemap.xml`]}:{id:t,slot:o.slot,kind:"social",dayLabel:o.dayLabel,scheduledDate:a,platform:o.platform,title:o.title,caption:C(o.platform),platformUrl:r[o.platform]||r.facebook,status:"pending",postedAt:null}}function A(o=p()){const e=p(o);return{version:1,weekId:f(e),weekStart:u(e),generatedAt:new Date().toISOString(),brand:n.full,tasks:w.map(s=>S(s,e))}}function D(o,e){if(!o?.tasks?.length)return e;const s=Object.fromEntries(o.tasks.map(a=>[a.slot,{status:a.status,postedAt:a.postedAt}]));return{...e,tasks:e.tasks.map(a=>{const t=s[a.slot];return!t||t.status==="pending"?a:{...a,status:t.status,postedAt:t.postedAt}})}}function T(o){const e=o?.tasks||[],s=e.length,a=e.filter(d=>d.status==="posted").length,t=e.filter(d=>d.status==="skipped").length,l=e.filter(d=>d.status==="pending").length,k=u(new Date),y=e.filter(d=>d.scheduledDate===k&&d.status==="pending");return{total:s,posted:a,skipped:t,pending:l,dueToday:y,pct:s?Math.round(a/s*100):0}}function v(){try{return JSON.parse(localStorage.getItem(b)||"null")}catch{return null}}function P(o){o&&localStorage.setItem(b,JSON.stringify(o))}function E(){try{return JSON.parse(localStorage.getItem(h)||"{}")}catch{return{}}}function R(o){localStorage.setItem(h,JSON.stringify(o))}function x({name:o="there",email:e=""}){const s=encodeURIComponent(`${n.full} — authorized catalog for your shop`),a=g.replace(/\{\{name\}\}/g,o.trim()||"there"),t=e.trim();return t?`mailto:${encodeURIComponent(t)}?subject=${s}&body=${encodeURIComponent(a)}`:`mailto:?subject=${s}&body=${encodeURIComponent(a)}`}function N(o=0){const e=m[o]||m[0],s=`${i}${e.cta.startsWith("/")?e.cta:`/${e.cta}`}`,a=[`[0–3s HOOK] ${e.hook}`,`[3–15s] ${e.body}`,`[15–25s] Show ${i} on phone — department filter + add to cart`,`[25–30s CTA] ${n.full} · ${s} · (833) 722-4147`].join(`
`),t=[{sec:"0–3",visual:"Bold hook text on dark background",audio:e.hook},{sec:"3–15",visual:"Screen record catalog or product close-up",audio:e.body},{sec:"15–25",visual:`Phone on ${i} — filter + cart`,audio:"Authorized dealer · dropship checkout"},{sec:"25–30",visual:"B&C logo + URL + (833) 722-4147",audio:"Shop competition audio today"}],l=c.tiktok.replace(i,s);return{title:e.hook,script:a,scenes:t,caption:l,ctaUrl:s,editTools:[{label:"CapCut (free)",url:r.capcut},{label:"Canva video",url:r.canva_video}],postLinks:$}}function U(o){return(o?.tasks||[]).filter(e=>e.kind==="social"&&e.status==="pending").map(e=>`--- ${e.dayLabel} · ${e.title} ---
${e.caption}`).join(`

`)}function M(o=[]){let e=0;const s=[];for(const t of o){const l=Number(t?.order?.amount_total_cents||t?.order?.total_cents||0);Number.isFinite(l)&&(e+=l),s.push({id:t?.order_id||t?.id||"—",email:t?.order?.buyer_email||"—",status:t?.provider_status||"queued",updated:t?.updated_at||"—",product:t?.listing?.title||"B&C order",amount:Number.isFinite(l)?`$${(l/100).toFixed(2)}`:"—",amountCents:Number.isFinite(l)?l:0})}const a=Math.round(e*.25);return{count:o.length,grossDisplay:`$${(e/100).toFixed(2)}`,grossCents:e,taxReserveDisplay:`$${(a/100).toFixed(2)}`,taxReserveCents:a,operatingDisplay:`$${((e-a)/100).toFixed(2)}`,lines:s}}function z(o,e=n.full){const s=[`${e} — order & tax prep summary`,`Generated: ${new Date().toLocaleString()}`,`Orders: ${o.count}`,`Gross checkout total (Stripe): ${o.grossDisplay}`,`25% business income tax reserve (set aside): ${o.taxReserveDisplay}`,`Operating balance after reserve: ${o.operatingDisplay}`,"","Bank deposits: Stripe Dashboard → Payouts → match payout date to orders below.","Mercury vault: app.mercury.com — business funds only (no personal checking).",""].join(`
`),a=o.lines.map(t=>`${t.updated}	${t.id}	${t.product}	${t.amount}	${t.status}	${t.email}`).join(`
`);return`${s}Date	Order	Product	Amount	Status	Email
${a}

Louisiana destination tax applies at checkout by shipping zip. Keep this printout with your tax records.`}export{r as B,p as a,_ as b,v as c,P as d,U as e,O as f,A as g,L as h,x as i,I as j,m as k,E as l,D as m,R as n,z as o,N as p,T as q,M as s};
