const websiteTypes = [
  {id:"auto", label:"Auto detect", hint:"Let the builder decide"},
  {id:"business", label:"Business / professional", hint:"Finance, SaaS, consulting, agency"},
  {id:"portfolio", label:"Portfolio / creative", hint:"Designer, photographer, artist, personal brand"},
  {id:"event", label:"Event / invitation", hint:"Summit, workshop, wedding, meetup"},
  {id:"ecommerce", label:"Store / e-commerce", hint:"Products, collections, checkout concept"},
  {id:"restaurant", label:"Restaurant / food", hint:"Menu, ambience, reservations"},
  {id:"education", label:"Education / course", hint:"Courses, academy, learning pages"},
  {id:"marketplace", label:"Marketplace / service", hint:"Repair, quote, booking, upload"},
  {id:"personal", label:"Personal / emotional", hint:"Tribute, family, memory, celebration"},
  {id:"game", label:"Game / interactive", hint:"Quiz, 2D game, challenge, treasure hunt"},
  {id:"custom", label:"None of the above", hint:"Write your own unique request"}
];

const templates = [
  {id:"auto", name:"Auto select / create", family:"auto", mood:"Chooses the best fit automatically", colors:["#22d3ee","#8b5cf6"], sections:["Auto"]},
  {id:"business-trust", name:"Business Trust Landing", family:"business", mood:"Clean, credible and conversion-focused", colors:["#38bdf8","#d4af37"], sections:["Hero","Proof","Process","Lead form"]},
  {id:"ai-product", name:"AI Product Launch", family:"business", mood:"Futuristic, technical and sharp", colors:["#06b6d4","#8b5cf6"], sections:["Agent workflow","Use cases","Demo CTA"]},
  {id:"portfolio-gallery", name:"Portfolio Gallery", family:"portfolio", mood:"Visual, expressive and project-led", colors:["#fb7185","#c084fc"], sections:["Gallery","Projects","About","Contact"]},
  {id:"event-summit", name:"Event / Summit", family:"event", mood:"Agenda-led, energetic and speaker-focused", colors:["#facc15","#38bdf8"], sections:["Speakers","Agenda","Registration"]},
  {id:"wedding-invite", name:"Elegant Invitation", family:"event", mood:"Romantic, graceful and RSVP-focused", colors:["#d6b46a","#fb7185"], sections:["Story","Details","RSVP"]},
  {id:"storefront", name:"Storefront Catalog", family:"ecommerce", mood:"Product-first and commercial", colors:["#f97316","#facc15"], sections:["Collections","Products","Checkout demo"]},
  {id:"restaurant-menu", name:"Restaurant Menu", family:"restaurant", mood:"Warm, sensory and hospitality-led", colors:["#fb923c","#facc15"], sections:["Menu","Gallery","Reservation"]},
  {id:"academy", name:"Course Academy", family:"education", mood:"Structured, motivating and outcome-led", colors:["#60a5fa","#facc15"], sections:["Curriculum","Mentors","Enroll"]},
  {id:"service-marketplace", name:"Service Marketplace", family:"marketplace", mood:"Practical, operational and action-driven", colors:["#f97316","#38bdf8"], sections:["Quote flow","Upload","Booking"]},
  {id:"personal-story", name:"Personal Story Page", family:"personal", mood:"Warm, memory-led and emotional", colors:["#fb7185","#facc15"], sections:["Story","Gallery","Message"]},
  {id:"quiz-game", name:"Quiz / Game Page", family:"game", mood:"Playful, interactive and colourful", colors:["#22d3ee","#facc15"], sections:["Quiz","Score","Reward"]}
];

const backendOptions = ["Lead capture","Booking","RSVP","Guestbook/wishes","Newsletter","Demo payment","Upload metadata","Email alerts","Admin export"];
const examples = [
  {label:"AI SaaS", type:"business", template:"ai-product", prompt:"Create a modern website for an AI workflow automation product with use cases, integrations, demo CTA and clean technical design."},
  {label:"Portfolio", type:"portfolio", template:"portfolio-gallery", prompt:"Create a visual portfolio website for a designer with project gallery, case studies, about section and contact."},
  {label:"Event", type:"event", template:"event-summit", prompt:"Create an event website for an AI investing summit with speakers, agenda, registration and sponsor sections."},
  {label:"Restaurant", type:"restaurant", template:"restaurant-menu", prompt:"Create a restaurant website with warm food visuals, signature menu, ambience gallery and reservation section."},
  {label:"Service", type:"marketplace", template:"service-marketplace", prompt:"Create a drone repair service marketplace where users request quotes, upload damage photos and book pickup slots."},
  {label:"Game", type:"game", template:"quiz-game", prompt:"Create an interactive quiz and mini-game website with score tracking, levels and a reward reveal."}
];

