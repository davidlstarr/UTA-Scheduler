# UTA Scheduler

A modern, comprehensive scheduling application for Unit Training Assemblies (UTAs) built with React and Tailwind CSS.

## Features

### 📊 Dashboard
- Real-time analytics and statistics
- Event tracking by status (Complete, In Progress, Pending)
- Top contributors visualization
- Quick action shortcuts

### 📅 Schedule Management
- **Import from Spreadsheets**: Upload Excel or CSV files to automatically populate schedules
- **Manual Event Creation**: Add custom events with detailed information
- **Person Filtering**: View schedules filtered by specific personnel
- **Event Cards**: Beautiful, informative cards showing event details
- **Status Tracking**: Visual indicators for event status
- **Delete Manual Events**: Easy removal of manually created events

### 👥 Recall Roster
- **Upload Organization Data**: Import roster information from spreadsheets
- **Mermaid Diagram Generation**: Automatically generate organizational charts
- **Interactive Visualization**: View your organization's hierarchy
- **Detailed Roster Table**: Complete personnel information display
- **Export Functionality**: Download generated diagrams

## Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Run Development Server**
```bash
npm run dev
```

The application will start at `http://localhost:3000`

3. **Build for Production**
```bash
npm run build
```

## Data Format

### Schedule Data (EPB/Evaluation Data)
The application accepts spreadsheets with the following columns:
- Ratee Name / Name
- Rank or Grade / Rank
- Evaluation Reason / Reason
- Evaluation Created Date / Created Date / Date
- Review Period Start Date / Start Date
- Evaluation Closeout Date / Closeout Date
- Review Period End Date / End Date
- Coordination Status / Status
- # Days in Coordination / Days
- Assigned To / Assigned

### Recall Roster Data
The application accepts spreadsheets with the following columns:
- Name
- Rank
- Position / Title
- Supervisor / Reports To
- Phone / Phone Number
- Email / Email Address

## Technologies Used

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **XLSX** - Excel/CSV file parsing
- **Mermaid** - Diagram generation
- **Lucide React** - Beautiful icon set

## Project Structure

```
react-app/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── FileUpload.jsx
│   │   ├── EventCard.jsx
│   │   ├── AddEventModal.jsx
│   │   └── PersonFilter.jsx
│   ├── pages/            # Main page components
│   │   ├── Dashboard.jsx
│   │   ├── Schedule.jsx
│   │   └── RecallRoster.jsx
│   ├── context/          # React Context for state management
│   │   └── ScheduleContext.jsx
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles with Tailwind
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features in Detail

### Dashboard Analytics
- Total events count with breakdown (manual vs imported)
- Personnel count and most active contributors
- Upcoming events counter
- Completed events tracking
- Status distribution visualization
- Top contributors ranking with progress bars

### Schedule Page
- **View Modes**: Toggle between all events and filtered views
- **Event Grouping**: Events automatically grouped by date
- **Rich Event Cards**: Display comprehensive event information
- **Status Indicators**: Color-coded status badges
- **Smart Filtering**: Filter by person with dropdown selector
- **Responsive Design**: Works seamlessly on mobile and desktop

### Data Persistence
- All data is saved to browser localStorage
- Automatic data restoration on app reload
- No server required - fully client-side application

## Usage Tips

1. **Start with the Dashboard**: Get an overview of all your scheduling data
2. **Import Data**: Use the Schedule page to upload your existing EPB data
3. **Add Manual Events**: Create additional events that aren't in your spreadsheets
4. **Filter by Person**: Use the person filter to focus on individual schedules
5. **Upload Recall Roster**: Generate organizational charts automatically
6. **Export Diagrams**: Save your organizational charts for presentations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Adding New Features

1. Components go in `src/components/`
2. Pages go in `src/pages/`
3. Global state management in `src/context/ScheduleContext.jsx`
4. Styles use Tailwind CSS utility classes

## License

Built for military scheduling efficiency.

## Support

For issues or feature requests, please refer to the project documentation.











