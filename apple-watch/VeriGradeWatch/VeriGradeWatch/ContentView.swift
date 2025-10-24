import SwiftUI
import WatchKit
import HealthKit

struct ContentView: View {
    @StateObject private var viewModel = WatchViewModel()
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Quick Actions Tab
            QuickActionsView()
                .tabItem {
                    Image(systemName: "bolt.fill")
                    Text("Quick")
                }
                .tag(0)
            
            // Expense Tracking Tab
            ExpenseTrackingView()
                .tabItem {
                    Image(systemName: "dollarsign.circle.fill")
                    Text("Expense")
                }
                .tag(1)
            
            // Time Tracking Tab
            TimeTrackingView()
                .tabItem {
                    Image(systemName: "clock.fill")
                    Text("Time")
                }
                .tag(2)
            
            // Settings Tab
            SettingsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Settings")
                }
                .tag(3)
        }
        .environmentObject(viewModel)
    }
}

struct QuickActionsView: View {
    @EnvironmentObject var viewModel: WatchViewModel
    
    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Quick Expense Button
                Button(action: {
                    viewModel.startQuickExpense()
                }) {
                    VStack {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                        Text("Quick Expense")
                            .font(.caption)
                    }
                }
                .buttonStyle(QuickActionButtonStyle())
                
                // Voice Note Button
                Button(action: {
                    viewModel.startVoiceNote()
                }) {
                    VStack {
                        Image(systemName: "mic.fill")
                            .font(.title2)
                        Text("Voice Note")
                            .font(.caption)
                    }
                }
                .buttonStyle(QuickActionButtonStyle())
                
                // Time Tracking Button
                Button(action: {
                    viewModel.toggleTimeTracking()
                }) {
                    VStack {
                        Image(systemName: viewModel.isTimeTracking ? "stop.circle.fill" : "play.circle.fill")
                            .font(.title2)
                        Text(viewModel.isTimeTracking ? "Stop Timer" : "Start Timer")
                            .font(.caption)
                    }
                }
                .buttonStyle(QuickActionButtonStyle())
                
                // Mileage Tracking Button
                Button(action: {
                    viewModel.toggleMileageTracking()
                }) {
                    VStack {
                        Image(systemName: viewModel.isMileageTracking ? "location.slash.fill" : "location.fill")
                            .font(.title2)
                        Text(viewModel.isMileageTracking ? "Stop Trip" : "Start Trip")
                            .font(.caption)
                    }
                }
                .buttonStyle(QuickActionButtonStyle())
            }
            .padding()
        }
        .navigationTitle("VeriGrade")
    }
}

struct ExpenseTrackingView: View {
    @EnvironmentObject var viewModel: WatchViewModel
    @State private var amount: String = ""
    @State private var category: String = "Business"
    @State private var showingAmountInput = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Amount Input
                if showingAmountInput {
                    VStack {
                        Text("Enter Amount")
                            .font(.headline)
                        
                        TextField("0.00", text: $amount)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .keyboardType(.decimalPad)
                        
                        HStack {
                            Button("Cancel") {
                                showingAmountInput = false
                                amount = ""
                            }
                            .foregroundColor(.red)
                            
                            Button("Save") {
                                if let amountValue = Double(amount) {
                                    viewModel.saveExpense(amount: amountValue, category: category)
                                    showingAmountInput = false
                                    amount = ""
                                }
                            }
                            .foregroundColor(.blue)
                        }
                    }
                } else {
                    // Quick Amount Buttons
                    VStack {
                        Text("Quick Amounts")
                            .font(.headline)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 8) {
                            ForEach([5, 10, 25, 50, 100, 200], id: \.self) { amount in
                                Button("$\(amount)") {
                                    viewModel.saveExpense(amount: Double(amount), category: category)
                                }
                                .buttonStyle(AmountButtonStyle())
                            }
                        }
                        
                        Button("Custom Amount") {
                            showingAmountInput = true
                        }
                        .buttonStyle(CustomAmountButtonStyle())
                    }
                }
                
                // Category Selection
                if !showingAmountInput {
                    VStack {
                        Text("Category")
                            .font(.headline)
                        
                        Picker("Category", selection: $category) {
                            Text("Business").tag("Business")
                            Text("Meals").tag("Meals")
                            Text("Travel").tag("Travel")
                            Text("Office").tag("Office")
                        }
                        .pickerStyle(WheelPickerStyle())
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Expense")
    }
}

struct TimeTrackingView: View {
    @EnvironmentObject var viewModel: WatchViewModel
    @State private var elapsedTime: TimeInterval = 0
    @State private var timer: Timer?
    
