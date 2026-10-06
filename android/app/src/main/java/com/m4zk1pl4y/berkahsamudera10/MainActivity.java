package com.m4zk1pl4y.berkahsamudera10;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateOptions;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;
import androidx.work.Constraints;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

public class MainActivity extends BridgeActivity {
    private static final int PLAY_UPDATE_REQUEST = 4411;
    private AppUpdateManager appUpdateManager;

    private final InstallStateUpdatedListener updateListener = state -> {
        if (state.installStatus() == InstallStatus.DOWNLOADED && appUpdateManager != null) {
            appUpdateManager.completeUpdate();
        }
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MarineTrackingPlugin.class);
        registerPlugin(MarineUpdatePlugin.class);
        super.onCreate(savedInstanceState);
        setupPlayUpdates();
        scheduleBackgroundUpdateCheck();
    }

    private void setupPlayUpdates() {
        try {
            appUpdateManager = AppUpdateManagerFactory.create(this);
            appUpdateManager.registerListener(updateListener);
            checkPlayUpdate();
        } catch (Exception ignored) {
        }
    }

    private void scheduleBackgroundUpdateCheck() {
        try {
            Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();
            PeriodicWorkRequest work = new PeriodicWorkRequest.Builder(
                MarineUpdateWorker.class, 6, TimeUnit.HOURS)
                .setConstraints(constraints)
                .build();
            WorkManager.getInstance(this).enqueueUniquePeriodicWork(
                "marine-release-update-check",
                androidx.work.ExistingPeriodicWorkPolicy.UPDATE,
                work
            );
        } catch (Exception ignored) {
        }
    }

    private void checkPlayUpdate() {
        if (appUpdateManager == null) return;
        appUpdateManager.getAppUpdateInfo().addOnSuccessListener(info -> {
            if (info.installStatus() == InstallStatus.DOWNLOADED) {
                appUpdateManager.completeUpdate();
                return;
            }
            if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                    && info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
                appUpdateManager.startUpdateFlowForResult(
                    info,
                    this,
                    AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build(),
                    PLAY_UPDATE_REQUEST
                );
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        checkPlayUpdate();
    }

    @Override
    public void onDestroy() {
        if (appUpdateManager != null) {
            appUpdateManager.unregisterListener(updateListener);
        }
        super.onDestroy();
    }
}
