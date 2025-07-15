# Health & Habit Tracker

A beautiful, minimal, and modern habit tracker designed for tracking your elimination diet, health metrics, gym sessions, and daily observations. Built as a single-page web application with local data storage.

## Features

### 📊 **Comprehensive Tracking**
- **Health Rating** (1-10 scale) with interactive slider
- **Diet Notes** for logging meals and new foods
- **Potential Triggers** identification
- **Gym Sessions** with intensity levels and notes
- **Symptoms** tracking
- **Mood** monitoring
- **Additional Notes** for any observations

### 📈 **Visual Analytics**
- **Health Rating Trend** - Line chart showing your health progression over time
- **Gym Activity** - Doughnut chart displaying workout intensity distribution
- **Mood Tracking** - Bar chart showing mood frequency
- **Weekly Summary** with key statistics

### 🗓️ **Flexible Data Entry**
- Add entries for any date (past, present, or future)
- Update existing entries
- Automatic data validation
- Real-time form feedback

### 📱 **Modern Design**
- Responsive design works on desktop, tablet, and mobile
- Beautiful gradient backgrounds and glass-morphism effects
- Smooth animations and transitions
- Clean, minimal interface focusing on usability

### 💾 **Data Management**
- **Local Storage** - All data is stored locally in your browser
- **No Server Required** - Works completely offline
- **Export/Import** functionality (available in JavaScript console)
- **Data Persistence** - Your data stays safe across browser sessions

## Getting Started

### Installation
1. Download all files (`index.html`, `styles.css`, `script.js`)
2. Place them in the same folder
3. Open `index.html` in your web browser

### Usage

#### 1. **Today View**
- See a quick overview of today's entries
- View quick stats: Health Rating, Meals Logged, Gym Session
- Access all entries made today

#### 2. **Add Entry**
- Click "Add Entry" in the navigation
- Fill out any fields relevant to your tracking
- Use the date picker to add entries for any day
- Health rating uses an interactive slider (1-10)
- Save your entry and view it immediately

#### 3. **Insights & Analytics**
- View charts and trends over the last 30 days
- See average health rating, weekly gym sessions
- Identify most common triggers
- Track mood patterns and gym activity distribution

#### 4. **History**
- Browse all your entries in chronological order
- Filter by month using the month picker
- See detailed breakdowns of each entry

## Elimination Diet Tracking

This tracker is specifically designed to support elimination diet protocols:

- **Track New Foods**: Use diet notes to log when you introduce new foods
- **Symptom Correlation**: Record symptoms and potential triggers
- **Health Rating**: Monitor how you feel overall each day
- **Pattern Recognition**: Use insights to identify food sensitivities
- **Timeline View**: See your health journey over time

## Data Privacy

- **100% Local**: All data is stored locally in your browser
- **No Cloud**: No data is sent to external servers
- **Private**: Only you have access to your health data
- **Secure**: Data persists safely in browser storage

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Technical Details

- **Pure Web Technologies**: HTML5, CSS3, JavaScript (ES6+)
- **Chart Library**: Chart.js for data visualization
- **Storage**: Browser localStorage API
- **Responsive**: CSS Grid and Flexbox
- **Icons**: Uses modern web fonts

## Tips for Best Results

1. **Daily Entries**: Try to log daily for best trend analysis
2. **Detailed Notes**: The more detail you provide, the better insights you'll get
3. **Consistent Rating**: Use the same criteria for health ratings
4. **Export Regularly**: Consider exporting your data periodically as backup

## Troubleshooting

**Data Not Saving?**
- Ensure JavaScript is enabled in your browser
- Check if you're in private/incognito mode (localStorage might be restricted)

**Charts Not Displaying?**
- Ensure you have an internet connection (Chart.js loads from CDN)
- Try refreshing the page

**Mobile Issues?**
- The app is responsive and should work on all screen sizes
- Try rotating your device or zooming out if needed

## Advanced Features

### Data Export/Import
```javascript
// Export data (run in browser console)
app.exportData();

// Import data (add file input to HTML or use console)
// app.importData(fileInputEvent);
```

### Clear All Data
```javascript
// Clear all stored data (run in browser console)
localStorage.removeItem('healthEntries');
location.reload();
```

## Future Enhancements

Potential features for future versions:
- Data backup to cloud storage
- Multiple user profiles
- Advanced analytics and correlations
- Medication tracking
- Food database integration
- Export to PDF reports

---

**Note**: This application runs entirely in your browser and requires no installation or server setup. Your data privacy is maintained as nothing is transmitted over the internet.
