import SwiftUI
import ClockKit

struct VeriGradeComplication: View {
    let entry: ComplicationEntry
    let complication: CLKComplication
    
    var body: some View {
        switch complication.family {
        case .circularSmall:
            CircularSmallView(entry: entry)
        case .modularSmall:
            ModularSmallView(entry: entry)
        case .modularLarge:
            ModularLargeView(entry: entry)
        case .utilitarianSmall:
            UtilitarianSmallView(entry: entry)
        case .utilitarianLarge:
            UtilitarianLargeView(entry: entry)
        case .utilitarianSmallFlat:
            UtilitarianSmallFlatView(entry: entry)
        case .extraLarge:
            ExtraLargeView(entry: entry)
        case .graphicCorner:
            GraphicCornerView(entry: entry)
        case .graphicCircular:
            GraphicCircularView(entry: entry)
        case .graphicRectangular:
            GraphicRectangularView(entry: entry)
        case .graphicBezel:
            GraphicBezelView(entry: entry)
        case .graphicExtraLarge:
            GraphicExtraLargeView(entry: entry)
        @unknown default:
            Text("Unknown")
        }
    }
}

// MARK: - Circular Small
struct CircularSmallView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        ZStack {
            Circle()
                .fill(entry.isTracking ? Color.green : Color.blue)
                .opacity(0.2)
            
            Image(systemName: entry.isTracking ? "stop.circle.fill" : "play.circle.fill")
                .font(.title2)
                .foregroundColor(entry.isTracking ? .green : .blue)
        }
    }
}

// MARK: - Modular Small
struct ModularSmallView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        VStack {
            Image(systemName: entry.isTracking ? "stop.circle.fill" : "play.circle.fill")
                .font(.title2)
                .foregroundColor(entry.isTracking ? .green : .blue)
            
            Text(entry.isTracking ? "Stop" : "Start")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Modular Large
struct ModularLargeView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "dollarsign.circle.fill")
                    .foregroundColor(.green)
                Text("VeriGrade")
                    .font(.headline)
                    .fontWeight(.semibold)
            }
            
            if entry.isTracking {
                HStack {
                    Image(systemName: "clock.fill")
                        .foregroundColor(.blue)
                    Text("Timer: \(formatTime(entry.elapsedTime))")
                        .font(.subheadline)
                }
            } else {
                HStack {
                    Image(systemName: "dollarsign.circle.fill")
                        .foregroundColor(.green)
                    Text("Today: $\(String(format: "%.2f", entry.todayExpenses))")
                        .font(.subheadline)
                }
            }
            
            HStack {
                Image(systemName: "location.fill")
                    .foregroundColor(.orange)
                Text("Miles: \(String(format: "%.1f", entry.todayMiles))")
                    .font(.subheadline)
            }
        }
        .padding(4)
    }
}

// MARK: - Utilitarian Small
struct UtilitarianSmallView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        HStack {
            Image(systemName: entry.isTracking ? "stop.circle.fill" : "play.circle.fill")
                .foregroundColor(entry.isTracking ? .green : .blue)
            Text(entry.isTracking ? "Stop" : "Start")
        }
    }
}

// MARK: - Utilitarian Large
struct UtilitarianLargeView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        HStack {
            Image(systemName: "dollarsign.circle.fill")
                .foregroundColor(.green)
            Text("$\(String(format: "%.2f", entry.todayExpenses))")
                .font(.headline)
        }
    }
}

// MARK: - Utilitarian Small Flat
struct UtilitarianSmallFlatView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        HStack {
            Image(systemName: "clock.fill")
                .foregroundColor(.blue)
            Text(formatTime(entry.elapsedTime))
        }
    }
}

// MARK: - Extra Large
struct ExtraLargeView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: entry.isTracking ? "stop.circle.fill" : "play.circle.fill")
                .font(.largeTitle)
                .foregroundColor(entry.isTracking ? .green : .blue)
            
            Text(entry.isTracking ? "Stop Timer" : "Start Timer")
                .font(.caption)
                .multilineTextAlignment(.center)
        }
    }
}