let state = {
  tab:"preview",
  selectedType:"auto",
  selectedTemplate:"auto",
  backend:["Lead capture","Admin export"],
  uploadedImages:[],
  madeThings:[],
  latestHtml:"",
  latestSource:"Local fallback",
  latestMeta:""
};

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

function toast(msg){ const t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),3500); }

function init(){
  renderNav();
  renderTypes();
  renderTemplates();
  renderBackend();
  renderExamples();
  renderSpecialQuick();
  bindEvents();
  generateLocal();
}

function renderNav(){
  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.onclick=()=>showTab(btn.dataset.tab);
  });
}

function showTab(tab){
  state.tab=tab;
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));
  $(`tab-${tab}`)?.classList.add("active");
}

function renderTypes(){
  $("typeGrid").innerHTML = websiteTypes.map(t=>`
    <button class="type-card ${state.selectedType===t.id?'active':''}" data-type="${t.id}">
      <strong>${esc(t.label)}</strong><span>${esc(t.hint)}</span>
    </button>`).join("");
  document.querySelectorAll(".type-card").forEach(btn=>{
    btn.onclick=()=>{state.selectedType=btn.dataset.type; renderTypes(); updateStats();};
  });
}

function renderTemplates(){
  const q = $("templateSearch")?.value?.toLowerCase() || "";
  const list = templates.filter(t => !q || [t.name,t.family,t.mood,...t.sections].join(" ").toLowerCase().includes(q));
  $("templateGrid").innerHTML = list.map(t=>`
    <button class="template-card ${state.selectedTemplate===t.id?'active':''}" data-template="${t.id}">
      <div class="template-thumb" style="--a:${t.colors?.[0]||'#22d3ee'};--b:${t.colors?.[1]||'#8b5cf6'}">${esc(t.family)}</div>
      <h3>${esc(t.name)}</h3><p>${esc(t.mood)}</p><small>${esc(t.sections.join(" · "))}</small>
    </button>`).join("");
  document.querySelectorAll(".template-card").forEach(btn=>{
    btn.onclick=()=>{state.selectedTemplate=btn.dataset.template; renderTemplates(); updateStats();};
  });
}

function renderBackend(){
  $("backendChips").innerHTML = backendOptions.map(x=>`<button class="chip ${state.backend.includes(x)?'active':''}" data-backend="${x}">${x}</button>`).join("");
  document.querySelectorAll("[data-backend]").forEach(btn=>{
    btn.onclick=()=>{ const v=btn.dataset.backend; state.backend = state.backend.includes(v)?state.backend.filter(x=>x!==v):[...state.backend,v]; renderBackend(); renderFeatureTags(); };
  });
  renderFeatureTags();
}

function renderFeatureTags(){
  $("featureTags").innerHTML = state.backend.map(x=>`<span>${esc(x)}</span>`).join("") || "<span>No backend features selected</span>";
}

function renderExamples(){
  $("exampleList").innerHTML = examples.map(e=>`<button data-example="${e.label}">${e.label}</button>`).join("");
  document.querySelectorAll("[data-example]").forEach(btn=>{
    btn.onclick=()=>{
      const e = examples.find(x=>x.label===btn.dataset.example);
      $("promptInput").value=e.prompt; state.selectedType=e.type; state.selectedTemplate=e.template;
      renderTypes(); renderTemplates(); generate();
    };
  });
}

function renderSpecialQuick(){
  const qs = ["Add countdown","Add surprise reveal","Use more photos","Make it premium","Make it playful","Add WhatsApp share","Add FAQ","Add testimonials"];
  $("specialQuickList").innerHTML = qs.map(q=>`<button data-special="${q}">${q}</button>`).join("");
  document.querySelectorAll("[data-special]").forEach(btn=>{
    btn.onclick=()=>{ $("specialInput").value = ($("specialInput").value + "\n" + btn.dataset.special).trim(); };
  });
}

