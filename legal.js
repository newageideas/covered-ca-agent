// Shared tri-language renderer for privacy.html / terms.html. Edit AGENT/AGENCY placeholders here.
const AGENT="[AGENT NAME]",AGENCY="[AGENCY NAME]",CONTACT="[PHONE / EMAIL]",UPDATED="[DATE]";
const UI={es:{back:"← Volver",tpl:"PLANTILLA — debe ser revisada por un abogado y un hablante nativo antes de usarse.",upd:"Última actualización"},
en:{back:"← Back",tpl:"TEMPLATE — must be reviewed by an attorney and native speakers before use.",upd:"Last updated"},
pa:{back:"← ਵਾਪਸ",tpl:"ਟੈਮਪਲੇਟ — ਵਰਤਣ ਤੋਂ ਪਹਿਲਾਂ ਵਕੀਲ ਅਤੇ ਮੂਲ ਬੋਲਣ ਵਾਲੇ ਤੋਂ ਜਾਂਚ ਕਰਵਾਓ।",upd:"ਆਖਰੀ ਅਪਡੇਟ"}};
let lang=localStorage.getItem("cca-lang")||"es";
function render(){const d=DOC[lang],u=UI[lang];document.documentElement.lang=lang;document.title=d.title+" · "+AGENCY;
 const fill=x=>x.replaceAll("{AGENT}",AGENT).replaceAll("{AGENCY}",AGENCY).replaceAll("{CONTACT}",CONTACT);
 document.getElementById("doc").innerHTML=`<a href="/">${u.back}</a><p class="tpl">${u.tpl}</p><h1>${d.title}</h1><p class="note">${u.upd}: ${UPDATED}</p>`+
  d.sections.map(([h,p])=>`<h2>${fill(h)}</h2><p>${fill(p)}</p>`).join("");
 document.querySelectorAll("[data-l]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.l===lang))}
document.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{lang=b.dataset.l;localStorage.setItem("cca-lang",lang);render()});
render();
