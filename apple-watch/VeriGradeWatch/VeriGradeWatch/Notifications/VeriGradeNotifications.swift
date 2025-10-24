import SwiftUI
import UserNotifications
import WatchKit

class VeriGradeNotificationManager: NSObject, ObservableObject {
    static let shared = VeriGradeNotificationManager()
    
    @Published var isAuthorized = false
    
    override init() {
        super.init()
        requestAuthorization()
    }
    
    func requestAuthorization() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                self.isAuthorized = granted
            }
        }
    }
    
    // MARK: - Timer Notifications
    func scheduleTimerReminder(after timeInterval: TimeInterval) {
        let content = UNMutableNotificationContent()
        content.title = "Timer Reminder"
        content.body = "Your timer has been running for \(formatTime(timeInterval)). Don't forget to stop it when you're done!"
        content.sound = .default
        content.categoryIdentifier = "TIMER_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        let request = UNNotificationRequest(identifier: "timer_reminder", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    func scheduleTimerBreakReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Take a Break"
        content.body = "You've been working for a while. Consider taking a break!"
        content.sound = .default
        content.categoryIdentifier = "BREAK_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 3600, repeats: true) // Every hour
        let request = UNNotificationRequest(identifier: "break_reminder", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Expense Notifications
    func scheduleExpenseReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Expense Reminder"
        content.body = "Don't forget to log your expenses for today!"
        content.sound = .default
        content.categoryIdentifier = "EXPENSE_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 86400, repeats: true) // Daily
        let request = UNNotificationRequest(identifier: "expense_reminder", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    func scheduleReceiptReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Receipt Reminder"
        content.body = "You have unprocessed receipts. Take a photo to log them!"
        content.sound = .default
        content.categoryIdentifier = "RECEIPT_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1800, repeats: false) // 30 minutes
        let request = UNNotificationRequest(identifier: "receipt_reminder", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Mileage Notifications
    func scheduleMileageReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Mileage Tracking"
        content.body = "Start your trip tracking to log business miles!"
        content.sound = .default
        content.categoryIdentifier = "MILEAGE_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 3600, repeats: false) // 1 hour
        let request = UNNotificationRequest(identifier: "mileage_reminder", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    func scheduleTripEndReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Trip Complete"
        content.body = "Your trip has ended. Review and categorize your mileage!"
        content.sound = .default
        content.categoryIdentifier = "TRIP_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 300, repeats: false) // 5 minutes
        let request = UNNotificationRequest(identifier: "trip_end_reminder", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Voice Note Notifications
    func scheduleVoiceNoteReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Voice Note Reminder"
        content.body = "You have unprocessed voice notes. Review and transcribe them!"
        content.sound = .default
        content.categoryIdentifier = "VOICE_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1800, repeats: false) // 30 minutes
        let request = UNNotificationRequest(identifier: "voice_reminder", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Sync Notifications
    func scheduleSyncReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Sync Reminder"
        content.body = "Your data hasn't been synced recently. Sync now to keep everything up to date!"
        content.sound = .default
        content.categoryIdentifier = "SYNC_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 7200, repeats: false) // 2 hours
        let request = UNNotificationRequest(identifier: "sync_reminder", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Achievement Notifications
    func scheduleAchievementNotification(achievement: String) {
        let content = UNMutableNotificationContent()
        content.title = "Achievement Unlocked!"
        content.body = achievement
        content.sound = .default
        content.categoryIdentifier = "ACHIEVEMENT_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "achievement_\(Date().timeIntervalSince1970)", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Goal Notifications
    func scheduleGoalReminder(goal: String, progress: Double) {
        let content = UNMutableNotificationContent()
        content.title = "Goal Progress"
        content.body = "You're \(Int(progress * 100))% towards your goal: \(goal)"
        content.sound = .default
        content.categoryIdentifier = "GOAL_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "goal_reminder_\(Date().timeIntervalSince1970)", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Custom Notifications
    func scheduleCustomNotification(title: String, body: String, timeInterval: TimeInterval) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        content.categoryIdentifier = "CUSTOM_CATEGORY"
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        let request = UNNotificationRequest(identifier: "custom_\(Date().timeIntervalSince1970)", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Cancel Notifications
    func cancelNotification(identifier: String) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [identifier])
    }
    
    func cancelAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }
    
    // MARK: - Helper Functions
    private func formatTime(_ timeInterval: TimeInterval) -> String {
        let hours = Int(timeInterval) / 3600
        let minutes = Int(timeInterval) % 3600 / 60
        return String(format: "%d:%02d", hours, minutes)
    }
}

// MARK: - Notification Categories
extension VeriGradeNotificationManager {
    func setupNotificationCategories() {
        let timerCategory = UNNotificationCategory(
            identifier: "TIMER_CATEGORY",
            actions: [
                UNNotificationAction(identifier: "STOP_TIMER", title: "Stop Timer", options: [.foreground]),
                UNNotificationAction(identifier: "PAUSE_TIMER", title: "Pause Timer", options: [])
            ],
            intentIdentifiers: [],
            options: []
        )
        
        let expenseCategory = UNNotificationCategory(
            identifier: "EXPENSE_CATEGORY",
            actions: [
                UNNotificationAction(identifier: "LOG_EXPENSE", title: "Log Expense", options: [.foreground]),
                UNNotificationAction(identifier: "SCAN_RECEIPT", title: "Scan Receipt", options: [.foreground])
            ],
            intentIdentifiers: [],
            options: []
        )
        
        let mileageCategory = UNNotificationCategory(
            identifier: "MILEAGE_CATEGORY",
            actions: [
                UNNotificationAction(identifier: "START_TRIP", title: "Start Trip", options: [.foreground]),
                UNNotificationAction(identifier: "LOG_MILEAGE", title: "Log Mileage", options: [.foreground])
            ],
            intentIdentifiers: [],
            options: []
        )
        
        let voiceCategory = UNNotificationCategory(
            identifier: "VOICE_CATEGORY",
            actions: [
                UNNotificationAction(identifier: "RECORD_VOICE", title: "Record Voice Note", options: [.foreground]),
                UNNotificationAction(identifier: "TRANSCRIBE_VOICE", title: "Transcribe", options: [.foreground])
            ],
            intentIdentifiers: [],
            options: []
        )
        
        let syncCategory = UNNotificationCategory(
            identifier: "SYNC_CATEGORY",
            actions: [
                UNNotificationAction(identifier: "SYNC_NOW", title: "Sync Now", options: [.foreground]),
                UNNotificationAction(identifier: "VIEW_SYNC_STATUS", title: "View Status", options: [])
            ],
            intentIdentifiers: [],
            options: []
        )
        
        UNUserNotificationCenter.current().setNotificationCategories([
            timerCategory,
            expenseCategory,
            mileageCategory,
            voiceCategory,
            syncCategory
        ])
    }
}

// MARK: - Notification Delegate
extension VeriGradeNotificationManager: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let actionIdentifier = response.actionIdentifier
        let categoryIdentifier = response.notification.request.content.categoryIdentifier
        
        switch categoryIdentifier {
        case "TIMER_CATEGORY":
            handleTimerAction(actionIdentifier)
        case "EXPENSE_CATEGORY":
            handleExpenseAction(actionIdentifier)
        case "MILEAGE_CATEGORY":
            handleMileageAction(actionIdentifier)
        case "VOICE_CATEGORY":
            handleVoiceAction(actionIdentifier)
        case "SYNC_CATEGORY":
            handleSyncAction(actionIdentifier)
        default:
            break
        }
        
        completionHandler()
    }
    
    private func handleTimerAction(_ actionIdentifier: String) {
        switch actionIdentifier {
        case "STOP_TIMER":
            // Stop timer logic
            print("Stop timer action")
        case "PAUSE_TIMER":
            // Pause timer logic
            print("Pause timer action")
        default:
            break
        }
    }
    
    private func handleExpenseAction(_ actionIdentifier: String) {
        switch actionIdentifier {
        case "LOG_EXPENSE":
            // Open expense logging
            print("Log expense action")
        case "SCAN_RECEIPT":
            // Open receipt scanning
            print("Scan receipt action")
        default:
            break
        }
    }
    
    private func handleMileageAction(_ actionIdentifier: String) {
        switch actionIdentifier {
        case "START_TRIP":
            // Start trip tracking
            print("Start trip action")
        case "LOG_MILEAGE":
            // Open mileage logging
            print("Log mileage action")
        default:
            break
        }
    }
    
    private func handleVoiceAction(_ actionIdentifier: String) {
        switch actionIdentifier {
        case "RECORD_VOICE":
            // Start voice recording
            print("Record voice action")
        case "TRANSCRIBE_VOICE":
            // Open transcription
            print("Transcribe voice action")
        default:
            break
        }
    }
    
    private func handleSyncAction(_ actionIdentifier: String) {
        switch actionIdentifier {
        case "SYNC_NOW":
            // Start sync
            print("Sync now action")
        case "VIEW_SYNC_STATUS":
            // Show sync status
            print("View sync status action")
        default:
            break
        }
    }
}







