let mode = "website";
let uploadedImages = [];
let latestHtml = "";

const preview = document.getElementById("previewFrame");
const promptInput = document.getElementById("promptInput");
const styleInput = document.getElementById("styleInput");
const modeLabel = document.getElementById("modeLabel");
const specialFields = document.getElementById("specialFields");

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;
    modeLabel.textContent = mode === "website" ? "Website mode" : mode === "special" ? "Specially Made mode" : "2D Game mode";
    specialFields.style.display = mode === "website" ? "none" : "block";
    if (mode === "website") promptInput.value = "Create a premium AI website builder landing page with clean design, templates, exports and examples.";
    if (mode === "special") promptInput.value = "Create a colourful Happy Birthday Mama website with photo montage, quiz, cake, love, confetti and vibrant rainbow colours.";
    if (mode === "game") promptInput.value = "Create a 2D game called Star Catcher where the player catches stars, avoids bombs and unlocks a final reward.";
    generateLocalFallback();
  });
});

document.getElementById("photoInput").addEventListener("change", e => {
  uploadedImages = [];
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = event => {
      uploadedImages.push(event.target.result);
      if (uploadedImages.length === files.length) generate();
    };
    reader.readAsDataURL(file);
  });
});

document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(latestHtml);
  alert("Generated HTML copied.");
});

function esc(str){ return String(str || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }


async function generateWithAI(){
  const oldText = document.getElementById("generateBtn").textContent;
  document.getElementById("generateBtn").textContent = "Calling AI...";
  try {
    const response = await fetch("/api/generate-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        prompt: promptInput.value,
        style: styleInput.value
      })
    });

    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "AI call failed");

    latestHtml = aiBlueprintToHtml(data.blueprint, mode);
    preview.srcdoc = latestHtml;
  } catch (error) {
    alert("AI call failed, using local fallback instead: " + error.message);
    generateLocalFallback();
  } finally {
    document.getElementById("generateBtn").textContent = oldText;
  }
}