// MARK: - Graphic Corner
struct GraphicCornerView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(entry.isTracking ? Color.green.opacity(0.2) : Color.blue.opacity(0.2))
            
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Image(systemName: "dollarsign.circle.fill")
                        .foregroundColor(.green)
                    Text("$\(String(format: "%.2f", entry.todayExpenses))")
                        .font(.caption)
                        .fontWeight(.semibold)
                }
                
                if entry.isTracking {
                    HStack {
                        Image(systemName: "clock.fill")
                            .foregroundColor(.blue)
                        Text(formatTime(entry.elapsedTime))
                            .font(.caption2)
                    }
                }
            }
            .padding(4)
        }
    }
}

// MARK: - Graphic Circular
struct GraphicCircularView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        ZStack {
            Circle()
                .fill(entry.isTracking ? Color.green.opacity(0.2) : Color.blue.opacity(0.2))
            
            VStack {
                Image(systemName: entry.isTracking ? "stop.circle.fill" : "play.circle.fill")
                    .font(.title2)
                    .foregroundColor(entry.isTracking ? .green : .blue)
                
                Text(entry.isTracking ? "Stop" : "Start")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// MARK: - Graphic Rectangular
struct GraphicRectangularView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Image(systemName: "dollarsign.circle.fill")
                        .foregroundColor(.green)
                    Text("Today: $\(String(format: "%.2f", entry.todayExpenses))")
                        .font(.caption)
                        .fontWeight(.semibold)
                }
                
                HStack {
                    Image(systemName: "location.fill")
                        .foregroundColor(.orange)
                    Text("Miles: \(String(format: "%.1f", entry.todayMiles))")
                        .font(.caption2)
                }
            }
            
            Spacer()
            
            VStack {
                Image(systemName: entry.isTracking ? "stop.circle.fill" : "play.circle.fill")
                    .font(.title2)
                    .foregroundColor(entry.isTracking ? .green : .blue)
                
                Text(entry.isTracking ? "Stop" : "Start")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(entry.isTracking ? Color.green.opacity(0.1) : Color.blue.opacity(0.1))
        )
    }
}

// MARK: - Graphic Bezel
struct GraphicBezelView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        VStack(spacing: 4) {
            HStack {
                Image(systemName: "dollarsign.circle.fill")
                    .foregroundColor(.green)
                Text("VeriGrade")
                    .font(.headline)
                    .fontWeight(.semibold)
            }
            
            Text("$\(String(format: "%.2f", entry.todayExpenses))")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.green)
        }
    }
}

// MARK: - Graphic Extra Large
struct GraphicExtraLargeView: View {
    let entry: ComplicationEntry
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "dollarsign.circle.fill")
                    .foregroundColor(.green)
                Text("VeriGrade")
                    .font(.headline)
                    .fontWeight(.semibold)
            }
            
            VStack(spacing: 8) {
                HStack {
                    Text("Today's Expenses")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("$\(String(format: "%.2f", entry.todayExpenses))")
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(.green)
                }
                
                HStack {
                    Text("Miles Tracked")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("\(String(format: "%.1f", entry.todayMiles))")
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(.orange)
                }
                
                if entry.isTracking {
                    HStack {
                        Text("Timer")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(formatTime(entry.elapsedTime))
                            .font(.title3)
                            .fontWeight(.semibold)
                            .foregroundColor(.blue)
                    }
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.blue.opacity(0.1))
        )
    }
}

// MARK: - Complication Entry
struct ComplicationEntry: TimelineEntry {
    let date: Date
    let isTracking: Bool
    let elapsedTime: TimeInterval
    let todayExpenses: Double
    let todayMiles: Double
    let todayTime: TimeInterval
}

// MARK: - Helper Functions
private func formatTime(_ time: TimeInterval) -> String {
    let hours = Int(time) / 3600
    let minutes = Int(time) % 3600 / 60
    let seconds = Int(time) % 60
    return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
}

// MARK: - Complication Provider
class ComplicationProvider: CLKComplicationDataSource {
    func getComplicationDescriptors(handler: @escaping ([CLKComplicationDescriptor]) -> Void) {
        let descriptors = [
            CLKComplicationDescriptor(
                identifier: "verigrade_timer",
                displayName: "VeriGrade Timer",
                supportedFamilies: [
                    .circularSmall,
                    .modularSmall,
                    .modularLarge,
                    .utilitarianSmall,
                    .utilitarianLarge,
                    .utilitarianSmallFlat,
                    .extraLarge,
                    .graphicCorner,
                    .graphicCircular,
                    .graphicRectangular,
                    .graphicBezel,
                    .graphicExtraLarge
                ]
            )
        ]
        handler(descriptors)
    }
    