function bindEvents(){
  $("generateBtn").onclick = generate;
  $("briefGenerateBtn").onclick = generate;
  $("specialGenerateBtn").onclick = generate;
  $("madeGenerateBtn").onclick = generateMade;
  $("gameGenerateBtn").onclick = generateGame;
  $("copyHtmlBtn").onclick = async()=>{ await navigator.clipboard.writeText(state.latestHtml); toast("HTML copied"); };
  $("downloadHtmlBtn").onclick = downloadHtml;
  $("testAiBtn").onclick = testAI;
  $("templateSearch").oninput = renderTemplates;
  $("photoInput").onchange = loadPhotos;
  $("addMadeThingBtn").onclick = addMadeThing;
  document.querySelectorAll(".preset-btn").forEach(btn=>btn.onclick=()=>loadPreset(btn.dataset.preset));
}

function updateStats(){
  $("statMode").textContent = state.selectedType || "Website";
  const t = templates.find(x=>x.id===state.selectedTemplate);
  $("statTemplate").textContent = t?.name || "Auto";
  $("statPhotos").textContent = state.uploadedImages.length;
  $("statAI").textContent = state.latestSource.includes("AI") ? "AI active" : "Fallback ready";
}

function currentTemplate(){
  if(state.selectedTemplate && state.selectedTemplate !== "auto") return templates.find(t=>t.id===state.selectedTemplate);
  if(state.selectedType && state.selectedType !== "auto") return templates.find(t=>t.family===state.selectedType) || templates[0];
  const p = $("promptInput").value.toLowerCase();
  if(/restaurant|food|menu/.test(p)) return templates.find(t=>t.family==="restaurant");
  if(/portfolio|artist|designer|photo/.test(p)) return templates.find(t=>t.family==="portfolio");
  if(/event|summit|wedding|invite/.test(p)) return templates.find(t=>t.family==="event");
  if(/shop|product|store|ecommerce/.test(p)) return templates.find(t=>t.family==="ecommerce");
  if(/game|quiz|interactive|treasure/.test(p)) return templates.find(t=>t.family==="game");
  return templates.find(t=>t.family==="business");
}

async function generate(){
  const btn=$("generateBtn");
  const old=btn.textContent; btn.textContent="Generating...";
  try{
    const ai = await callAI({
      mode:"website",
      prompt:$("promptInput").value,
      audience:$("audienceInput").value,
      style:$("styleInput").value,
      special:$("specialInput").value,
      selectedType:state.selectedType,
      selectedTemplate:currentTemplate()?.name,
      backend:state.backend
    });
    if(ai?.ok){
      state.latestHtml = htmlFromBlueprint(ai.blueprint, currentTemplate());
      state.latestSource="AI via Netlify Function";
    } else {
      generateLocal();
      return;
    }
  } catch(e){
    generateLocal();
    toast("AI unavailable, local fallback used.");
  } finally {
    btn.textContent=old;
  }
  updatePreview();
}

function generateLocal(){
  const t = currentTemplate();
  const prompt = $("promptInput").value;
  state.latestHtml = renderWebsite({title: inferTitle(prompt,t), prompt, template:t, type:state.selectedType, special:$("specialInput").value, images:state.uploadedImages, sections:t.sections});
  state.latestSource="Local fallback";
  updatePreview();
}

function generateMade(){
  const occasion=$("madeOccasion").value || "Special website";
  const recipient=$("madeRecipient").value || "special audience";
  const title=$("madeTitle").value || occasion;
  const story=$("madeStory").value || "A deeply custom website created from a specially made request.";
  const things=state.madeThings.length?state.madeThings:["Story section","Gallery","Interactive section","Final message"];
  const t = {id:"personal-story", name:"Specially Made Custom", family:"personal", mood:"Custom, personal and unique", colors:["#fb7185","#facc15"], sections:things};
  state.latestHtml = renderWebsite({title, prompt:`${story}\nRecipient: ${recipient}`, template:t, type:"personal", special:things.join("\n"), images:state.uploadedImages, sections:things, made:true});
  state.latestSource="Specially Made Local Renderer";
  updatePreview();
  showTab("preview");
}