function aiBlueprintToHtml(bp, currentMode){
  const colors = Array.isArray(bp.colors) && bp.colors.length >= 4 ? bp.colors : ["#08051f","#35d9ff","#ff58c8","#ffd84d"];
  const sections = Array.isArray(bp.sections) ? bp.sections : [];
  const quiz = Array.isArray(bp.quizQuestions) ? bp.quizQuestions : [];
  const game = bp.game || {};

  if (currentMode === "game" || bp.mode === "game") {
    return aiGameHtml(bp, colors, game, quiz);
  }

  const sectionHtml = sections.map((s) => `
    <article class="card">
      <h2>${esc(s.title || "Section")}</h2>
      <p>${esc(s.description || "")}</p>
      <ul>${(s.items || []).map((x)=>`<li>${esc(x)}</li>`).join("")}</ul>
    </article>
  `).join("");

  const quizHtml = quiz.length ? `
    <section class="quiz card">
      <h2>Interactive Quiz</h2>
      ${quiz.map((q,i)=>`<div class="q"><strong>${i+1}. ${esc(q.question)}</strong>${(q.options||[]).map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join("")}</div>`).join("")}
      <button onclick="alert('Quiz placeholder ready. You can add scoring later.')">Check answers</button>
    </section>` : "";

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(bp.title || "AI Website")}</title><style>
    body{margin:0;font-family:Inter,system-ui,sans-serif;background:linear-gradient(135deg,${colors[0]},${colors[1]},${colors[2]},${colors[3]});background-size:350% 350%;animation:bg 12s infinite;color:white}@keyframes bg{50%{background-position:100% 50%}}
    header{min-height:92vh;display:grid;place-items:center;text-align:center;padding:34px}h1{font-size:clamp(46px,8vw,104px);line-height:.95;margin:0 0 16px}.lead{font-size:clamp(20px,2.4vw,28px);max-width:820px;line-height:1.5}
    .btn,button{border:0;border-radius:999px;padding:14px 20px;background:white;color:#111;font-weight:900;cursor:pointer}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;padding:70px clamp(18px,5vw,64px);max-width:1200px;margin:auto}.card{background:rgba(255,255,255,.78);color:#201331;border-radius:28px;padding:24px;box-shadow:0 20px 60px #0002}.q{background:#fff;border-radius:18px;padding:14px;margin:12px 0}.q label{display:block;margin:8px 0}.effect{text-align:center;font-size:clamp(34px,6vw,74px);font-weight:900;animation:bounce 2s infinite}@keyframes bounce{50%{transform:translateY(-10px)}}@media(max-width:800px){.grid{grid-template-columns:1fr}}
  </style></head><body>
    <header><div><p>${esc(bp.theme || "AI generated")}</p><h1>${esc(bp.headline || bp.title || "AI Generated Website")}</h1><p class="lead">${esc(bp.subheadline || "")}</p><button onclick="document.getElementById('sections').scrollIntoView()">Explore</button></div></header>
    <main id="sections" class="grid">${sectionHtml || `<article class="card"><h2>${esc(bp.title || "Generated")}</h2><p>${esc(bp.subheadline || "")}</p></article>`}</main>
    ${quizHtml}
    <section class="card" style="max-width:900px;margin:40px auto"><div class="effect">${(bp.specialEffects||[]).includes("confetti") ? "🎉" : "✨"} ${esc((bp.specialEffects||[])[0] || "Special effect")} ${currentMode === "special" ? "💖" : ""}</div></section>
  </body></html>`;
}

function aiGameHtml(bp, colors, game, quiz){
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(bp.title || "AI Game")}</title><style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at top left,${colors[1]}66,transparent 30%),${colors[0]};color:white;font-family:Inter,system-ui,sans-serif;padding:20px}.wrap{max-width:1000px;width:100%;text-align:center}.panel{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);border-radius:28px;padding:18px}h1{font-size:clamp(38px,7vw,84px);line-height:.95;margin:0 0 12px}canvas{width:100%;max-width:820px;background:linear-gradient(180deg,#09112f,#172554);border-radius:24px;border:3px solid ${colors[1]}}button{border:0;border-radius:999px;background:${colors[3]};padding:12px 18px;font-weight:900;margin:8px;cursor:pointer}.q{text-align:left;background:rgba(255,255,255,.09);padding:12px;border-radius:16px;margin:10px 0}
  </style></head><body><div class="wrap"><h1>${esc(bp.headline || bp.title || "AI 2D Game")}</h1><p>${esc(game.goal || bp.subheadline || "Catch good objects and avoid bad ones.")}</p><div class="panel"><canvas id="g" width="820" height="440"></canvas><p>Score: <strong id="score">0</strong> Lives: <strong id="lives">3</strong></p><button onclick="start()">Start</button><button onclick="reset()">Reset</button></div>${quiz.length ? `<div class="panel" style="margin-top:18px"><h2>Quiz Level</h2>${quiz.slice(0,3).map((q,i)=>`<div class="q"><strong>${i+1}. ${esc(q.question)}</strong></div>`).join("")}</div>` : ""}</div><script>
    const c=document.getElementById('g'),x=c.getContext('2d');let p={x:390,y:370,w:70,h:28},items=[],score=0,lives=3,run=false,keys={};document.onkeydown=e=>keys[e.key]=true;document.onkeyup=e=>keys[e.key]=false;const good='${esc(game.goodEmoji || "⭐")}',bad='${esc(game.badEmoji || "💣")}',player='${esc(game.playerEmoji || "😀")}';
    function draw(){x.clearRect(0,0,c.width,c.height);x.fillStyle='#08112f';x.fillRect(0,0,c.width,c.height);x.font='28px serif';x.fillText(player,p.x+18,p.y+24);x.fillStyle='${colors[3]}';x.fillRect(p.x,p.y,p.w,p.h);items.forEach(o=>x.fillText(o.bad?bad:good,o.x,o.y))}
    function loop(){if(!run)return;if(keys.ArrowLeft||keys.a)p.x-=8;if(keys.ArrowRight||keys.d)p.x+=8;p.x=Math.max(0,Math.min(c.width-p.w,p.x));if(Math.random()<.04)items.push({x:Math.random()*780,y:-20,s:2+Math.random()*4,bad:Math.random()<.25});items.forEach(o=>o.y+=o.s);items=items.filter(o=>{if(o.y>p.y&&o.x>p.x-20&&o.x<p.x+p.w){o.bad?lives--:score+=10;document.getElementById('score').textContent=score;document.getElementById('lives').textContent=lives;if(lives<=0){run=false;alert('Game over')}return false}return o.y<470});draw();requestAnimationFrame(loop)}
    function start(){if(!run){run=true;loop()}}function reset(){run=false;items=[];score=0;lives=3;p.x=390;document.getElementById('score').textContent=0;document.getElementById('lives').textContent=3;draw()}draw();
  </script></body></html>`;
}

