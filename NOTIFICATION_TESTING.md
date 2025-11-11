# Testing Push Notifications

This document explains how to test the push notification feature that sends reminders at 18:00 (6 PM) for watering plants.

## How Notifications Work

1. **Scheduled Notifications**: Notifications are scheduled for 18:00 on the due date of each pending task
2. **Works When App is Closed**: Uses expo-notifications scheduled notifications which work even when the app is not running
3. **Auto-Refresh**: On app startup, all notifications are rescheduled to ensure they're up-to-date
4. **Dynamic Updates**: When you add/complete/delete tasks, notifications are automatically rescheduled

## Testing Instructions

### 1. Testing Permissions

1. Install and open the app on a physical device or simulator
2. On first launch, you should see a notification permission prompt
3. Grant notification permissions
4. Check the console logs - you should see: "Initializing notifications on app startup..."

### 2. Testing Notification Scheduling

#### Method 1: Check Scheduled Notifications via Console

1. Open the app
2. Add a new plant with watering requirements
3. Check the console logs for messages like:
   - "Found X pending tasks"
   - "Scheduled notification for [Plant Name] on [Date]"
   - "Successfully scheduled X notifications"

#### Method 2: Test with Immediate Notification

To test without waiting until 18:00, you can temporarily modify the code:

1. In `src/services/notificationService.js`, find line 79:
   ```javascript
   notificationDate.setHours(18, 0, 0, 0);
   ```

2. Change it to trigger in 2 minutes from now:
   ```javascript
   const now = new Date();
   notificationDate = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes
   ```

3. Rebuild the app and add a task
4. Close the app completely
5. Wait 2 minutes - you should receive a notification

**Remember to revert this change after testing!**

### 3. Testing Different Scenarios

#### Scenario A: Add a Plant
1. Add a new plant with a watering schedule
2. Check that notifications are scheduled (see console logs)
3. Verify the notification count: `Total scheduled notifications: X`

#### Scenario B: Complete a Task
1. Complete a watering task
2. A new task should be created for the next watering
3. Notifications should be rescheduled
4. Check console for "Re-scheduling all notifications..."

#### Scenario C: Delete a Plant
1. Delete a plant
2. Its associated notifications should be removed
3. Check console for rescheduling confirmation

#### Scenario D: App Restart
1. Close the app completely
2. Reopen the app
3. Notifications should be rescheduled on startup
4. Check console for "Initializing notifications on app startup..."

### 4. Verifying Scheduled Notifications

You can check all scheduled notifications programmatically:

```javascript
// In any component or screen:
import {notificationService} from './src/services/notificationService';

// Get all scheduled notifications
const scheduled = await notificationService.getAllScheduledNotifications();
console.log('Scheduled notifications:', scheduled);
```

### 5. Production Testing

To test in a production-like environment:

1. Build a release version of the app
2. Install on a real device
3. Add plants with tasks due today
4. Close the app completely (swipe away from recent apps)
5. Wait until 18:00
6. You should receive notifications for tasks due today

## Troubleshooting

### No Notifications Received

1. **Check Permissions**: Ensure notification permissions are granted
2. **Check Console Logs**: Look for error messages
3. **Verify Task Due Dates**: Notifications only trigger for tasks due at 18:00
4. **Check Device Settings**: Ensure Do Not Disturb mode is off
5. **Background App Refresh**: On iOS, ensure Background App Refresh is enabled

### Notifications Appear Immediately

- Check that tasks are scheduled for future dates
- The system includes a 1-minute buffer to prevent immediate notifications
- If a task is due within 1 minute, no notification is scheduled

### Multiple Notifications for Same Task

- The scheduler clears all existing notifications before rescheduling
- If you see duplicates, check for errors in the console logs

## Expected Console Output

When working correctly, you should see:

```
Initializing notifications on app startup...
Cleared all existing notifications
Found 3 pending tasks
Scheduled notification for Monstera on 11/12/2025
Scheduled notification for Snake Plant on 11/13/2025
Scheduled notification for Pothos on 11/15/2025
Successfully scheduled 3 notifications
Total scheduled notifications: 3
```

## Platform-Specific Notes

### Android
- Notifications should work reliably in the background
- Uses notification channels (configured as "Plant Care Reminders")
- High priority notifications with vibration

### iOS
- Requires explicit permission
- Background notifications work when permission is granted
- May be affected by Low Power Mode

## Next Steps

After verifying notifications work:
1. Test on both Android and iOS if possible
2. Monitor battery usage impact
3. Consider adding user settings to customize notification time
4. Add notification sound/vibration preferences
