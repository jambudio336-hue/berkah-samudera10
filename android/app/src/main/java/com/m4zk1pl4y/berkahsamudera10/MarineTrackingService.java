package com.m4zk1pl4y.berkahsamudera10;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;

import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MarineTrackingService extends Service implements LocationListener {
    private static final String CHANNEL_ID = "marine_tracking";
    private static final int NOTIFICATION_ID = 4410;
    private LocationManager locationManager;
    private SharedPreferences prefs;

    @Override public void onCreate() {
        super.onCreate();
        prefs = getSharedPreferences("marine_tracking", MODE_PRIVATE);
        createChannel();
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        startForegroundNotification();
        startLocationUpdates();
        return START_STICKY;
    }

    private void startForegroundNotification() {
        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, 0, open,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        Notification n = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Berkah Samoedra • Marine Tracking")
            .setContentText("Pelacakan kapal aktif di latar belakang")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pi)
            .build();
        if (Build.VERSION.SDK_INT >= 29) {
            ServiceCompat.startForeground(this, NOTIFICATION_ID, n,
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, n);
        }
    }

    private void startLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) return;
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        try {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 3000L, 5f, this, Looper.getMainLooper());
            locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 10000L, 20f, this, Looper.getMainLooper());
        } catch (Exception ignored) {}
    }

    @Override public void onLocationChanged(Location l) {
        prefs.edit()
            .putFloat("lat", (float)l.getLatitude())
            .putFloat("lon", (float)l.getLongitude())
            .putFloat("speed", l.hasSpeed() ? l.getSpeed() : 0f)
            .putFloat("accuracy", l.hasAccuracy() ? l.getAccuracy() : -1f)
            .putFloat("heading", l.hasBearing() ? l.getBearing() : -1f)
            .putLong("updated_at", System.currentTimeMillis())
            .apply();
        new Thread(() -> publish(l)).start();
    }

    private void publish(Location l) {
        HttpURLConnection c = null;
        try {
            String supabaseUrl = "https://volhmpsomtjnaroylmwe.supabase.co";
            String anonKey = "sb_publishable_5wuisICF0Ia8YXwf1McOkg_lMZU9d6g";
            String vesselId = getSharedPreferences("marine_tracking", MODE_PRIVATE).getString("vessel_id", "kapal-utama");
            String deviceId = getSharedPreferences("marine_tracking", MODE_PRIVATE).getString("device_id", "android-" + Build.SERIAL);
            JSONObject row = new JSONObject();
            row.put("vessel_id", vesselId);
            row.put("device_id", deviceId);
            row.put("lat", l.getLatitude());
            row.put("lon", l.getLongitude());
            row.put("speed_knots", l.hasSpeed() ? l.getSpeed() * 1.94384449 : 0);
            row.put("accuracy_m", l.hasAccuracy() ? l.getAccuracy() : JSONObject.NULL);
            row.put("heading", l.hasBearing() ? l.getBearing() : JSONObject.NULL);
            row.put("updated_at", new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", java.util.Locale.US).format(new java.util.Date()));
            c = (HttpURLConnection)new URL(supabaseUrl + "/rest/v1/live_positions?on_conflict=vessel_id").openConnection();
            c.setRequestMethod("POST");
            c.setDoOutput(true);
            c.setRequestProperty("apikey", anonKey);
            c.setRequestProperty("Authorization", "Bearer " + anonKey);
            c.setRequestProperty("Content-Type", "application/json");
            c.setRequestProperty("Prefer", "resolution=merge-duplicates,return=minimal");
            byte[] body = row.toString().getBytes("UTF-8");
            c.setFixedLengthStreamingMode(body.length);
            try(OutputStream os=c.getOutputStream()){ os.write(body); }
            c.getResponseCode();
        } catch(Exception ignored) {
        } finally { if(c!=null) c.disconnect(); }
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL_ID, "Marine Tracking", NotificationManager.IMPORTANCE_LOW);
            ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(ch);
        }
    }

    @Override public void onDestroy() {
        if (locationManager != null) locationManager.removeUpdates(this);
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent intent) { return null; }
    @Override public void onProviderEnabled(String provider) {}
    @Override public void onProviderDisabled(String provider) {}
    @Override public void onStatusChanged(String provider, int status, android.os.Bundle extras) {}
}