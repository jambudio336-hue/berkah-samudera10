package com.m4zk1pl4y.berkahsamudera10;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name="MarineTracking")
public class MarineTrackingPlugin extends Plugin {
    private static final int LOCATION_REQ = 4411;
    private static final int BACKGROUND_REQ = 4412;

    @PluginMethod public void start(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(call, new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, LOCATION_REQ);
            return;
        }
        if (Build.VERSION.SDK_INT >= 29 && ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_BACKGROUND_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(call, new String[]{Manifest.permission.ACCESS_BACKGROUND_LOCATION}, BACKGROUND_REQ);
            return;
        }
        startService();
        JSObject out = new JSObject(); out.put("ok", true); out.put("running", true); call.resolve(out);
    }

    private void startService() {
        SharedPreferences p=getContext().getSharedPreferences("marine_tracking", Context.MODE_PRIVATE);
        String deviceId=getConfig("deviceId", "android-"+System.currentTimeMillis());
        String vesselId=getConfig("vesselId", "kapal-utama");
        p.edit().putString("device_id",deviceId).putString("vessel_id",vesselId).apply();
        Intent i=new Intent(getContext(), MarineTrackingService.class);
        ContextCompat.startForegroundService(getContext(), i);
    }

    @PluginMethod public void stop(PluginCall call) {
        getContext().stopService(new Intent(getContext(), MarineTrackingService.class));
        JSObject out=new JSObject(); out.put("ok",true); out.put("running",false); call.resolve(out);
    }

    @PluginMethod public void status(PluginCall call) {
        SharedPreferences p=getContext().getSharedPreferences("marine_tracking", Context.MODE_PRIVATE);
        JSObject out=new JSObject();
        out.put("running", p.getLong("updated_at",0)>0);
        out.put("lat", p.getFloat("lat", Double.NaN));
        out.put("lon", p.getFloat("lon", Double.NaN));
        out.put("speed", p.getFloat("speed", 0));
        out.put("accuracy", p.getFloat("accuracy", -1));
        out.put("heading", p.getFloat("heading", -1));
        out.put("updatedAt", p.getLong("updated_at",0));
        call.resolve(out);
    }

    private String getConfig(String key,String fallback) {
        try { String v=getConfig().getString(key); return v==null||v.isEmpty()?fallback:v; } catch(Exception e){return fallback;}
    }

    @Override public void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.handleRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode==LOCATION_REQ || requestCode==BACKGROUND_REQ) {
            for(int r:grantResults) if(r!=PackageManager.PERMISSION_GRANTED) return;
            startService();
        }
    }
}