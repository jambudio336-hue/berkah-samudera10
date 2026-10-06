package com.m4zk1pl4y.berkahsamudera10;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(MarineTrackingPlugin.class);
    }
}