function generateLocalFallback(){
  if (mode === "website") latestHtml = websiteHtml(promptInput.value, styleInput.value);
  if (mode === "special") latestHtml = specialHtml(promptInput.value, uploadedImages);
  if (mode === "game") latestHtml = gameHtml(promptInput.value, styleInput.value);
  preview.srcdoc = latestHtml;
}


function generate(){
  generateWithAI();
}

function websiteHtml(prompt, style){
  const premium = style === "premium";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Generated Website</title><style>
  body{margin:0;font-family:Inter,system-ui,sans-serif;background:${premium ? "#f8f4ea" : "#07101f"};color:${premium ? "#2b2118" : "#fff"}}
  header{min-height:80vh;display:grid;place-items:center;text-align:center;padding:40px;background:${premium ? "linear-gradient(135deg,#f8f4ea,#e8d8b6)" : "radial-gradient(circle at top,#35d9ff44,transparent 35%),linear-gradient(135deg,#07101f,#111b3d)"}}
  h1{font-size:clamp(44px,8vw,96px);line-height:.95;margin:0 0 16px}.lead{font-size:22px;max-width:760px;line-height:1.55;color:${premium ? "#5d4c38" : "#cbd5e1"}}
  .btn{display:inline-block;background:${premium ? "#2b2118" : "#ffd84d"};color:${premium ? "#fff" : "#111"};padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:900;margin-top:18px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding:60px;max-width:1200px;margin:auto}.card{padding:24px;border-radius:26px;background:${premium ? "#fff" : "rgba(255,255,255,.08)"};box-shadow:0 20px 70px #0002}@media(max-width:800px){.grid{grid-template-columns:1fr;padding:24px}}</style></head><body>
  <header><div><h1>${esc(prompt.split(" ").slice(0,8).join(" "))}</h1><p class="lead">${esc(prompt)}</p><a class="btn" href="#features">Explore</a></div></header>
  <section id="features" class="grid"><div class="card"><h2>Prompt-led design</h2><p>Generated from your request.</p></div><div class="card"><h2>Templates</h2><p>Different layouts for different website types.</p></div><div class="card"><h2>Export ready</h2><p>Can be shared as static HTML.</p></div></section>
  </body></html>`;
}

function specialHtml(prompt, images){
  const pics = images.length ? images : [
    "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=900&q=80"
  ];
  const imgHtml = pics.map((src,i)=>`<div class="tile ${i===1?'tall':i===2?'wide':''}"><img src="${src}"></div>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Happy Birthday Mama</title><link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;800&family=Pacifico&display=swap" rel="stylesheet"><style>
  body{margin:0;font-family:'Baloo 2',system-ui;background:linear-gradient(135deg,#ff4f9a,#ffd84d,#35d9ff,#9b6cff,#65ffb4);background-size:400% 400%;animation:bg 10s infinite;color:#2d1648}@keyframes bg{50%{background-position:100% 50%}}
  header{min-height:100vh;display:grid;place-items:center;text-align:center;color:white;padding:30px}h1{font-family:Pacifico,cursive;font-size:clamp(58px,11vw,120px);line-height:.9;margin:0 0 18px}.lead{font-size:24px;max-width:780px}
  section{padding:70px 28px}.heading{text-align:center}.heading h2{font-size:clamp(36px,6vw,72px);margin:0 0 12px}.montage{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:220px;gap:14px;max-width:1100px;margin:auto}.tile{border-radius:26px;overflow:hidden;box-shadow:0 16px 50px #0003}.tile.tall{grid-row:span 2}.tile.wide{grid-column:span 2}.tile img{width:100%;height:100%;object-fit:cover}
  .card{max-width:900px;margin:auto;background:#ffffffcc;border-radius:30px;padding:24px;box-shadow:0 20px 60px #0002}.btn{border:0;border-radius:999px;padding:14px 20px;background:white;font-weight:900;cursor:pointer}#msg{font-size:34px;font-weight:900;text-align:center;animation:bounce 2s infinite}@keyframes bounce{50%{transform:translateY(-10px)}}@media(max-width:800px){.montage{grid-template-columns:1fr}.tile.tall,.tile.wide{grid-column:auto;grid-row:auto}}</style></head><body>
  <header><div><h1>Happy Birthday Mama</h1><p class="lead">${esc(prompt)}</p><button class="btn" onclick="document.getElementById('montage').scrollIntoView()">See montage</button></div></header>
  <section><div class="card"><h2>Dear Mama,</h2><p>Thank you for your love, strength and warmth. This is a colourful birthday hug made just for you. You are the heart of the family.</p></div></section>
  <section id="montage"><div class="heading"><h2>Photo Montage</h2><p>Beautiful memories together.</p></div><div class="montage">${imgHtml}</div></section>
  <section><div class="card"><h2>How well do you know Mama?</h2><p>Quiz placeholder: edit these questions later.</p><ol><li>What is Mama's favourite colour?</li><li>What is Mama's favourite food?</li><li>What makes Mama smile most?</li></ol></div></section>
  <section><div class="card"><div id="msg">You're the best mother 💖<br>Happy Birthday 🎂</div><button class="btn" onclick="alert('Happy Birthday Mama! 🎉')">Celebrate</button></div></section>
  </body></html>`;
}

function gameHtml(prompt, style){
  const neon = style !== "cute";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2D Game</title><style>
  body{margin:0;font-family:Inter,system-ui;background:${neon?"#08051f":"#fff7ed"};color:${neon?"white":"#2d1648"};display:grid;place-items:center;min-height:100vh;padding:20px}
  .wrap{max-width:1000px;width:100%;text-align:center}.panel{background:${neon?"rgba(255,255,255,.08)":"white"};border-radius:28px;padding:20px;box-shadow:0 20px 70px #0003}
  h1{font-size:clamp(38px,6vw,72px);line-height:1;margin:0 0 12px}canvas{width:100%;max-width:780px;background:${neon?"linear-gradient(#07101f,#12224f)":"linear-gradient(#e0f2fe,#fff)"};border-radius:24px;border:3px solid ${neon?"#35d9ff":"#ff9f43"}}button{border:0;border-radius:999px;background:${neon?"#ffd84d":"#ff4f9a"};padding:12px 18px;font-weight:900;margin:8px;cursor:pointer}</style></head><body>
  <div class="wrap"><h1>Star Catcher</h1><p>${esc(prompt)}</p><div class="panel"><canvas id="game" width="780" height="420"></canvas><p>Score: <strong id="score">0</strong> Lives: <strong id="lives">3</strong></p><button onclick="start()">Start</button><button onclick="reset()">Reset</button></div></div>
  <script>
  const c=document.getElementById('game'),x=c.getContext('2d');let p={x:360,y:360,w:70,h:28},items=[],score=0,lives=3,run=false,keys={};document.onkeydown=e=>keys[e.key]=true;document.onkeyup=e=>keys[e.key]=false;
  function draw(){x.clearRect(0,0,c.width,c.height);x.fillStyle='${neon?"#07101f":"#dbeafe"}';x.fillRect(0,0,c.width,c.height);x.fillStyle='${neon?"#ffd84d":"#ff4f9a"}';x.fillRect(p.x,p.y,p.w,p.h);x.font='26px serif';items.forEach(o=>x.fillText(o.bad?'💣':'⭐',o.x,o.y));}
  function loop(){if(!run)return;if(keys.ArrowLeft||keys.a)p.x-=8;if(keys.ArrowRight||keys.d)p.x+=8;p.x=Math.max(0,Math.min(c.width-p.w,p.x));if(Math.random()<.04)items.push({x:Math.random()*740,y:-20,s:2+Math.random()*4,bad:Math.random()<.25});items.forEach(o=>o.y+=o.s);items=items.filter(o=>{if(o.y>p.y&&o.x>p.x-20&&o.x<p.x+p.w){o.bad?lives--:score+=10;document.getElementById('score').textContent=score;document.getElementById('lives').textContent=lives;if(lives<=0){run=false;alert('Game over!')}return false}return o.y<450});draw();requestAnimationFrame(loop)}
  function start(){if(!run){run=true;loop()}}function reset(){run=false;items=[];score=0;lives=3;p.x=360;document.getElementById('score').textContent=0;document.getElementById('lives').textContent=3;draw()}draw();
  </script></body></html>`;
}

specialFields.style.display = "block";
generateLocalFallback();