function generateGame(){
  const prompt=$("gamePrompt").value;
  state.latestHtml = renderGame(prompt, $("gameType").value, $("gameStyle").value);
  state.latestSource="2D Game Renderer";
  updatePreview();
  showTab("preview");
}

async function callAI(payload){
  const res = await fetch("/api/generate-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  if(!res.ok) throw new Error("AI call failed");
  return res.json();
}

async function testAI(){
  try{
    const out = await callAI({mode:"test",prompt:"Return a short website blueprint for a test landing page."});
    toast(out?.ok ? "AI function working" : "AI function returned error");
  }catch(e){ toast("AI not configured yet or function unavailable"); }
}

function htmlFromBlueprint(bp,t){
  const template = t || currentTemplate();
  return renderWebsite({
    title: bp.title || bp.headline || template.name,
    prompt: bp.subheadline || bp.summary || $("promptInput").value,
    template,
    type:template.family,
    special:(bp.specialEffects||[]).join("\n"),
    images:state.uploadedImages,
    sections:(bp.sections||[]).map(s=>s.title || s).slice(0,8)
  });
}

function renderWebsite({title,prompt,template,type,special,images,sections,made=false}){
  const colors = template?.colors || ["#22d3ee","#8b5cf6"];
  const gallery = images.length ? images : [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80"
  ];
  const sectionHtml = (sections||[]).map((s,i)=>sectionBlock(s,i,gallery, made)).join("");
  const specialHtml = special ? customSpecialSections(special,gallery) : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
  :root{--a:${colors[0]};--b:${colors[1]};--dark:#07101f;--text:#fff}*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:radial-gradient(circle at top right,var(--a),transparent 30%),linear-gradient(135deg,#07101f,#111b3d);color:var(--text)}nav{position:sticky;top:0;z-index:5;background:rgba(7,16,31,.72);backdrop-filter:blur(16px);padding:16px 32px;display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.12)}nav strong{font-size:20px}.hero{min-height:86vh;display:grid;place-items:center;text-align:center;padding:60px 24px}.hero h1{font-size:clamp(44px,8vw,96px);line-height:.95;margin:0 0 16px;letter-spacing:-.05em}.lead{font-size:clamp(19px,2.4vw,28px);max-width:880px;line-height:1.5;color:#dbeafe}.btn{display:inline-block;border:0;border-radius:999px;background:#facc15;color:#111827;padding:14px 22px;font-weight:900;text-decoration:none;margin:8px;cursor:pointer}.ghost{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.2)}section{padding:76px clamp(18px,5vw,64px)}.heading{text-align:center;max-width:850px;margin:0 auto 28px}.heading h2{font-size:clamp(34px,5vw,64px);margin:0 0 10px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:1180px;margin:auto}.card{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.16);border-radius:28px;padding:24px;backdrop-filter:blur(14px);box-shadow:0 20px 60px rgba(0,0,0,.18)}.card h3{font-size:26px;margin:0 0 8px;color:#facc15}.gallery{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:220px;gap:14px;max-width:1120px;margin:auto}.tile{border-radius:24px;overflow:hidden}.tile:nth-child(2){grid-row:span 2}.tile:nth-child(3){grid-column:span 2}.tile img{width:100%;height:100%;object-fit:cover}.reveal{display:none;margin-top:16px;background:rgba(255,255,255,.16);border-radius:20px;padding:18px}.countdown{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.countdown div{text-align:center;background:rgba(255,255,255,.1);border-radius:18px;padding:16px}.countdown strong{display:block;font-size:34px;color:#facc15}@media(max-width:900px){.grid,.gallery{grid-template-columns:1fr}.tile:nth-child(2),.tile:nth-child(3){grid-column:auto;grid-row:auto}.countdown{grid-template-columns:repeat(2,1fr)}} </style></head><body>
  <nav><strong>${esc(title)}</strong><span>${esc(template?.name||"Template")}</span></nav>
  <header class="hero"><div><p>${esc(template?.mood||"Generated website")}</p><h1>${esc(title)}</h1><p class="lead">${esc(prompt)}</p><a class="btn" href="#content">Explore</a><button class="btn ghost" onclick="alert('Demo interaction ready')">Try interaction</button></div></header>
  <main id="content">${sectionHtml}${specialHtml}${gallerySection(gallery)}</main>
  <script>function reveal(id){document.getElementById(id).style.display='block'}</script></body></html>`;
}

function sectionBlock(s,i,imgs){
  const low=String(s).toLowerCase();
  if(/gallery|photo|image|montage|portfolio/.test(low)) return gallerySection(imgs, s);
  if(/quiz|game|interactive|score/.test(low)) return `<section><div class="heading"><h2>${esc(s)}</h2><p>Interactive quiz block with placeholder questions.</p></div><div class="card" style="max-width:900px;margin:auto"><h3>Question 1</h3><p>Edit this quiz question later.</p><button class="btn" onclick="alert('Correct!')">Check answer</button></div></section>`;
  if(/countdown|timer/.test(low)) return `<section><div class="heading"><h2>${esc(s)}</h2></div><div class="card" style="max-width:900px;margin:auto"><div class="countdown"><div><strong>7</strong><span>Days</span></div><div><strong>12</strong><span>Hours</span></div><div><strong>45</strong><span>Minutes</span></div><div><strong>20</strong><span>Seconds</span></div></div></div></section>`;
  if(/reveal|surprise|gift|secret/.test(low)) return `<section><div class="card" style="max-width:900px;margin:auto;text-align:center"><h2>${esc(s)}</h2><p>Click to reveal a custom message.</p><button class="btn" onclick="reveal('rev${i}')">Open reveal</button><div class="reveal" id="rev${i}">Surprise section created from your request.</div></div></section>`;
  return `<section><div class="heading"><h2>${esc(s)}</h2><p>Purpose-specific section generated for this website.</p></div><div class="grid"><div class="card"><h3>Overview</h3><p>Designed around the prompt.</p></div><div class="card"><h3>Details</h3><p>Clear content block.</p></div><div class="card"><h3>Action</h3><p>Call-to-action area.</p></div></div></section>`;
}

function gallerySection(imgs,title="Visual Gallery"){
  return `<section><div class="heading"><h2>${esc(title)}</h2><p>Images can come from uploaded media or template defaults.</p></div><div class="gallery">${imgs.map(src=>`<div class="tile"><img src="${src}"></div>`).join("")}</div></section>`;
}

function customSpecialSections(text,imgs){
  return text.split(/\n+/).filter(Boolean).map((line,i)=>sectionBlock(line,i+20,imgs)).join("");
}

function renderGame(prompt,type,style){
  const dark=style!=="cute";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2D Game</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:${dark?"#08051f":"#fff7ed"};color:${dark?"white":"#2d1648"};font-family:Inter,system-ui;padding:20px}.wrap{max-width:1000px;width:100%;text-align:center}.panel{background:${dark?"rgba(255,255,255,.09)":"white"};border-radius:28px;padding:20px;box-shadow:0 22px 70px #0003}h1{font-size:clamp(40px,7vw,82px);line-height:.95}canvas{width:100%;max-width:820px;background:${dark?"#101b45":"#dbeafe"};border-radius:24px;border:3px solid ${dark?"#22d3ee":"#fb7185"}}button{border:0;background:#facc15;border-radius:999px;padding:12px 18px;font-weight:900;margin:8px}</style></head><body><div class="wrap"><h1>${esc(inferTitle(prompt,{name:"2D Game"}))}</h1><p>${esc(prompt)}</p><div class="panel"><canvas id="g" width="820" height="440"></canvas><p>Type: ${esc(type)} | Score: <strong id="score">0</strong> | Lives: <strong id="lives">3</strong></p><button onclick="start()">Start</button><button onclick="reset()">Reset</button></div></div><script>const c=document.getElementById('g'),x=c.getContext('2d');let p={x:380,y:370,w:70,h:28},items=[],score=0,lives=3,run=false,keys={};document.onkeydown=e=>keys[e.key]=true;document.onkeyup=e=>keys[e.key]=false;function draw(){x.clearRect(0,0,c.width,c.height);x.fillStyle='${dark?"#101b45":"#dbeafe"}';x.fillRect(0,0,c.width,c.height);x.fillStyle='#facc15';x.fillRect(p.x,p.y,p.w,p.h);x.font='26px serif';items.forEach(o=>x.fillText(o.bad?'💣':'⭐',o.x,o.y))}function loop(){if(!run)return;if(keys.ArrowLeft||keys.a)p.x-=8;if(keys.ArrowRight||keys.d)p.x+=8;p.x=Math.max(0,Math.min(c.width-p.w,p.x));if(Math.random()<.04)items.push({x:Math.random()*780,y:-20,s:2+Math.random()*4,bad:Math.random()<.25});items.forEach(o=>o.y+=o.s);items=items.filter(o=>{if(o.y>p.y&&o.x>p.x-20&&o.x<p.x+p.w){o.bad?lives--:score+=10;document.getElementById('score').textContent=score;document.getElementById('lives').textContent=lives;if(lives<=0){run=false;alert('Game over')}return false}return o.y<470});draw();requestAnimationFrame(loop)}function start(){if(!run){run=true;loop()}}function reset(){run=false;items=[];score=0;lives=3;p.x=380;document.getElementById('score').textContent=0;document.getElementById('lives').textContent=3;draw()}draw()</script></body></html>`;
}

function inferTitle(prompt,t){
  const q = String(prompt||"").match(/["“](.*?)["”]/);
  if(q) return q[1];
  const called = String(prompt||"").match(/(?:called|named|for)\s+([A-Z][A-Za-z0-9&.\-\s]{1,50})/);
  if(called) return called[1].replace(/\s+(where|with|that)\s+.*/i,"").trim();
  return t?.name || "Generated Website";
}

function loadPhotos(e){
  const files=Array.from(e.target.files||[]);
  if(!files.length) return;
  state.uploadedImages=[];
  files.forEach(file=>{
    const reader=new FileReader();
    reader.onload=ev=>{
      state.uploadedImages.push(ev.target.result);
      renderPhotos();
      updateStats();
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotos(){
  $("photoGrid").innerHTML = state.uploadedImages.map((src,i)=>`<div class="photo-card"><img src="${src}"><div>Image ${i+1}</div></div>`).join("");
}

function addMadeThing(){
  const v=$("madeNewThing").value.trim();
  if(!v) return;
  if(!state.madeThings.includes(v)) state.madeThings.push(v);
  $("madeNewThing").value="";
  renderMadeThings();
}

function renderMadeThings(){
  $("madeThingsList").innerHTML = state.madeThings.map(x=>`<span>${esc(x)}</span>`).join("") || "<span>No custom things yet</span>";
}

function loadPreset(p){
  if(p==="tribute"){ $("madeOccasion").value="Tribute / memory page"; $("madeTitle").value="A Special Tribute"; $("madeStory").value="Create a warm tribute website with personal story, gallery, timeline and final message."; state.madeThings=["Memory timeline","Photo gallery","Personal letter","Final message"]; }
  if(p==="event"){ $("madeOccasion").value="Event invitation"; $("madeTitle").value="You're Invited"; $("madeStory").value="Create a beautiful invitation website with schedule, venue, RSVP and gallery."; state.madeThings=["Event details","Schedule","RSVP section","Gallery"]; }
  if(p==="game"){ $("madeOccasion").value="Special game website"; $("madeTitle").value="The Interactive Quest"; $("madeStory").value="Create an interactive website with quizzes, a mini game, levels, score and final unlock."; state.madeThings=["Quiz levels","Mini game","Score tracking","Final reward reveal"]; }
  if(p==="portfolio"){ $("madeOccasion").value="Creative portfolio"; $("madeTitle").value="Creative Portfolio"; $("madeStory").value="Create a highly visual portfolio with projects, case studies, about and contact."; state.madeThings=["Project gallery","Case studies","About creator","Contact"]; }
  renderMadeThings();
}

function updatePreview(){
  $("previewFrame").srcdoc = state.latestHtml;
  $("codeBox").textContent = state.latestHtml;
  $("previewSource").textContent = state.latestSource;
  $("previewMeta").textContent = state.latestMeta || "Generated from current builder settings.";
  updateStats();
}

function downloadHtml(){
  const blob=new Blob([state.latestHtml],{type:"text/html"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download="generated-website.html"; a.click(); URL.revokeObjectURL(url);
}

init();