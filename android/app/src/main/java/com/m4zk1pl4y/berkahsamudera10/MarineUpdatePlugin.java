package com.m4zk1pl4y.berkahsamudera10;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "MarineUpdater")
public class MarineUpdatePlugin extends Plugin {
    private static final String RELEASES_URL =
        "https://api.github.com/repos/jambudio336-hue/berkah-samudera10/releases/latest";

    @PluginMethod public void check(PluginCall call) {
        new Thread(() -> {
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection) new URL(RELEASES_URL).openConnection();
                c.setRequestMethod("GET");
                c.setConnectTimeout(10000);
                c.setReadTimeout(15000);
                c.setRequestProperty("Accept", "application/vnd.github+json");
                c.setRequestProperty("User-Agent", "Berkah-Samudera-MarineOS");
                if (c.getResponseCode() != 200) { call.reject("Update server HTTP " + c.getResponseCode()); return; }

                JSONObject release = new JSONObject(readAll(c.getInputStream()));
                String tag = release.optString("tag_name", "");
                String version = tag.startsWith("v") ? tag.substring(1) : tag;
                int currentCode = getContext().getPackageManager()
                    .getPackageInfo(getContext().getPackageName(), 0).versionCode;
                int latestCode = parseVersionCode(version);
                JSONArray assets = release.optJSONArray("assets");
                String apkUrl = "";
                if (assets != null) for (int i = 0; i < assets.length(); i++) {
                    JSONObject a = assets.optJSONObject(i);
                    if (a != null && "berkah-samudera10-release.apk".equals(a.optString("name"))) {
                        apkUrl = a.optString("browser_download_url", "");
                        break;
                    }
                }

                JSObject out = new JSObject();
                out.put("available", latestCode > currentCode && !apkUrl.isEmpty());
                out.put("currentVersionCode", currentCode);
                out.put("latestVersionCode", latestCode);
                out.put("versionName", version);
                out.put("url", apkUrl);
                out.put("tag", tag);
                call.resolve(out);
            } catch (Exception e) {
                call.reject("Gagal mengecek update: " + e.getMessage());
            } finally { if (c != null) c.disconnect(); }
        }).start();
    }

    @PluginMethod public void installLatest(PluginCall call) {
        String apkUrl = call.getString("url", "");
        if (apkUrl.isEmpty()) { call.reject("URL APK update kosong."); return; }

        new Thread(() -> {
            HttpURLConnection c = null;
            try {
                if (Build.VERSION.SDK_INT >= 26 && !getContext().getPackageManager().canRequestPackageInstalls()) {
                    Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + getContext().getPackageName()));
                    getActivity().startActivity(settings);
                    call.reject("Aktifkan izin instal aplikasi dari sumber ini, lalu ulangi update.");
                    return;
                }

                c = (HttpURLConnection) new URL(apkUrl).openConnection();
                c.setRequestMethod("GET");
                c.setConnectTimeout(15000);
                c.setReadTimeout(60000);
                c.setRequestProperty("User-Agent", "Berkah-Samudera-MarineOS");
                if (c.getResponseCode() != 200) { call.reject("Download update HTTP " + c.getResponseCode()); return; }

                File apk = new File(getContext().getCacheDir(), "berkah-samudera10-release.apk");
                try (InputStream in = new BufferedInputStream(c.getInputStream());
                     FileOutputStream out = new FileOutputStream(apk, false)) {
                    byte[] buffer = new byte[64 * 1024];
                    int n;
                    while ((n = in.read(buffer)) != -1) out.write(buffer, 0, n);
                }

                Uri uri = androidx.core.content.FileProvider.getUriForFile(
                    getContext(), getContext().getPackageName() + ".fileprovider", apk);
                Intent install = new Intent(Intent.ACTION_VIEW);
                install.setDataAndType(uri, "application/vnd.android.package-archive");
                install.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                getActivity().startActivity(install);

                JSObject result = new JSObject();
                result.put("ok", true);
                call.resolve(result);
            } catch (Exception e) {
                call.reject("Gagal memasang update: " + e.getMessage());
            } finally { if (c != null) c.disconnect(); }
        }).start();
    }

    @PluginMethod public void status(PluginCall call) {
        try {
            android.content.pm.PackageInfo pi = getContext().getPackageManager()
                .getPackageInfo(getContext().getPackageName(), 0);
            JSObject out = new JSObject();
            out.put("packageName", pi.packageName);
            out.put("versionCode", pi.versionCode);
            out.put("versionName", pi.versionName);
            out.put("canInstallPackages", Build.VERSION.SDK_INT < 26
                || getContext().getPackageManager().canRequestPackageInstalls());
            call.resolve(out);
        } catch (Exception e) { call.reject(e.getMessage()); }
    }

    static int parseVersionCode(String version) {
        try {
            String[] p = version.split("\\.");
            int a = p.length > 0 ? Integer.parseInt(p[0].replaceAll("\\D", "")) : 0;
            int b = p.length > 1 ? Integer.parseInt(p[1].replaceAll("\\D", "")) : 0;
            int c = p.length > 2 ? Integer.parseInt(p[2].replaceAll("\\D", "")) : 0;
            return a * 10000 + b * 100 + c;
        } catch (Exception e) { return 0; }
    }

    private static String readAll(InputStream in) throws Exception {
        StringBuilder b = new StringBuilder();
        byte[] buffer = new byte[8192];
        int n;
        while ((n = in.read(buffer)) != -1) b.append(new String(buffer, 0, n, "UTF-8"));
        return b.toString();
    }
}
