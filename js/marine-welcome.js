/* Marine OS Welcome Experience — local-first, no API required */
(function(){
  "use strict";
  const QUOTES = [
    {text:"The sea has never been friendly to man. At most it has been the accomplice of human restlessness.",author:"Joseph Conrad"},
    {text:"To young men contemplating a voyage, I would say go.",author:"Joshua Slocum"},
    {text:"The sea, once it casts its spell, holds one in its net of wonder forever.",author:"Jacques-Yves Cousteau"},
    {text:"There is nothing — absolutely nothing — half so much worth doing as simply messing about in boats.",author:"Kenneth Grahame"},
    {text:"The ocean is a central image. It is the symbolism of a great journey.",author:"Enya — terinspirasi tema pelayaran"},
    {text:"A ship in harbor is safe, but that is not what ships are built for.",author:"John A. Shedd"}
  ];
  const KEY="bs10_welcome_v2";
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  function greeting(){
    const h=new Date().getHours();
    if(h<4) return "Selamat dini hari";
    if(h<11) return "Selamat pagi";
    if(h<15) return "Selamat siang";
    if(h<18) return "Selamat sore";
    return "Selamat malam";
  }
  function userName(){
    return localStorage.getItem("bs10_vessel_name") || localStorage.getItem("bs10_profile_name") || "Kapten";
  }
  function pick(){
    const last=Number(localStorage.getItem(KEY+"-quote")||"-1");
    let i=Math.floor(Math.random()*QUOTES.length);
    if(QUOTES.length>1 && i===last) i=(i+1)%QUOTES.length;
    localStorage.setItem(KEY+"-quote",String(i));
    return QUOTES[i];
  }
  function dailyBrief(){
    const online=navigator.onLine;
    const hour=new Date().getHours();
    const phase=hour<12?"Pagi":"Sore/malam";
    return phase+" • "+(online?"Data online siap diperbarui":"Mode offline aktif — data lokal tetap aman");
  }
  function show(){
    const root=document.getElementById("marineWelcome");
    if(!root) return;
    const q=pick();
    root.querySelector("[data-welcome-greeting]").textContent=greeting()+",";
    root.querySelector("[data-welcome-user]").textContent=userName()+" 👋";
    root.querySelector("[data-marine-quote]").textContent="“"+q.text+"”";
    root.querySelector("[data-marine-author]").textContent="— "+q.author;
    root.querySelector("[data-daily-brief]").innerHTML="<b>Marine Brief:</b> "+dailyBrief();
    root.classList.remove("is-hidden");
    root.setAttribute("aria-hidden","false");
    const enter=()=>hide();
    root.querySelector("[data-welcome-enter]")?.addEventListener("click",enter,{once:true});
    const skip=()=>hide();
    root.querySelector("[data-welcome-skip]")?.addEventListener("click",skip,{once:true});
    setTimeout(hide,11000);
  }
  function hide(){
    const root=document.getElementById("marineWelcome");
    if(!root)return;
    root.classList.add("is-hidden");
    root.setAttribute("aria-hidden","true");
  }
  window.MarineWelcome={show,hide,quotes:()=>QUOTES.slice()};
  document.addEventListener("DOMContentLoaded",()=>setTimeout(show,900));
})();