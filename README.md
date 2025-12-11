# UTA Tools

## Overview

UTA Tools is an offline, local-only HTML/JavaScript application designed for UTA scheduling and recall roster diagram generation. The application runs entirely in the browser with no backend, no internet connection required, and no data storage. All data remains in browser memory and is cleared when the browser is closed.

## Features

### UTA Scheduler
- Load Excel or CSV files exported from readiness/EPB/training spreadsheets
- Select an Airman's name from the spreadsheet
- Generate a clean, modern timeline schedule for UTA weekend
- Color-coded event types:
  - **Mandatory** (Blue)
  - **Appointment** (Green)
  - **Task** (Red)
- **General Items List** - Automatically categorizes and displays:
  - **Training Items** (Purple) - Training courses, CDC, certifications, refreshers
  - **EPB Items** (Orange) - EPB reviews, EPR documentation, performance evaluations
  - **Overdue Vouchers** (Red) - GTC vouchers, travel vouchers that need attention
- Summary statistics showing counts for each event type

### Recall Roster Diagram Builder
- Load Excel/CSV roster with columns: Name, Phone, Supervisor
- Build a supervisory tree automatically
- Generate a MermaidJS diagram of the recall chain
- Display interactive SVG diagram in the browser

## Requirements

- **Browser**: Chrome or Edge with JavaScript enabled
- **Internet**: Not required (fully offline)
- **Storage**: No data is stored locally or remotely
- **Platform**: Works on Windows, macOS, or Linux

## Installation

1. Download or extract the entire `SchedulingApp` folder
2. Ensure all files are in the same directory:
   ```
   SchedulingApp/
     index.html
     styles.css
     app.js
     vendor/
       xlsx.full.min.js
       mermaid.min.js
     example_scheduler.csv          # Example scheduler file
     example_recall_roster.csv      # Example roster file
     convert_csv_to_excel.html      # Optional CSV to Excel converter
     README.md
   ```
3. No additional installation or setup required

## Example Files

The project includes example CSV files for testing:

- **example_scheduler.csv** - Sample UTA schedule data with multiple Airmen and events
- **example_recall_roster.csv** - Sample recall roster with supervisory hierarchy
- **example_epb.csv** - Sample EPB (Enlisted Performance Brief) schedule with review sessions, documentation, and feedback meetings
- **example_epb_data.csv** - Sample EPB data export format (for reference - shows typical EPB data structure)

You can use these files directly (CSV format works with the application), or convert them to Excel format using:
- The included `convert_csv_to_excel.html` tool (open in browser and upload CSV)
- Microsoft Excel (File → Open → Save As → Excel format)
- Any spreadsheet application

## Usage

### Starting the Application

1. Navigate to the `SchedulingApp` folder
2. Double-click `index.html` to open in your default browser
   - Or right-click and select "Open with" → Chrome/Edge

### UTA Scheduler

1. Click on the **Scheduler** tab (default)
2. Click **"Upload Excel/CSV Files (Multiple)"** and select one or more schedule files
   - You can upload multiple files at once (Ctrl+Click or Cmd+Click to select multiple)
   - Each file is stored as JSON in memory
   - Files are combined into a single dataset
   - You can view the JSON representation of any uploaded file
   - You can remove individual files from the list
3. **Column Headers**: The application automatically detects columns regardless of their exact names! It works with:
   - **Any name for Name column**: "Name", "Airman", "Member", "Person", or first column
   - **Any name for Date column**: "Date", "EPB_Date", "Next_Review_Date", "Day", or any column containing dates
   - **Any name for Time columns**: "StartTime", "Start_Time", "BeginTime", "EndTime", "End_Time", "FinishTime", or variations
   - **Any name for Title column**: "Title", "Description", "Event", "Task", "Subject", "Status", "Rating", or auto-selected from available columns
   - **Any name for Location**: "Location", "Place", "Venue", "Room", "Building", or variations
   - **Any other columns**: Automatically included in Notes section

   **Examples of supported formats**:
   - Standard scheduler format: `Name, Date, StartTime, EndTime, Type, Title, Location, Notes`
   - EPB data format: `Name, Rank, Supervisor, EPB_Date, Rating, Training_Complete, CDCs_Status, PT_Score`
   - Custom formats: Any column structure will be automatically detected and mapped

   **Automatic Detection**: The application automatically determines if a row is a scheduled **event** (appears in timeline) or a **general item** (appears in General Items List) based on:
   - Items with valid times AND location → Scheduled events
   - Items with keywords like "overdue", "pending", "needs attention", "past due", "outstanding", "action required" → General items
   - Items without times → General items
   - Items with times but no general keywords → Scheduled events

