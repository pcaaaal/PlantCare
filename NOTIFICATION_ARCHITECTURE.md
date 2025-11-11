# Notification Architecture

This document explains the architecture and flow of the push notification system.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         App.js                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useEffect() on Startup                              │   │
│  │  → dailyNotificationScheduler.scheduleNotifications  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              dailyNotificationScheduler.js                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Request notification permissions                 │   │
│  │  2. Cancel all existing notifications                │   │
│  │  3. Load all pending tasks from storage              │   │
│  │  4. Schedule notification for each task at 18:00     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  notificationService.js                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  scheduleWateringNotification()                      │   │
│  │  - Set trigger time to 18:00 on due date            │   │
│  │  - Create notification with plant details           │   │
│  │  - Use expo-notifications.scheduleNotificationAsync │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  expo-notifications                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Native OS Notification System                       │   │
│  │  - Stores scheduled notifications                    │   │
│  │  - Triggers at specified time                        │   │
│  │  - Works when app is closed                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Event Flow

### 1. App Startup Flow

```
User Opens App
     ↓
App.js useEffect triggers
     ↓
dailyNotificationScheduler.scheduleNotificationsForToday()
     ↓
[Clear existing notifications]
     ↓
Load all pending tasks from storage
     ↓
For each pending task:
  - Get plant details
  - Schedule notification at 18:00 on task due date
     ↓
Notifications scheduled in native OS
```

### 2. Add Plant Flow

```
User Adds New Plant
     ↓
PlantContext.addPlant()
     ↓
Create watering tasks for next 3 months
     ↓
dailyNotificationScheduler.rescheduleAll()
     ↓
[Clear and reschedule all notifications]
     ↓
New notifications include the new plant's tasks
```

### 3. Complete Task Flow

```
User Completes Task
     ↓
PlantContext.completeTask()
     ↓
Mark task as completed
     ↓
Create next recurring task
     ↓
dailyNotificationScheduler.rescheduleAll()
     ↓
[Clear and reschedule all notifications]
     ↓
Notification scheduled for new task
```

### 4. Delete Plant Flow

```
User Deletes Plant
     ↓
PlantContext.deletePlant()
     ↓
Remove plant and its tasks
     ↓
dailyNotificationScheduler.rescheduleAll()
     ↓
[Clear and reschedule all notifications]
     ↓
Deleted plant's notifications removed
```

## Key Components

### dailyNotificationScheduler.js
**Purpose**: Orchestrates notification scheduling for all pending tasks

**Key Methods**:
- `scheduleNotificationsForToday()`: Main scheduling function called on app startup
- `rescheduleAll()`: Re-schedules all notifications (called when tasks change)

**Behavior**:
- Clears existing notifications before scheduling to prevent duplicates
- Only schedules for pending (non-completed) tasks
- Logs detailed information for debugging

### notificationService.js
**Purpose**: Low-level notification API wrapper

**Key Methods**:
- `requestPermissions()`: Handles notification permission requests
- `scheduleWateringNotification()`: Schedules a single notification at 18:00
- `cancelAllNotifications()`: Clears all scheduled notifications

**Features**:
- Prevents notifications less than 1 minute in the future
- Sets notification time to exactly 18:00 on due date
- Configures platform-specific settings (Android channels, iOS priority)

### PlantContext.js
**Purpose**: Application state management

**Integration Points**:
- Calls `rescheduleAll()` after:
  - Adding a plant
  - Deleting a plant  
  - Completing a task

## Notification Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│  Notification Created                                     │
│  - Stored in OS notification system                      │
│  - Scheduled for specific date/time (18:00)              │
└──────────────────────────────────────────────────────────┘
                      │
                      ↓
┌──────────────────────────────────────────────────────────┐
│  Waiting Period                                           │
│  - Notification stored in native OS                      │
│  - App can be closed/opened without affecting it         │
│  - Survives app restarts                                 │
└──────────────────────────────────────────────────────────┘
                      │
                      ↓
┌──────────────────────────────────────────────────────────┐
│  Trigger Time (18:00)                                     │
│  - OS triggers notification                              │
│  - User sees notification banner                         │
│  - Works regardless of app state                         │
└──────────────────────────────────────────────────────────┘
                      │
                      ↓
┌──────────────────────────────────────────────────────────┐
│  User Interaction                                         │
│  - Tap: Opens app (future enhancement: navigate to task) │
│  - Dismiss: Notification cleared                         │
│  - Ignore: Notification stays in notification center     │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

```
Storage (AsyncStorage)
    ↓
storageService.getTasks()
    ↓
Filter: !completed && nextDueDate
    ↓
For each pending task:
    ↓
Get associated plant data
    ↓
notificationService.scheduleWateringNotification({
    plantName: "Monstera",
    triggerDate: "2025-11-12T18:00:00",
    taskId: "task-123"
})
    ↓
expo-notifications.scheduleNotificationAsync({
    content: {
        title: "💧 Time to Water!",
        body: "Your Monstera needs watering today."
    },
    trigger: {
        date: Date(2025-11-12T18:00:00)
    }
})
    ↓
Native OS Notification System
```

## Error Handling

### Permission Denied
- Gracefully logs and continues
- App remains functional without notifications
- User can grant permission later via settings

### Scheduling Failures
- Logs error but doesn't crash app
- Returns null notification ID
- Continues with other notifications

### Missing Data
- Skips tasks without associated plants
- Skips tasks without due dates
- Prevents crashes from data inconsistencies

## Performance Considerations

### Startup Impact
- Scheduling runs asynchronously
- Doesn't block UI rendering
- Typical scheduling time: < 1 second for 100 tasks

### Memory Usage
- Notifications stored in OS, not in app memory
- Minimal app memory overhead
- Scales well with many tasks

### Battery Impact
- No background tasks running
- No polling or wake locks
- Uses OS-native scheduling (efficient)

## Future Enhancements

### Potential Improvements
1. **Custom notification times** per plant
2. **Notification actions** (e.g., "Mark as Complete")
3. **Smart scheduling** based on plant health
4. **Notification grouping** for multiple plants
5. **Snooze functionality**
6. **Different notification sounds** per plant type
7. **Rich notifications** with plant photos

### Scalability
- Current implementation handles 100+ plants efficiently
- Could add pagination for very large plant collections
- Consider incremental updates instead of full reschedule
