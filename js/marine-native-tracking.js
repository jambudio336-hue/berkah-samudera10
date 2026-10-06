/* Native 24/7 Marine Tracking bridge.
 * Uses Android foreground location service when available.
 * Web/PWA safely falls back to normal GNSS watchPosition.
 */
(function(){
  "use strict";
  const Native=()=>window.Capacitor?.Plugins?.MarineTracking||null;
  const key="bs10_native_tracking_v1";
  const read=()=>{try{return JSON.parse(localStorage.getItem(key)||"{}")}catch(_){return {}}};
  const save=v=>localStorage.setItem(key,JSON.stringify(v));
  async function status(){
    const n=Native();
    if(!n)return {supported:false,running:false,message:"Native tracking hanya tersedia pada APK Android."};
    try{return {supported:true,...await n.status()}}catch(e){return {supported:true,running:false,message:e?.message||"Status native gagal"}}
  }
  async function start(){
    const n=Native();
    if(!n){
      save({...read(),requested:true});
      return {ok:false,supported:false,message:"Jalankan APK Android untuk tracking latar belakang."};
    }
    const deviceId=localStorage.getItem("bs10_device_id")||("dev-"+Date.now());
    const vesselId=localStorage.getItem("bs10_vessel_id")||"kapal-utama";
    try{
      const r=await n.start({deviceId,vesselId});
      save({running:true,startedAt:Date.now()});
      return r;
    }catch(e){
      save({...read(),running:false,lastError:e?.message||String(e)});
      throw e;
    }
  }
  async function stop(){
    const n=Native();
    if(!n)return {ok:false,supported:false};
    const r=await n.stop(); save({...read(),running:false,stoppedAt:Date.now()}); return r;
  }
  function render(s){
    const el=document.getElementById("nativeTrackingStatus"); if(!el)return;
    if(!s.supported){el.textContent="📱 APK Android: tracking latar belakang tersedia setelah build native terbaru.";return}
    if(s.updatedAt){
      const age=Math.max(0,Date.now()-s.updatedAt);
      el.textContent=(age<15000?"🟢 TRACKING AKTIF":"🟠 Tracking aktif, posisi terakhir "+Math.round(age/1000)+" dtk lalu")+
        " • "+Number(s.lat).toFixed(5)+", "+Number(s.lon).toFixed(5)+" • "+new Date(s.updatedAt).toLocaleTimeString("id-ID");
    }else el.textContent="⚪ Tracking belum menerima fix GNSS.";
  }
  async function poll(){
    const s=await status(); render(s);
    if(s.updatedAt && typeof MapApp!=="undefined" && MapApp.lat===null){
      MapApp.lat=s.lat; MapApp.lon=s.lon;
    }
  }
  window.MarineNativeTracking={start,stop,status,poll};
  document.addEventListener("DOMContentLoaded",()=>{
    const startBtn=document.getElementById("btnStartNativeTracking"),stopBtn=document.getElementById("btnStopNativeTracking");
    startBtn?.addEventListener("click",async()=>{
      try{await start();alert("Tracking kapal diaktifkan. Android akan menampilkan notifikasi tracking.");}
      catch(e){alert(e?.message||"Tracking belum dapat diaktifkan. Periksa izin lokasi.");}
      poll();
    });
    stopBtn?.addEventListener("click",async()=>{await stop();poll();});
    poll(); setInterval(poll,5000);
  });
})();