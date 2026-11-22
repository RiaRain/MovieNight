import { MOVIES } from './movies-data.js';
import { getMovie } from './api.js';
import { getMovies } from './api.js';

(function(){
"use strict";
const TRENDING=[14,2,15,6,11,3];
const GENRES=["Все жанры","Драма","Комедия","Триллер","Фантастика","Хоррор","Мелодрама","Приключения"];
const MOODS=["Что-то уютное","Взрыв мозга","Хочу смеяться","На нервах","Что-то трогательное"];
const YEARS=["Любой год","2020-е","2010-е","2000-е","Классика"];
const inEra=(y,e)=>e==="Любой год"||(e==="2020-е"&&y>=2020)||(e==="2010-е"&&y>=2010&&y<2020)||(e==="2000-е"&&y>=2000&&y<2010)||(e==="Классика"&&y<2000);
const byId=id=>MOVIES.find(m=>m.id===id);
const pl=(n,a,b,c)=>{const t=n%100,u=n%10;return t>10&&t<15?c:u===1?a:u>1&&u<5?b:c};


const $=(s,r=document)=>r.querySelector(s);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rand=a=>a[Math.floor(Math.random()*a.length)];
/* ---------- icons ---------- */
const HEART='<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z"/></svg>';
const REEL='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="16" cy="16" r="13"/><circle cx="16" cy="16" r="2.5" fill="currentColor"/>'+
 [0,60,120,180,240,300].map(d=>`<circle cx="${16+7.5*Math.cos(d*Math.PI/180)}" cy="${16+7.5*Math.sin(d*Math.PI/180)}" r="2.6"/>`).join("")+'</svg>';

/* ---------- generated poster art ---------- */
let uid=0;
function poster(m){
  if (!m) {
    console.error("Фильм не найден!");
    return "";
  }
  if (m.posterUrl) {
return `<img
  class="poster"
  src="${esc(m.posterUrl)}"
  alt="${esc("Постер фильма «" + m.title + "»")}"
  loading="lazy"
>`;
}
 const {a,b,m:motif}=m.art, g="g"+(uid++);
 const lines=[];let cur="";
 m.title.split(" ").forEach(w=>{if((cur+" "+w).trim().length>11&&cur){lines.push(cur);cur=w}else cur=(cur+" "+w).trim()});lines.push(cur);
 const fs=lines.length>3?13:lines.some(l=>l.length>9)?16:21;
 const art={
  sun:`<circle cx="100" cy="120" r="62" fill="${a}"/><rect y="150" width="200" height="150" fill="${b}" opacity=".55"/>`,
  stairs:[0,1,2,3,4,5].map(i=>`<rect x="${20+i*24}" y="${190-i*22}" width="160" height="10" fill="${a}" opacity="${.25+i*.13}"/>`).join(""),
  arch:`<path d="M45 210V120a55 55 0 0 1 110 0v90z" fill="${a}"/><path d="M70 210V125a30 30 0 0 1 60 0v85z" fill="${b}"/>`,
  rings:[70,52,34,16].map((r,i)=>`<circle cx="100" cy="120" r="${r}" fill="none" stroke="${a}" stroke-width="3" opacity="${1-i*.18}"/>`).join(""),
  moon:`<circle cx="100" cy="115" r="58" fill="${a}"/><circle cx="124" cy="100" r="52" fill="${b}"/>`,
  eye:`<path d="M20 120Q100 40 180 120Q100 200 20 120z" fill="none" stroke="${a}" stroke-width="3"/><circle cx="100" cy="120" r="26" fill="${a}"/><circle cx="100" cy="120" r="9" fill="${b}"/>`,
  stripes:Array.from({length:9},(_,i)=>`<rect x="${14+i*20}" y="40" width="9" height="${i%2?140:180}" fill="${a}" opacity=".85"/>`).join("")
 }[motif];
 const txt=lines.map((l,i)=>`<text x="100" y="${226-(lines.length-1)*fs*.55+i*fs*1.05}" text-anchor="middle" font-size="${fs}" fill="#f2efe9" letter-spacing=".6" font-weight="700">${esc(l.toUpperCase())}</text>`).join("");
 return `<svg class="poster" viewBox="0 0 200 300" role="img" aria-label="${esc("Постер фильма «"+m.title+"»")}">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient>
  <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></linearGradient></defs>
  <rect width="200" height="300" fill="url(#${g})"/>${art}
  <rect width="200" height="300" fill="url(#${g}s)"/>
  <rect x="8" y="8" width="184" height="284" fill="none" stroke="#f2efe9" stroke-opacity=".35" stroke-width=".6"/>
  ${txt}
  <text x="100" y="278" text-anchor="middle" font-size="8" fill="#f2efe9" fill-opacity=".7" letter-spacing="3" style="font-family:var(--sans)">${m.year}</text>
 </svg>`;
}

/* ---------- state ---------- */
let favs=[];
try{const v=JSON.parse(localStorage.getItem("movienight:favs")||"[]");if(Array.isArray(v))favs=v.filter(id=>byId(id))}catch(e){}
const save=()=>{try{localStorage.setItem("movienight:favs",JSON.stringify(favs))}catch(e){}};
let genre="Все жанры",mood=null,era="Любой год",pick=null,timer=null;

/* ---------- header, hero ---------- */
$("#logoIcon").innerHTML=REEL;
const burger=$("#burger"),nav=$("#nav");
burger.onclick=()=>{const o=nav.classList.toggle("open");burger.classList.toggle("on",o);burger.setAttribute("aria-expanded",o)};
nav.onclick=()=>{nav.classList.remove("open");burger.classList.remove("on");burger.setAttribute("aria-expanded","false")};

/* ---------- filters ---------- */
const pool=()=>MOVIES.filter(m=>(genre==="Все жанры"||m.genres.includes(genre))&&(!mood||m.moods.includes(mood))&&inEra(m.year,era));
function chips(box,items,get,set){
 box.innerHTML=items.map(i=>`<button class="chip" aria-pressed="${get()===i}">${esc(i)}</button>`).join("");
 box.onclick=e=>{const b=e.target.closest(".chip");if(!b)return;set(b.textContent);chips(box,items,get,set);hint()};
}
function hint(){const n=pool().length;$("#hint").textContent="Под ваше настроение: "+n+" "+pl(n,"фильм","фильма","фильмов")+"."}
chips($("#fGenre"),GENRES,()=>genre,v=>genre=v);
chips($("#fMood"),MOODS,()=>mood,v=>mood=mood===v?null:v);
chips($("#fEra"),YEARS,()=>era,v=>era=v);
hint();

/* ---------- roulette ---------- */
const stage=$("#stage"),goBtn=$("#go");
const isFav=id=>favs.includes(id);
function reveal(){
 const m=pick,on=isFav(m.id),mins=m.runtime;
 stage.innerHTML=`<div class="reveal">
  <div class="poster-wrap">${poster(m)}</div>
  <div class="info">
   <div class="meta"><b>${m.year}</b><span>${esc(m.genres.join(" / "))}</span><span>${Math.floor(mins/60)} ч ${mins%60} мин</span></div>
   <h3>${esc(m.title)}</h3>
   <div class="rating"><i>IMDb</i><strong>${m.rating.toFixed(1)}</strong><span>из 10</span></div>
   <p class="desc">${esc(m.desc)}</p>
   <div class="row">
    <button class="fav-btn${on?" on":""}" data-fav="${m.id}">${on?"В ИЗБРАННОМ":"В ИЗБРАННОЕ"}</button>
    <button class="again" data-again>ДРУГОЙ ФИЛЬМ</button>
   </div>
  </div></div>`;
}
function spin(){
 clearInterval(timer);
 const p=pool();
 if(!p.length){pick=null;goBtn.disabled=false;stage.innerHTML='<div class="none">В кинобудке ничего не нашлось по такому сочетанию. Ослабьте один из фильтров и попробуйте снова.</div>';return}
 const final=rand(p.length>1&&pick?p.filter(m=>m.id!==pick.id):p);
 goBtn.disabled=true;
 stage.innerHTML='<div class="spinner"></div>';
 const sp=$(".spinner",stage);
 stage.scrollIntoView({behavior:"smooth",block:"center"});
 let n=0;
 timer=setInterval(()=>{
  sp.textContent=rand(MOVIES).title;
  if(++n>=14){clearInterval(timer);pick=final;goBtn.disabled=false;reveal()}
 },85);
}
goBtn.onclick=spin;
stage.onclick=e=>{if(e.target.closest("[data-again]"))spin()};

/* ---------- cards, trending, favorites ---------- */
function card(m){
 const on=isFav(m.id);
 return `<article class="card">
  <div class="frame">${poster(m)}
   <div class="over"><p>${esc(m.desc)}</p></div>
   <button class="heart${on?" on":""}" data-id="${m.id}" aria-pressed="${on}" aria-label="${esc((on?"Убрать «":"Добавить «")+m.title+(on?"» из избранного":"» в избранное"))}">${HEART}</button>
  </div>
  <h4>${esc(m.title)}</h4>
  <div class="sm"><span>${m.year}, ${esc(m.genres[0])}</span><b>★ ${m.rating.toFixed(1)}</b></div>
 </article>`;
}
$("#rail").innerHTML=TRENDING.map(id=>card(byId(id))).join("");

function renderFavs(){
 $("#favSub").textContent=favs.length?"Сохранено: "+favs.length+". Ваш список фильмов хранится в этом браузере.":"Здесь живут сохранённые фильмы.";
 $("#favLink").innerHTML="Избранное"+(favs.length?`<span class="count">${favs.length}</span>`:"");
 $("#favBox").innerHTML=favs.length?
  `<div class="favs">${favs.map(id=>card(byId(id))).join("")}</div>`:
  `<div class="empty">
    <div class="seats" aria-hidden="true">${"<i></i>".repeat(12)}</div>
    <div><h3>В зале включили свет, а ваше место всё ещё свободно.</h3>
    <p>Нажмите на сердечко на любом постере или сохраните фильм вечера — он дождётся вас здесь.</p>
    <a class="btn ghost" href="#discover">НАЙТИ МОЙ ФИЛЬМ</a></div>
   </div>`;
}
function toggle(id){
 favs=isFav(id)?favs.filter(x=>x!==id):[...favs,id];
 save();renderFavs();
 document.querySelectorAll(".heart").forEach(b=>{
  const i=+b.dataset.id,on=isFav(i),t=byId(i).title;
  b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);
  b.setAttribute("aria-label",(on?"Убрать «":"Добавить «")+t+(on?"» из избранного":"» в избранное"));
 });
 const fb=$("[data-fav]");
 if(fb){const on=isFav(+fb.dataset.fav);fb.classList.toggle("on",on);fb.textContent=on?"В ИЗБРАННОМ":"В ИЗБРАННОЕ"}
}
document.addEventListener("click",e=>{
 const h=e.target.closest(".heart");if(h){toggle(+h.dataset.id);return}
 const f=e.target.closest("[data-fav]");if(f)toggle(+f.dataset.fav);
});
renderFavs();

getMovies(MOVIES, updated => {
  const index = MOVIES.findIndex(movie => movie.id === updated.id);

  if (index !== -1) {
    MOVIES[index] = updated;
  }

  if (TRENDING.includes(updated.id)) {
    $("#rail").innerHTML = TRENDING.map(id => card(byId(id))).join("");
  }

  if (favs.includes(updated.id)) {
    renderFavs();
  }

  hint();
});
})();
