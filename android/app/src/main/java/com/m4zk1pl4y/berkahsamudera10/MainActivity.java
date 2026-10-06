package com.m4zk1pl4y.berkahsamudera10;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateOptions;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;

public class MainActivity extends BridgeActivity {
    private static final int PLAY_UPDATE_REQUEST = 4411;
    private AppUpdateManager appUpdateManager;
    private final InstallStateUpdatedListener updateListener = state -> {
        if (state.installStatus() == InstallStatus.DOWNLOADED) {
            // When the activity later goes to background, Play can complete the update without obscuring the UI.
            appUpdateManager.completeUpdate();
        }
    };

    @Override public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(MarineTrackingPlugin.class);
        registerPlugin(MarineUpdatePlugin.class);
        super.onCreate(savedInstanceState);
        setupPlayUpdates();
    }
}
