package com.conceptacademy.learning;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SystemNavigation")
public class SystemNavigationPlugin extends Plugin {

    @PluginMethod
    public void getInfo(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            MainActivity activity = (MainActivity) getActivity();
            if (activity != null) {
                ret.put("top", activity.getCachedTopDp());
                ret.put("bottom", activity.getCachedBottomDp());
                ret.put("navMode", activity.getCachedNavMode());
                ret.put("isGesture", activity.getCachedIsGesture());
                ret.put("ime", activity.getCachedImeDp());
                ret.put("keyboardOpen", activity.getCachedKeyboardOpen());
            } else {
                ret.put("top", 0);
                ret.put("bottom", 0);
                ret.put("navMode", "gesture");
                ret.put("isGesture", true);
                ret.put("ime", 0);
                ret.put("keyboardOpen", false);
            }
        } catch (Exception e) {
            ret.put("top", 0);
            ret.put("bottom", 0);
            ret.put("navMode", "gesture");
            ret.put("isGesture", true);
            ret.put("ime", 0);
            ret.put("keyboardOpen", false);
        }
        call.resolve(ret);
    }
}