4. **Choose View Type**:
   - **Individual Schedule**: View schedule for one person at a time
   - **Overall Schedule**: View combined schedule for all people from all uploaded files

5. **For Individual Schedule**:
   - Select an Airman from the dropdown menu
   - Click **"Generate Schedule"** (or it will auto-generate when you select an Airman)
   - View the timeline with all scheduled events for that person

6. **For Overall Schedule**:
   - Click **"Generate Overall Schedule"**
   - View timeline grouped by person showing all events from all uploaded files
   - See summary statistics for all people combined

7. View the **Timeline** with all scheduled events (automatically detected)

8. Review the **General Items List** below the timeline, which automatically categorizes:
   - **⚠️ Overdue EPB Items** (Red) - EPB/EPR items that are overdue or past due date
   - **Training Items** (Purple) - Any items containing keywords like "training", "CDC", "course", "certification", "qualification", or "refresher"
   - **EPB Items** (Orange) - Any items containing keywords like "EPB", "EPR", "performance", "evaluation", "review session", or "feedback meeting"
   - **Overdue Vouchers** (Red) - Any items containing keywords like "voucher", "GTC", "travel", or "overdue"
   - **Note**: General items are marked with a "General Item" badge. Scheduled events that match categories will appear in both the timeline AND the general list for visibility.

8. **View JSON Data**: Click the "JSON" button next to any uploaded file to view its JSON representation
   - JSON data is stored in memory (not saved to disk)
   - You can copy the JSON to clipboard
   - Useful for debugging or data inspection

9. Review the summary statistics at the bottom
   - Individual view: Shows counts for selected person
   - Overall view: Shows total counts and number of people

### Recall Roster Diagram Builder

1. Click on the **Recall Roster** tab
2. Click **"Upload Excel/CSV File"** and select your roster file
3. The file should contain the following columns:
   - `Name` - Airman's name
   - `Phone` - Phone number (string)
   - `Supervisor` - Name of the supervisor (leave blank for CC/root)
4. Click **"Generate Diagram"**
5. View the interactive supervisory tree diagram
6. The diagram shows the recall chain with names and phone numbers

## File Format Examples

### UTA Scheduler File Format

| Name | Date | StartTime | EndTime | Type | Title | Location | Notes |
|------|------|-----------|---------|------|-------|----------|-------|
| John Doe | 2024-01-15 | 07:00 | 07:30 | mandatory | Roll Call | Squadron Room | Accountability |
| John Doe | 2024-01-15 | 08:00 | 09:00 | task | EPB Review | Office | |
| John Doe | 2024-01-15 | 09:00 | 09:30 | appointment | PHA Appointment | MDG Clinic | |

### Recall Roster File Format

| Name | Phone | Supervisor |
|------|-------|------------|
| CC Jones | 555-0001 | |
| MSgt Brown | 555-1111 | CC Jones |
| SSgt Smith | 555-2222 | MSgt Brown |

## Technical Details

### Architecture
- **Pure HTML/CSS/JavaScript** - No frameworks or build tools
- **SheetJS (xlsx.js)** - For parsing Excel and CSV files
- **MermaidJS** - For generating flowchart diagrams
- **No Backend** - All processing happens client-side
- **No Storage** - No localStorage, cookies, or server communication

### Browser Compatibility
- Chrome (recommended)
- Edge
- Firefox (may work but not tested)
- Safari (may work but not tested)

### Data Privacy
- All data processing occurs in browser memory only
- No data is transmitted over the network
- No data is stored on disk
- Data is cleared when the browser tab/window is closed
- Safe for use with sensitive information on government workstations

## Troubleshooting

### File Won't Load
- Ensure the file is in Excel (.xlsx, .xls) or CSV format
- Check that the file contains the required columns
- Verify the file is not corrupted

### No Events Appear
- Check that the selected Airman's name matches exactly (case-sensitive)
- Verify the Date and Time columns are formatted correctly
- Check browser console for error messages (F12)

### Diagram Won't Render
- Ensure the roster file has Name, Phone, and Supervisor columns
- Check that supervisor names match exactly (case-sensitive)
- Verify MermaidJS library loaded correctly (check browser console)

### Timeline Not Sorting Correctly
- Ensure dates are in YYYY-MM-DD format
- Ensure times are in HH:MM or HHMM format
- Check for any invalid date/time values in the spreadsheet

## Support

For issues or questions:
1. Check the browser console (F12) for error messages
2. Verify file formats match the examples above
3. Ensure all vendor files are present in the `vendor/` folder

## License

This application is provided as-is for internal use. All vendor libraries (SheetJS, MermaidJS) maintain their respective licenses.

## Version

Version 1.0 - Initial release

