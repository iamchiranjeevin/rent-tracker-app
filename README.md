# RentReminderApp

A React Native / Expo app for managing tenant reminders, rent status, and scheduled notifications.

## What is implemented

- Native reminder date and time selection for tenant records.
- Default reminder values use the current day and current time.
- Reminder scheduling happens directly during the save flow.
- Save actions show toast feedback instead of alert-based scheduling.
- Tenant status toggling now activates or cancels reminders in the same action.
- The reminder status is reflected in the tenant card UI and bell/status indicators.
- The separate menu-based schedule action was removed.
- Reminder behavior and toast messaging were updated and verified in tests.

## Next version TODO

- Replace the current card layout with an accordion-style tenant list for better compact viewing and expanded details.
- Add month wise sections for tenants
- Improve reminder editing and quick actions within each accordion section.
- Add richer notification history and overdue reminder insights.
- Add vibration to notification reminders
- Add customized app icon
- Decrease apk size

## Verification

- Jest test suite is currently passing with the updated reminder flow and status-toggle behavior.

