(() => {
  const n = id => Number(document.getElementById(id)?.value);
  const out = msg => { const el=document.getElementById('marineToolsResult'); if(el) el.innerHTML=msg; };

  function bearing(aLat,aLon,bLat,bLon){
    const r=Math.PI/180, y=Math.sin((bLon-aLon)*r)*Math.cos(bLat*r);
    const x=Math.cos(aLat*r)*Math.sin(bLat*r)-Math.sin(aLat*r)*Math.cos(bLat*r)*Math.cos((bLon-aLon)*r);
    return (Math.atan2(y,x)/r+360)%360;
  }
  function distanceNm(aLat,aLon,bLat,bLon){
    const R=6371008.8, r=Math.PI/180;
    const p1=aLat*r,p2=bLat*r,dp=(bLat-aLat)*r,dl=(bLon-aLon)*r;
    const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
    return (2*R*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)))/1852;
  }
  function calculate(){
    const mode=document.getElementById('marineToolMode')?.value;
    if(mode==='fuel'){
      const d=n('toolDistanceNm'), speed=n('toolSpeedKn'), burn=n('toolFuelLph'), reserve=n('toolReserve');
      if(!(d>0&&speed>0&&burn>=0)) return out('Isi jarak, kecepatan, dan konsumsi BBM yang valid.');
      const hours=d/speed, base=hours*burn, total=base*(1+(Number.isFinite(reserve)?reserve:0)/100);
      return out('⛽ Waktu: <b>'+hours.toFixed(2)+' jam</b> • BBM dasar: <b>'+base.toFixed(1)+' L</b> • Dengan cadangan: <b>'+total.toFixed(1)+' L</b>');
    }
    if(mode==='bearing'){
      const aLat=n('toolALat'),aLon=n('toolALon'),bLat=n('toolBLat'),bLon=n('toolBLon');
      if([aLat,aLon,bLat,bLon].some(v=>!Number.isFinite(v))) return out('Isi empat koordinat dengan benar.');
      if(Math.abs(aLat)>90||Math.abs(bLat)>90||Math.abs(aLon)>180||Math.abs(bLon)>180) return out('Koordinat di luar rentang.');
      const d=distanceNm(aLat,aLon,bLat,bLon);
      return out('🧭 Jarak: <b>'+d.toFixed(2)+' NM</b> • Bearing awal: <b>'+bearing(aLat,aLon,bLat,bLon).toFixed(1)+'°</b>');
    }
    const value=n('toolValue'), unit=document.getElementById('toolUnit')?.value;
    if(!Number.isFinite(value)) return out('Masukkan angka.');
    const result=unit==='kn-kmh'?value*1.852:unit==='kmh-kn'?value/1.852:unit==='nm-km'?value*1.852:value/1.852;
    const label=unit==='kn-kmh'?'km/j':unit==='kmh-kn'?'kn':unit==='nm-km'?'km':'NM';
    out('🔄 Hasil: <b>'+result.toFixed(2)+' '+label+'</b>');
  }
  function switchMode(){
    const m=document.getElementById('marineToolMode')?.value;
    document.querySelectorAll('[data-tool-group]').forEach(el=>el.hidden=el.dataset.toolGroup!==m);
  }
  function fillFromGps(){
    if(typeof MapApp==='undefined'||MapApp.lat===null) return out('GPS belum aktif.');
    document.getElementById('toolALat').value=MapApp.lat.toFixed(6);
    document.getElementById('toolALon').value=MapApp.lon.toFixed(6);
    out('📍 Koordinat GPS saat ini dimasukkan sebagai titik A.');
  }
  function copyGps(){
    if(typeof MapApp==='undefined'||MapApp.lat===null) return out('GPS belum aktif.');
    const txt=MapApp.lat.toFixed(6)+', '+MapApp.lon.toFixed(6);
    navigator.clipboard?.writeText(txt).then(()=>out('📋 Koordinat disalin: <b>'+txt+'</b>')).catch(()=>out('Koordinat: <b>'+txt+'</b>'));
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('marineToolMode')?.addEventListener('change',switchMode);
    document.getElementById('btnMarineToolCalc')?.addEventListener('click',calculate);
    document.getElementById('btnMarineToolGps')?.addEventListener('click',fillFromGps);
    document.getElementById('btnMarineToolCopyGps')?.addEventListener('click',copyGps);
    switchMode();
  });
})();