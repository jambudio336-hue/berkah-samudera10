package com.m4zk1pl4y.berkahsamudera10;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONArray;
import org.json.JSONObject;

public class MarineUpdateWorker extends Worker {
    private static final String CHANNEL_ID = "marine_updates";
    private static final String RELEASES_URL =
        "https://api.github.com/repos/jambudio336-hue/berkah-samudera10/releases/latest";

    public MarineUpdateWorker(@NonNull Context context, @NonNull WorkerParameters params) { super(context, params); }

    @NonNull @Override public Result doWork() {
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(RELEASES_URL).openConnection();
            c.setConnectTimeout(10000);
            c.setReadTimeout(15000);
            c.setRequestProperty("Accept", "application/vnd.github+json");
            c.setRequestProperty("User-Agent", "Berkah-Samudera-MarineOS");
            if (c.getResponseCode() != 200) return Result.retry();

            JSONObject release = new JSONObject(readAll(c.getInputStream()));
            String tag = release.optString("tag_name", "");
            String version = tag.startsWith("v") ? tag.substring(1) : tag;
            int latest = MarineUpdatePlugin.parseVersionCode(version);
            int current = getApplicationContext().getPackageManager()
                .getPackageInfo(getApplicationContext().getPackageName(), 0).versionCode;

            if (latest > current && hasReleaseApk(release)) notifyUpdate(version);
            return Result.success();
        } catch (Exception e) {
            return Result.retry();
        } finally { if (c != null) c.disconnect(); }
    }

    private boolean hasReleaseApk(JSONObject release) {
        JSONArray assets = release.optJSONArray("assets");
        if (assets == null) return false;
        for (int i = 0; i < assets.length(); i++) {
            JSONObject a = assets.optJSONObject(i);
            if (a != null && "berkah-samudera10-release.apk".equals(a.optString("name"))) return true;
        }
        return false;
    }

    private void notifyUpdate(String version) {
        Context ctx = getApplicationContext();
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26)
            nm.createNotificationChannel(new NotificationChannel(CHANNEL_ID, "Marine OS Updates", NotificationManager.IMPORTANCE_DEFAULT));

        Intent i = new Intent(ctx, MainActivity.class);
        i.putExtra("marine_update_check", true);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 7711, i,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));

        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_download_done)
            .setContentTitle("Berkah Samudera update tersedia")
            .setContentText("Versi " + version + " siap diunduh.")
            .setAutoCancel(true)
            .setContentIntent(pi)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT);
        nm.notify(7711, b.build());
    }

    private static String readAll(InputStream in) throws Exception {
        StringBuilder b = new StringBuilder();
        byte[] buffer = new byte[8192];
        int n;
        while ((n = in.read(buffer)) != -1) b.append(new String(buffer, 0, n, "UTF-8"));
        return b.toString();
    }
}