    func getCurrentTimelineEntry(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void) {
        let entry = ComplicationEntry(
            date: Date(),
            isTracking: false,
            elapsedTime: 0,
            todayExpenses: 0,
            todayMiles: 0,
            todayTime: 0
        )
        
        let timelineEntry = CLKComplicationTimelineEntry(date: Date(), complicationTemplate: createTemplate(for: complication, with: entry))
        handler(timelineEntry)
    }
    
    func getTimelineEntries(for complication: CLKComplication, after date: Date, limit: Int, withHandler handler: @escaping ([CLKComplicationTimelineEntry]?) -> Void) {
        // Return empty array for now - in a real app, you'd fetch data from your backend
        handler([])
    }
    
    private func createTemplate(for complication: CLKComplication, with entry: ComplicationEntry) -> CLKComplicationTemplate {
        switch complication.family {
        case .circularSmall:
            return CLKComplicationTemplateCircularSmallSimpleText(
                textProvider: CLKSimpleTextProvider(text: "VG")
            )
        case .modularSmall:
            return CLKComplicationTemplateModularSmallSimpleText(
                textProvider: CLKSimpleTextProvider(text: "VG")
            )
        case .modularLarge:
            return CLKComplicationTemplateModularLargeStandardBody(
                headerTextProvider: CLKSimpleTextProvider(text: "VeriGrade"),
                body1TextProvider: CLKSimpleTextProvider(text: "Today: $0.00"),
                body2TextProvider: CLKSimpleTextProvider(text: "Miles: 0.0")
            )
        case .utilitarianSmall:
            return CLKComplicationTemplateUtilitarianSmallFlat(
                textProvider: CLKSimpleTextProvider(text: "VeriGrade")
            )
        case .utilitarianLarge:
            return CLKComplicationTemplateUtilitarianLargeFlat(
                textProvider: CLKSimpleTextProvider(text: "VeriGrade - $0.00")
            )
        case .utilitarianSmallFlat:
            return CLKComplicationTemplateUtilitarianSmallFlat(
                textProvider: CLKSimpleTextProvider(text: "VG")
            )
        case .extraLarge:
            return CLKComplicationTemplateExtraLargeSimpleText(
                textProvider: CLKSimpleTextProvider(text: "VeriGrade")
            )
        case .graphicCorner:
            return CLKComplicationTemplateGraphicCornerTextImage(
                textProvider: CLKSimpleTextProvider(text: "VeriGrade"),
                imageProvider: CLKImageProvider(onePieceImage: UIImage(systemName: "dollarsign.circle.fill")!)
            )
        case .graphicCircular:
            return CLKComplicationTemplateGraphicCircularStackText(
                line1TextProvider: CLKSimpleTextProvider(text: "VeriGrade"),
                line2TextProvider: CLKSimpleTextProvider(text: "$0.00")
            )
        case .graphicRectangular:
            return CLKComplicationTemplateGraphicRectangularStandardBody(
                headerTextProvider: CLKSimpleTextProvider(text: "VeriGrade"),
                body1TextProvider: CLKSimpleTextProvider(text: "Today: $0.00"),
                body2TextProvider: CLKSimpleTextProvider(text: "Miles: 0.0")
            )
        case .graphicBezel:
            return CLKComplicationTemplateGraphicBezelCircularText(
                circularTemplate: CLKComplicationTemplateGraphicCircularStackText(
                    line1TextProvider: CLKSimpleTextProvider(text: "VeriGrade"),
                    line2TextProvider: CLKSimpleTextProvider(text: "$0.00")
                ),
                textProvider: CLKSimpleTextProvider(text: "Business Tracking")
            )
        case .graphicExtraLarge:
            return CLKComplicationTemplateGraphicExtraLargeCircularStackText(
                line1TextProvider: CLKSimpleTextProvider(text: "VeriGrade"),
                line2TextProvider: CLKSimpleTextProvider(text: "$0.00"),
                line3TextProvider: CLKSimpleTextProvider(text: "Miles: 0.0")
            )
        @unknown default:
            return CLKComplicationTemplateModularSmallSimpleText(
                textProvider: CLKSimpleTextProvider(text: "VG")
            )
        }
    }
}







