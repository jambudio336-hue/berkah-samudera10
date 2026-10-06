package com.m4zk1pl4y.berkahsamudera10;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
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
        if (intent == null && !prefs.getBoolean("enabled", false)) {
            stopSelf(startId);
            return START_NOT_STICKY;
        }
        prefs.edit().putBoolean("running", true).apply();
        startForegroundNotification();
        if (!startLocationUpdates()) {
            prefs.edit().putBoolean("running", false).apply();
            ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE);
            stopSelf(startId);
            return START_NOT_STICKY;
        }
        return START_STICKY;
    }

    private void startForegroundNotification() {
        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, 0, open,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        Notification n = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Berkah Samudera • Marine Tracking")
            .setContentText("GPS latar belakang disimpan lokal di perangkat")
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

    private boolean startLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) return false;
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        try {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 3000L, 5f, this, Looper.getMainLooper());
            locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 10000L, 20f, this, Looper.getMainLooper());
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    @Override public void onLocationChanged(Location location) {
        // Background tracking is local-only. Public GPS sharing is handled by the active
        // WebView/Supabase client, which checks the explicit opt-in and authenticated RLS.
        prefs.edit()
            .putFloat("lat", (float) location.getLatitude())
            .putFloat("lon", (float) location.getLongitude())
            .putFloat("speed", location.hasSpeed() ? location.getSpeed() : 0f)
            .putFloat("accuracy", location.hasAccuracy() ? location.getAccuracy() : -1f)
            .putFloat("heading", location.hasBearing() ? location.getBearing() : -1f)
            .putLong("updated_at", System.currentTimeMillis())
            .putBoolean("running", true)
            .apply();
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Marine Tracking", NotificationManager.IMPORTANCE_LOW);
            ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(channel);
        }
    }

    @Override public void onDestroy() {
        if (locationManager != null) locationManager.removeUpdates(this);
        if (prefs != null) prefs.edit().putBoolean("running", false).apply();
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) { return null; }
    @Override public void onProviderEnabled(String provider) {}
    @Override public void onProviderDisabled(String provider) {}
    @Override public void onStatusChanged(String provider, int status, android.os.Bundle extras) {}
}
