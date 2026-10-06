/* Garmin ActiveCaptain Community integration — free/open-source SDK path.
 * Source: https://github.com/garmin/ActiveCaptainCommunitySDK-android
 * The SDK is Apache-2.0, but Garmin requires developer/stage access + API key.
 * This adapter never fabricates Garmin data and never stores API keys in web assets.
 */
(function(){
  "use strict";
  const KEY="bs10_garmin_activecaptain_v1";
  const state=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(_){return {}}};
  const save=v=>localStorage.setItem(KEY,JSON.stringify(v));
  const developerUrl="https://developer.garmin.com/active-captain/mobile/";
  const githubUrl="https://github.com/garmin/ActiveCaptainCommunitySDK-android";
  const s=state();

  function nativeAvailable(){
    return !!(window.GarminActiveCaptain && typeof window.GarminActiveCaptain.getStatus==="function");
  }
  async function status(){
    if(nativeAvailable()){
      try{return await window.GarminActiveCaptain.getStatus()}catch(e){return {ok:false,message:e?.message||"Native bridge error"}}
    }
    return {
      ok:false,
      mode:"not-bundled",
      sdk:"Garmin ActiveCaptain Community SDK",
      openSource:true,
      license:"Apache-2.0",
      message:"SDK open-source tersedia, tetapi APK belum membawa AAR/API key Garmin.",
      developerUrl,
      githubUrl
    };
  }
  async function configureStageKeyHint(){
    const next={configured:true,configuredAt:new Date().toISOString()};
    save(next);
    return {ok:true,message:"Status konfigurasi dicatat. API key tetap harus dipasang melalui secure/native build configuration."};
  }
  window.GarminActiveCaptain={status,configureStageKeyHint,developerUrl,githubUrl,nativeAvailable};
})();