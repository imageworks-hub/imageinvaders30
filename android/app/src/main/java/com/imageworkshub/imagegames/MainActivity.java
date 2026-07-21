package com.imageworkshub.imagegames;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GooglePlayPurchasePlugin.class);
        super.onCreate(savedInstanceState);
    }
}