    var body: some View {
        VStack(spacing: 20) {
            // Timer Display
            VStack {
                Text("Current Session")
                    .font(.headline)
                
                Text(formatTime(elapsedTime))
                    .font(.system(size: 32, weight: .bold, design: .monospaced))
                    .foregroundColor(viewModel.isTimeTracking ? .green : .gray)
            }
            
            // Timer Controls
            VStack(spacing: 12) {
                Button(action: {
                    viewModel.toggleTimeTracking()
                }) {
                    HStack {
                        Image(systemName: viewModel.isTimeTracking ? "stop.fill" : "play.fill")
                        Text(viewModel.isTimeTracking ? "Stop" : "Start")
                    }
                }
                .buttonStyle(TimerButtonStyle(isActive: viewModel.isTimeTracking))
                
                if viewModel.isTimeTracking {
                    Button("Pause") {
                        viewModel.pauseTimeTracking()
                    }
                    .buttonStyle(SecondaryButtonStyle())
                }
            }
            
            // Session Summary
            if viewModel.currentSession != nil {
                VStack {
                    Text("Today's Total")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(formatTime(viewModel.todayTotalTime))
                        .font(.title2)
                        .fontWeight(.semibold)
                }
            }
        }
        .padding()
        .navigationTitle("Time")
        .onAppear {
            startTimer()
        }
        .onDisappear {
            stopTimer()
        }
    }
    
    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            if viewModel.isTimeTracking {
                elapsedTime += 1
            }
        }
    }
    
    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
    
    private func formatTime(_ time: TimeInterval) -> String {
        let hours = Int(time) / 3600
        let minutes = Int(time) % 3600 / 60
        let seconds = Int(time) % 60
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    }
}

struct SettingsView: View {
    @EnvironmentObject var viewModel: WatchViewModel
    
    var body: some View {
        List {
            Section("Account") {
                HStack {
                    Image(systemName: "person.circle.fill")
                    Text("User: \(viewModel.userName)")
                }
                
                Button("Sync Now") {
                    viewModel.syncData()
                }
            }
            
            Section("Tracking") {
                Toggle("Auto-start Trips", isOn: $viewModel.autoStartTrips)
                Toggle("Background Tracking", isOn: $viewModel.backgroundTracking)
            }
            
            Section("Notifications") {
                Toggle("Timer Reminders", isOn: $viewModel.timerReminders)
                Toggle("Expense Alerts", isOn: $viewModel.expenseAlerts)
            }
            
            Section("About") {
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }
            }
        }
        .navigationTitle("Settings")
    }
}

// MARK: - Button Styles

struct QuickActionButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(width: 80, height: 60)
            .background(Color.blue.opacity(0.1))
            .foregroundColor(.blue)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

struct AmountButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(width: 60, height: 40)
            .background(Color.green.opacity(0.1))
            .foregroundColor(.green)
            .cornerRadius(8)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

struct CustomAmountButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.blue.opacity(0.1))
            .foregroundColor(.blue)
            .cornerRadius(8)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

struct TimerButtonStyle: ButtonStyle {
    let isActive: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity)
            .padding()
            .background(isActive ? Color.red.opacity(0.1) : Color.blue.opacity(0.1))
            .foregroundColor(isActive ? .red : .blue)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.gray.opacity(0.1))
            .foregroundColor(.gray)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

// MARK: - View Model

class WatchViewModel: ObservableObject {
    @Published var isTimeTracking: Bool = false
    @Published var isMileageTracking: Bool = false
    @Published var userName: String = "User"
    @Published var autoStartTrips: Bool = true
    @Published var backgroundTracking: Bool = true
    @Published var timerReminders: Bool = true
    @Published var expenseAlerts: Bool = true
    @Published var currentSession: TimeSession?
    @Published var todayTotalTime: TimeInterval = 0
    
    private let healthStore = HKHealthStore()
    private let workoutSession: HKWorkoutSession?
    
    init() {
        self.workoutSession = nil
        loadUserSettings()
    }
    
    func startQuickExpense() {
        // Implementation for quick expense
        print("Starting quick expense")
    }
    
    func startVoiceNote() {
        // Implementation for voice note
        print("Starting voice note")
    }
    
    func toggleTimeTracking() {
        isTimeTracking.toggle()
        
        if isTimeTracking {
            startTimeSession()
        } else {
            stopTimeSession()
        }
    }
    
    func pauseTimeTracking() {
        // Implementation for pausing time tracking
        print("Pausing time tracking")
    }
    
    func toggleMileageTracking() {
        isMileageTracking.toggle()
        
        if isMileageTracking {
            startMileageTracking()
        } else {
            stopMileageTracking()
        }
    }
    
    func saveExpense(amount: Double, category: String) {
        // Implementation for saving expense
        print("Saving expense: $\(amount) for \(category)")
    }
    
    func syncData() {
        // Implementation for syncing data
        print("Syncing data")
    }
    
    private func startTimeSession() {
        currentSession = TimeSession(startTime: Date())
    }
    
    private func stopTimeSession() {
        if let session = currentSession {
            let duration = Date().timeIntervalSince(session.startTime)
            todayTotalTime += duration
            currentSession = nil
        }
    }
    
    private func startMileageTracking() {
        // Implementation for starting mileage tracking
        print("Starting mileage tracking")
    }
    
    private func stopMileageTracking() {
        // Implementation for stopping mileage tracking
        print("Stopping mileage tracking")
    }
    
    private func loadUserSettings() {
        // Load user settings from UserDefaults
        if let savedName = UserDefaults.standard.string(forKey: "userName") {
            userName = savedName
        }
        autoStartTrips = UserDefaults.standard.bool(forKey: "autoStartTrips")
        backgroundTracking = UserDefaults.standard.bool(forKey: "backgroundTracking")
        timerReminders = UserDefaults.standard.bool(forKey: "timerReminders")
        expenseAlerts = UserDefaults.standard.bool(forKey: "expenseAlerts")
    }
}

struct TimeSession {
    let startTime: Date
}

#Preview {
    ContentView()
}







