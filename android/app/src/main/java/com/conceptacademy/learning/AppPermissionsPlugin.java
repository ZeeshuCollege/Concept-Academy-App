package com.conceptacademy.learning;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "AppPermissions",
    permissions = {
        @Permission(
            alias = "notifications",
            strings = { Manifest.permission.POST_NOTIFICATIONS }
        ),
        @Permission(
            alias = "camera",
            strings = { Manifest.permission.CAMERA }
        )
    }
)
public class AppPermissionsPlugin extends Plugin {

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33) { // Android 13+ (API 33+)
            int status = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS);
            if (status != PackageManager.PERMISSION_GRANTED) {
                requestPermissionForAlias("notifications", call, "notificationPermCallback");
                return;
            }
        }

        // For Android 12 and below, notification permission is granted upon installation
        JSObject ret = new JSObject();
        ret.put("granted", true);
        ret.put("status", "granted");
        call.resolve(ret);
    }

    @PermissionCallback
    private void notificationPermCallback(PluginCall call) {
        JSObject ret = new JSObject();
        boolean granted = true;
        if (Build.VERSION.SDK_INT >= 33) {
            granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        ret.put("granted", granted);
        ret.put("status", granted ? "granted" : "denied");
        call.resolve(ret);
    }

    @PluginMethod
    public void checkNotificationPermission(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= 33) {
            int status = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS);
            boolean granted = status == PackageManager.PERMISSION_GRANTED;
            ret.put("granted", granted);
            ret.put("status", granted ? "granted" : "prompt");
        } else {
            ret.put("granted", true);
            ret.put("status", "granted");
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void requestCameraPermission(PluginCall call) {
        int status = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.CAMERA);
        if (status != PackageManager.PERMISSION_GRANTED) {
            requestPermissionForAlias("camera", call, "cameraPermCallback");
        } else {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            ret.put("status", "granted");
            call.resolve(ret);
        }
    }

    @PermissionCallback
    private void cameraPermCallback(PluginCall call) {
        JSObject ret = new JSObject();
        boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
        ret.put("granted", granted);
        ret.put("status", granted ? "granted" : "denied");
        call.resolve(ret);
    }

    @PluginMethod
    public void requestMicrophonePermission(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", true);
        ret.put("status", "granted");
        call.resolve(ret);
    }

    private static final String NOTIF_CHANNEL_ID = "conceptacademy_notifications_channel";
    private static final String NOTIF_CHANNEL_NAME = "Concept Academy Notices & Announcements";

    @PluginMethod
    public void showSystemNotification(PluginCall call) {
        String title = call.getString("title", "Concept Academy");
        String message = call.getString("message", "");
        if (message == null || message.trim().isEmpty()) {
            message = call.getString("body", "You have a new announcement from Concept Academy.");
        }
        int notifId = (int) (System.currentTimeMillis() & 0x7FFFFFFF);

        android.content.Context context = getContext();
        if (context == null) {
            call.reject("Android context is null");
            return;
        }

        try {
            android.app.NotificationManager notificationManager = 
                (android.app.NotificationManager) context.getSystemService(android.content.Context.NOTIFICATION_SERVICE);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                android.app.NotificationChannel channel = new android.app.NotificationChannel(
                    NOTIF_CHANNEL_ID,
                    NOTIF_CHANNEL_NAME,
                    android.app.NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Critical notifications, notices and alerts from Concept Academy");
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 250, 150, 250});
                channel.enableLights(true);
                channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
                if (notificationManager != null) {
                    notificationManager.createNotificationChannel(channel);
                }
            }

            android.content.Intent intent = new android.content.Intent(context, MainActivity.class);
            intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK | android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP | android.content.Intent.FLAG_ACTIVITY_SINGLE_TOP);
            intent.putExtra("from_notification", true);
            intent.putExtra("notice_id", call.getString("id", ""));

            int pendingFlags = android.app.PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                pendingFlags |= android.app.PendingIntent.FLAG_IMMUTABLE;
            }
            android.app.PendingIntent pendingIntent = android.app.PendingIntent.getActivity(context, notifId, intent, pendingFlags);

            int iconRes = context.getApplicationInfo().icon;
            if (iconRes == 0) {
                iconRes = android.R.drawable.ic_dialog_info;
            }

            androidx.core.app.NotificationCompat.Builder builder = new androidx.core.app.NotificationCompat.Builder(context, NOTIF_CHANNEL_ID)
                .setSmallIcon(iconRes)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(new androidx.core.app.NotificationCompat.BigTextStyle().bigText(message))
                .setPriority(androidx.core.app.NotificationCompat.PRIORITY_HIGH)
                .setDefaults(androidx.core.app.NotificationCompat.DEFAULT_ALL)
                .setVibrate(new long[]{0, 250, 150, 250})
                .setAutoCancel(true)
                .setContentIntent(pendingIntent);

            if (Build.VERSION.SDK_INT >= 33) {
                int status = ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS);
                if (status != PackageManager.PERMISSION_GRANTED) {
                    call.reject("POST_NOTIFICATIONS permission not granted");
                    return;
                }
            }

            androidx.core.app.NotificationManagerCompat.from(context).notify(notifId, builder.build());

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("id", notifId);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to display system notification: " + e.getMessage(), e);
        }
    }
}
