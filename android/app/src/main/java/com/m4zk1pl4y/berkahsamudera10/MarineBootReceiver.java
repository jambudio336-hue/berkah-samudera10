package com.m4zk1pl4y.berkahsamudera10;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.core.content.ContextCompat;

public class MarineBootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : null;
        if (!Intent.ACTION_BOOT_COMPLETED.equals(action)
                && !Intent.ACTION_LOCKED_BOOT_COMPLETED.equals(action)
                && !Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) return;

        SharedPreferences p = context.getSharedPreferences("marine_tracking", Context.MODE_PRIVATE);
        if (!p.getBoolean("enabled", false)) return;

        if (Build.VERSION.SDK_INT >= 29
                && androidx.core.content.ContextCompat.checkSelfPermission(
                    context, android.Manifest.permission.ACCESS_BACKGROUND_LOCATION)
                    != android.content.pm.PackageManager.PERMISSION_GRANTED) return;

        try {
            Intent service = new Intent(context, MarineTrackingService.class);
            ContextCompat.startForegroundService(context, service);
        } catch (Exception ignored) {
        }
    }
}
