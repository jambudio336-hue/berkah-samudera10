package com.m4zk1pl4y.berkahsamudera10;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.PermissionState;

@CapacitorPlugin(name="MarineTracking", permissions={
    @Permission(alias="location", strings={Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}),
    @Permission(alias="backgroundLocation", strings={Manifest.permission.ACCESS_BACKGROUND_LOCATION})
})
public class MarineTrackingPlugin extends Plugin {
    @PluginMethod public void start(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "locationCallback");
            return;
        }
        if (Build.VERSION.SDK_INT >= 29 && getPermissionState("backgroundLocation") != PermissionState.GRANTED) {
            openLocationSettings();
            call.reject("Aktifkan lokasi 'Izinkan sepanjang waktu' di Pengaturan Android, lalu tekan Mulai Tracking lagi.");
            return;
        }
        startService(call);
    }

    @PermissionCallback
    private void locationCallback(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            call.reject("Izin lokasi diperlukan untuk tracking kapal.");
            return;
        }
        if (Build.VERSION.SDK_INT >= 29 && getPermissionState("backgroundLocation") != PermissionState.GRANTED) {
            openLocationSettings();
            call.reject("Izin lokasi latar belakang diperlukan. Aktifkan 'Izinkan sepanjang waktu', lalu tekan Mulai Tracking lagi.");
            return;
        }
        startService(call);
    }

    private void startService(PluginCall call) {
        String deviceId=call.getString("deviceId","android-"+System.currentTimeMillis());
        String vesselId=call.getString("vesselId","kapal-utama");
        SharedPreferences p=getContext().getSharedPreferences("marine_tracking", Context.MODE_PRIVATE);
        p.edit().putString("device_id",deviceId).putString("vessel_id",vesselId).apply();
        Intent i=new Intent(getContext(), MarineTrackingService.class);
        ContextCompat.startForegroundService(getContext(), i);
        JSObject out=new JSObject(); out.put("ok",true); out.put("running",true); call.resolve(out);
    }

    @PluginMethod public void stop(PluginCall call) {
        getContext().stopService(new Intent(getContext(), MarineTrackingService.class));
        JSObject out=new JSObject(); out.put("ok",true); out.put("running",false); call.resolve(out);
    }

    @PluginMethod public void status(PluginCall call) {
        SharedPreferences p=getContext().getSharedPreferences("marine_tracking", Context.MODE_PRIVATE);
        JSObject out=new JSObject();
        out.put("running", p.getLong("updated_at",0)>0);
        out.put("lat", p.getFloat("lat", Float.NaN));
        out.put("lon", p.getFloat("lon", Float.NaN));
        out.put("speed", p.getFloat("speed", 0));
        out.put("accuracy", p.getFloat("accuracy", -1));
        out.put("heading", p.getFloat("heading", -1));
        out.put("updatedAt", p.getLong("updated_at",0));
        call.resolve(out);
    }

    private void openLocationSettings() {
        try {
            Intent i=new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            i.setData(Uri.parse("package:"+getContext().getPackageName()));
            getActivity().startActivity(i);
        } catch(Exception ignored) {}
    }
}