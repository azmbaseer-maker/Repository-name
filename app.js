const $=s=>document.querySelector(s),uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const KEY="achv_v1";
const RL=[["education","المؤهلات التعليمية"],["experience","الخبرات العملية"],["courses","الدورات التدريبية والشهادات"],["skills","المهارات"],["languages","اللغات"],["awards","الإنجازات والشهادات التقديرية"]];
const mk=(id,label,cats)=>({id,label,cats:cats.map(n=>({id:uid("c-"),name:n,items:[]}))});
function seed(){return{p:{name:"وفاء هارون ناقرو",title:"مسؤولة العهد • مسؤولة النقل المدرسي",school:"المدرسة الثامنة والعشرون",personal:[{id:uid("i"),k:"الاسم",v:"وفاء هارون ناقرو"}],about:"اكتبي هنا نبذة مختصرة عنك: المؤهل، سنوات الخبرة، والمهام.",vision:"اكتبي رؤيتك ورسالتك في العمل.",education:[],experience:[],courses:[],skills:[],languages:[],awards:[]},
S:[mk("s-daily","الأعمال اليومية",["المواظبة","السلوك","النقل المدرسي"]),mk("s-weekly","الأعمال الأسبوعية",["عام"]),mk("s-monthly","الأعمال الشهرية",["عام"]),mk("s-term","الأعمال الفصلية",["عام"]),mk("s-yearly","الأعمال السنوية",["عام"]),mk("s-courses","الدورات التدريبية",["عام"]),mk("s-init","الإنجازات والمبادرات",["عام"]),mk("s-thanks","شهادات الشكر والتقدير",["عام"])]}}
let D;try{D=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!D||!D.S)D=seed();
let mem=false;function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){toast("تعذّر الحفظ: المساحة ممتلئة، قلّلي حجم المرفقات أو صدّري نسخة احتياطية")}}
function toast(t){const e=document.createElement("div");e.className="toast";e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),3200)}
let cur={s:"home",c:null};
const sec=id=>D.S.find(s=>s.id===id);
function go(s,c){cur={s,c:c||null};try{history.replaceState(null,"","#"+s)}catch(e){}menu(false);render();scrollTo(0,0)}
function menu(on){$("#dr").classList.toggle("on",on);$("#ov").classList.toggle("on",on)}
$("#mb").onclick=()=>menu(!$("#dr").classList.contains("on"));$("#ov").onclick=()=>menu(false);
$("#pb").onclick=()=>{if(cur.s!=="home")go("home");setTimeout(()=>{try{print()}catch(e){toast("افتحي الرابط في المتصفح مباشرة ثم اطبعي")}},300)};
function drawer(){$("#dr").innerHTML=`<h3>القائمة الرئيسية</h3><a data-g="home" class="${cur.s==="home"?"cur":""}">الصفحة الرئيسية (السيرة الذاتية)</a>`+D.S.map(s=>`<a data-g="${s.id}" class="${cur.s===s.id?"cur":""}">${esc(s.label)}</a>`).join("")+`<hr><a data-g="settings" class="${cur.s==="settings"?"cur":""}">إدارة المحتوى والإعدادات</a>`;
$("#dr").querySelectorAll("a").forEach(a=>a.onclick=()=>go(a.dataset.g))}
/* ---- forms ---- */
function form(title,fields,vals,ok){const d=$("#dlg");vals=vals||{};
d.innerHTML=`<form method="dialog"><h3>${esc(title)}</h3>`+fields.map(f=>{const v=vals[f.k]??"";
if(f.t==="area")return`<label>${f.l}<textarea name="${f.k}">${esc(v)}</textarea></label>`;
if(f.t==="sel")return`<label>${f.l}<select name="${f.k}">${f.o.map(o=>`<option value="${o[0]}" ${o[0]===v?"selected":""}>${esc(o[1])}</option>`).join("")}</select></label>`;
if(f.t==="files")return`<label>${f.l} (صور أو PDF)<input type="file" name="${f.k}" accept="image/*,application/pdf" multiple></label><div class="th" id="fl"></div>`;
return`<label>${f.l}<input name="${f.k}" type="${f.t||"text"}" value="${esc(v)}"></label>`}).join("")+`<div class="act"><button class="pri" value="ok">حفظ</button><button type="button" id="cx">إلغاء</button></div></form>`;
let files=(vals.files||[]).slice();const fl=()=>{const e=$("#fl");if(e)e.innerHTML=files.map((f,i)=>`<span class="tag">${esc(f.n)} <a data-rm="${i}" style="cursor:pointer;color:var(--dng)">✕</a></span>`).join("");d.querySelectorAll("[data-rm]").forEach(a=>a.onclick=()=>{files.splice(+a.dataset.rm,1);fl()})};fl();
const fi=d.querySelector("input[type=file]");if(fi)fi.onchange=async()=>{for(const f of fi.files)files.push(await pack(f));fi.value="";fl()};
$("#cx").onclick=()=>d.close();
d.querySelector("form").onsubmit=e=>{const o={};new FormData(e.target).forEach((v,k)=>{if(typeof v==="string")o[k]=v.trim()});if(fields.some(f=>f.t==="files"))o.files=files;ok(o)};d.showModal()}
function pack(f){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>{if(f.type.startsWith("image/")){const im=new Image();im.onload=()=>{const k=Math.min(1,1000/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);r({n:f.name,t:"image/jpeg",d:c.toDataURL("image/jpeg",.78)})};im.src=fr.result}else r({n:f.name,t:f.type,d:fr.result})};fr.readAsDataURL(f)})}
async function dl(name,data,type){try{const b=data instanceof Blob?data:new Blob([data],{type});const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}catch(e){toast("تعذّر التنزيل")}}
/* ---- helpers ---- */
const mv=(a,i,d)=>{const j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]]};
const btns=(k,i,n)=>`<div class="act no-print"><button class="sm" data-a="up" data-k="${k}" data-i="${i}" ${i===0?"disabled":""}>▲</button><button class="sm" data-a="dn" data-k="${k}" data-i="${i}" ${i===n-1?"disabled":""}>▼</button><button class="sm" data-a="ed" data-k="${k}" data-i="${i}">تعديل</button><button class="sm dng" data-a="rm" data-k="${k}" data-i="${i}">حذف</button></div>`;
const thumbs=f=>f&&f.length?`<div class="th">`+f.map((x,i)=>x.t.startsWith("image")?`<img src="${x.d}" alt="${esc(x.n)}" data-view="1">`:`<button class="sm" data-pdf="${esc(x.n)}">${esc(x.n)}</button>`).join("")+`</div>`:"";
function rlist(key){const a=D.p[key];if(key==="skills"||key==="languages")return a.length?`<div class="tags">`+a.map((x,i)=>`<span class="tag">${esc(x.title)} <a class="no-print" data-a="ed" data-k="${key}" data-i="${i}" style="cursor:pointer">✎</a><a class="no-print dng" data-a="rm" data-k="${key}" data-i="${i}" style="cursor:pointer;color:var(--dng)"> ✕</a></span>`).join("")+`</div>`:`<div class="empty">لا توجد بيانات بعد.</div>`;
return a.length?a.map((x,i)=>`<div class="it"><div class="bd"><h4>${esc(x.title)}</h4><div class="mut">${[x.sub,x.date].filter(Boolean).map(esc).join(" • ")}</div>${x.text?`<div class="mut">${esc(x.text)}</div>`:""}${thumbs(x.files)}</div>${btns(key,i,a.length)}</div>`).join(""):`<div class="empty">لا توجد بيانات بعد.</div>`}
const rcard=(id,t,body,add)=>`<section class="sec" id="${id}"><h2><span>${t}</span>${add?`<button class="sm no-print" data-a="add" data-k="${add}">+ إضافة</button>`:""}</h2>${body}</section>`;
function home(){const p=D.p;
return`<div class="hero"><small>ملف الإنجاز</small><h1>${esc(p.name)}</h1><p>${esc(p.title)}</p><p>${esc(p.school)}</p></div>
<div class="chips"><a href="#r-personal" data-sc="r-personal">المعلومات الشخصية</a><a data-sc="r-about">نبذة</a>${RL.map(r=>`<a data-sc="r-${r[0]}">${r[1]}</a>`).join("")}<a data-sc="r-vision">الرؤية والرسالة</a></div>`+
rcard("r-personal","المعلومات الشخصية",`<div class="kv">${p.personal.map((x,i)=>`<div><small>${esc(x.k)}</small>${esc(x.v)}${btns("personal",i,p.personal.length)}</div>`).join("")}</div>`,"personal")+
rcard("r-about","نبذة تعريفية",`<div class="mut" style="font-size:16px">${esc(p.about)}</div><button class="sm no-print" data-a="txt" data-k="about">تعديل</button>`)+
RL.map(r=>rcard("r-"+r[0],r[1],rlist(r[0]),r[0])).join("")+
rcard("r-vision","الرؤية والرسالة",`<div class="mut" style="font-size:16px">${esc(p.vision)}</div><button class="sm no-print" data-a="txt" data-k="vision">تعديل</button>`)}
function secView(){const s=sec(cur.s);if(!s){cur.s="home";return home()}
if(!cur.c)return`<div class="bar"><h2>${esc(s.label)}</h2><button class="pri" data-a="addcat">+ تصنيف جديد</button></div>`+(s.cats.length?`<div class="grid">`+s.cats.map((c,i)=>`<div class="cat" data-oc="${c.id}"><h3 style="margin:0">${esc(c.name)}</h3><div class="mut">${c.items.length} مهمة</div><div class="act" style="margin-top:8px" data-stop>${btns("cat",i,s.cats.length).replace('class="act no-print"','class="act"')}</div></div>`).join("")+`</div>`:`<div class="empty">لا توجد تصنيفات. أضيفي تصنيفاً.</div>`);
const c=s.cats.find(x=>x.id===cur.c);if(!c){cur.c=null;return secView()}
return`<div class="crumb"><a data-g="home">الرئيسية</a> / <a data-g="${s.id}">${esc(s.label)}</a> / ${esc(c.name)}</div><div class="bar"><h2>${esc(c.name)}</h2><button class="pri" data-a="addit">+ إضافة مهمة</button></div>`+
(c.items.length?`<div class="sec">`+c.items.map((x,i)=>`<div class="it"><div class="bd"><h4>${esc(x.title)}</h4>${x.date?`<div class="mut">${esc(x.date)}</div>`:""}${x.desc?`<div class="mut">${esc(x.desc)}</div>`:""}${thumbs(x.files)}</div>${btns("it",i,c.items.length)}</div>`).join("")+`</div>`:`<div class="empty">لا توجد مهام في هذا التصنيف.</div>`)}
function settings(){return`<div class="bar"><h2>إدارة المحتوى والإعدادات</h2></div>
<div class="sec"><h2><span>البيانات الأساسية</span><button class="sm" data-a="prof">تعديل الاسم والمسمى والجهة</button></h2><div class="mut">${esc(D.p.name)} — ${esc(D.p.title)} — ${esc(D.p.school)}</div></div>
<div class="sec"><h2><span>الأقسام</span><button class="sm" data-a="addsec">+ قسم جديد</button></h2>${D.S.map((s,i)=>`<div class="it"><div class="bd">${esc(s.label)}</div>${btns("sec",i,D.S.length)}</div>`).join("")}</div>
<div class="sec"><h2><span>النسخ الاحتياطي</span></h2><div class="act"><button class="pri" data-a="exp">تصدير نسخة احتياطية</button><button data-a="imp">استعادة من نسخة</button><button class="dng" data-a="reset">إعادة ضبط كل البيانات</button></div><p class="mut">تُحفظ البيانات تلقائياً في متصفح هذا الجهاز. صدّري نسخة احتياطية دورياً لنقلها لجهاز آخر.</p><input type="file" id="imf" accept=".json" hidden></div>`}
function render(){drawer();$("#ttl").textContent="ملف إنجاز "+D.p.name;$("#pb").style.display=cur.s==="home"?"":"none";
$("#app").innerHTML=cur.s==="home"?home():cur.s==="settings"?settings():secView();const m=$("#app");m.style.animation="none";m.offsetHeight;m.style.animation=""}
/* ---- actions ---- */
const RF=[{k:"title",l:"العنوان"},{k:"sub",l:"الجهة / التفاصيل"},{k:"date",l:"التاريخ",t:"date"},{k:"text",l:"وصف",t:"area"},{k:"files",l:"مرفقات وشهادات",t:"files"}];
const SF=[{k:"title",l:"الاسم"}];
const cat=()=>sec(cur.s).cats.find(x=>x.id===cur.c);
function arr(k){return k==="personal"?D.p.personal:k==="sec"?D.S:k==="cat"?sec(cur.s).cats:k==="it"?cat().items:D.p[k]}
const done=()=>{save();render()};
document.addEventListener("click",async e=>{const t=e.target;
const g=t.closest("[data-g]");if(g&&!g.closest("nav")){go(g.dataset.g);return}
const sc=t.closest("[data-sc]");if(sc){document.getElementById(sc.dataset.sc).scrollIntoView();return}
if(t.matches("img[data-view]")){const w=window.open();if(w){w.document.write(`<img src="${t.src}" style="max-width:100%">`)}else toast("تعذّر فتح الصورة");return}
if(t.dataset.pdf){const k=findFile(t.dataset.pdf);if(k){const b=await (await fetch(k.d)).blob();dl(k.n,b)}return}
const oc=t.closest("[data-oc]");if(oc&&!t.closest("[data-stop]")){cur.c=oc.dataset.oc;render();scrollTo(0,0);return}
const a=t.closest("[data-a]");if(!a)return;const act=a.dataset.a,k=a.dataset.k,i=+a.dataset.i;
if(act==="up"||act==="dn"){mv(arr(k),i,act==="up"?-1:1);return done()}
if(act==="rm"){const x=arr(k)[i];if(!confirm("هل تريدين الحذف؟"+((k==="cat"&&x.items.length)||(k==="sec"&&x.cats.length)?"\nسيُحذف كل ما بداخله.":"")))return;arr(k).splice(i,1);return done()}
if(act==="ed"){const x=arr(k)[i];
if(k==="personal")return form("تعديل معلومة",[{k:"k",l:"العنوان"},{k:"v",l:"القيمة"}],x,o=>{Object.assign(x,o);done()});
if(k==="sec")return form("تعديل اسم القسم",[{k:"label",l:"الاسم"}],x,o=>{x.label=o.label||x.label;done()});
if(k==="cat")return form("تعديل التصنيف",[{k:"name",l:"الاسم"}],x,o=>{x.name=o.name||x.name;done()});
if(k==="it"){const s=sec(cur.s);return form("تعديل المهمة",[{k:"title",l:"عنوان المهمة"},{k:"cat",l:"التصنيف (للنقل)",t:"sel",o:s.cats.map(c=>[c.id,c.name])},{k:"date",l:"التاريخ (اختياري)",t:"date"},{k:"desc",l:"الوصف التفصيلي",t:"area"},{k:"files",l:"صور ومرفقات",t:"files"}],{...x,cat:cur.c},o=>{const to=o.cat;delete o.cat;if(!o.title)return;Object.assign(x,o);if(to!==cur.c){arr("it").splice(i,1);s.cats.find(c=>c.id===to).items.push(x)}done()})}
return form("تعديل",RF,x,o=>{Object.assign(x,o);done()})}
if(act==="add"){if(k==="personal")return form("إضافة معلومة",[{k:"k",l:"العنوان"},{k:"v",l:"القيمة"}],{},o=>{D.p.personal.push({id:uid("i"),...o});done()});
return form("إضافة",k==="skills"||k==="languages"?SF:RF,{},o=>{if(!o.title)return;D.p[k].push({id:uid("i"),...o});done()})}
if(act==="txt")return form("تعديل",[{k:"v",l:"النص",t:"area"}],{v:D.p[k]},o=>{D.p[k]=o.v;done()});
if(act==="addcat")return form("تصنيف جديد",[{k:"name",l:"اسم التصنيف"}],{},o=>{if(o.name){sec(cur.s).cats.push({id:uid("c-"),name:o.name,items:[]});done()}});
if(act==="addit")return form("مهمة جديدة",[{k:"title",l:"عنوان المهمة"},{k:"date",l:"التاريخ (اختياري)",t:"date"},{k:"desc",l:"الوصف التفصيلي",t:"area"},{k:"files",l:"صور ومرفقات",t:"files"}],{},o=>{if(o.title){cat().items.push({id:uid("t"),...o});done()}});
if(act==="addsec")return form("قسم جديد",[{k:"label",l:"اسم القسم (مثال: أعمال عام 1448هـ)"}],{},o=>{if(o.label){D.S.push({id:uid("s-"),label:o.label,cats:[{id:uid("c-"),name:"عام",items:[]}]});done()}});
if(act==="prof")return form("البيانات الأساسية",[{k:"name",l:"الاسم"},{k:"title",l:"المسمى الوظيفي"},{k:"school",l:"الجهة التعليمية"}],D.p,o=>{Object.assign(D.p,o);done()});
if(act==="exp")return dl("achievement-backup.json",JSON.stringify(D),"application/json");
if(act==="imp"){const f=$("#imf");f.onchange=async()=>{try{const j=JSON.parse(await f.files[0].text());if(!j.p||!j.S)throw 0;D=j;done();toast("تمت الاستعادة")}catch(x){toast("ملف غير صالح")}};f.click()}
if(act==="reset"&&confirm("سيتم حذف كل البيانات نهائياً. متأكدة؟")){D=seed();done()}});
function findFile(n){const all=[];(function w(o){if(Array.isArray(o))o.forEach(w);else if(o&&typeof o==="object"){if(o.d&&o.n)all.push(o);else Object.values(o).forEach(w)}})(D);return all.find(f=>f.n===n)}
addEventListener("hashchange",()=>{const h=location.hash.slice(1);if(h&&(h==="home"||h==="settings"||sec(h)))go(h)});
const h0=location.hash.slice(1);if(h0&&(h0==="settings"||sec(h0)))cur.s=h0;
render();
