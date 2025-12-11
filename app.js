/**
 * UTA Tools - Main Application JavaScript
 * Offline-only application for UTA scheduling and recall roster diagram generation
 */

// Global state (persisted to localStorage)
let schedulerData = []; // Combined data from all uploaded files
let uploadedFiles = []; // Array of { name, data, json } objects
let manualEvents = []; // Array of manually entered events
let recallData = [];

// Initialize application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadPersistedData();
  initializeTabs();
  initializeScheduler();
  initializeRecallRoster();
  updateStatus("Ready");
});

/**
 * Load persisted data from localStorage
 */
function loadPersistedData() {
  try {
    // Load uploaded files
    const savedFiles = localStorage.getItem("uta_tools_uploaded_files");
    if (savedFiles) {
      const parsedFiles = JSON.parse(savedFiles);
      // Reconstruct file objects with all needed properties
      uploadedFiles = parsedFiles.map((file) => ({
        name: file.name,
        normalizedData: file.normalizedData,
        recordCount: file.recordCount,
        // Regenerate JSON for viewing
        json: JSON.stringify(file.normalizedData, null, 2),
        // originalData not needed for persisted files
        originalData: [],
        // Preserve original columns if available
        originalColumns: file.originalColumns || [],
      }));
      console.log(`Loaded ${uploadedFiles.length} persisted file(s)`);
    }

    // Load manual events
    const savedManualEvents = localStorage.getItem("uta_tools_manual_events");
    if (savedManualEvents) {
      manualEvents = JSON.parse(savedManualEvents);
      console.log(`Loaded ${manualEvents.length} persisted manual event(s)`);
    }

    // Rebuild combined data
    if (uploadedFiles.length > 0 || manualEvents.length > 0) {
      rebuildCombinedData();
    }
  } catch (error) {
    console.error("Error loading persisted data:", error);
    // Clear corrupted data
    localStorage.removeItem("uta_tools_uploaded_files");
    localStorage.removeItem("uta_tools_manual_events");
    uploadedFiles = [];
    manualEvents = [];
  }
}

/**
 * Save data to localStorage
 */
function savePersistedData() {
  try {
    // Save uploaded files (without the File objects, just the data)
    const filesToSave = uploadedFiles.map((file) => ({
      name: file.name,
      normalizedData: file.normalizedData,
      recordCount: file.recordCount,
      originalColumns: file.originalColumns || [], // Preserve original column names
      // Don't save originalData or json as they can be regenerated
    }));
    localStorage.setItem(
      "uta_tools_uploaded_files",
      JSON.stringify(filesToSave)
    );

    // Save manual events
    localStorage.setItem(
      "uta_tools_manual_events",
      JSON.stringify(manualEvents)
    );
  } catch (error) {
    console.error("Error saving persisted data:", error);
    // Handle quota exceeded error
    if (error.name === "QuotaExceededError") {
      updateStatus(
        "Warning: Storage limit reached. Some data may not be saved."
      );
    }
  }
}

/**
 * Initialize tab navigation
 */
function initializeTabs() {
  const overviewTab = document.getElementById("overview-tab");
  const schedulerTab = document.getElementById("scheduler-tab");
  const recallRosterTab = document.getElementById("recall-roster-tab");
  const overviewSection = document.getElementById("overview-section");
  const schedulerSection = document.getElementById("scheduler-section");
  const recallRosterSection = document.getElementById("recall-roster-section");

  overviewTab.addEventListener("click", () => {
    overviewTab.classList.add("active");
    schedulerTab.classList.remove("active");
    recallRosterTab.classList.remove("active");
    overviewSection.classList.add("active");
    schedulerSection.classList.remove("active");
    recallRosterSection.classList.remove("active");
    updateOverview();
    updateStatus("Overview tab active");
  });

  schedulerTab.addEventListener("click", () => {
    schedulerTab.classList.add("active");
    overviewTab.classList.remove("active");
    recallRosterTab.classList.remove("active");
    schedulerSection.classList.add("active");
    overviewSection.classList.remove("active");
    recallRosterSection.classList.remove("active");
    updateStatus("Scheduler tab active");
  });

  recallRosterTab.addEventListener("click", () => {
    recallRosterTab.classList.add("active");
    overviewTab.classList.remove("active");
    schedulerTab.classList.remove("active");
    recallRosterSection.classList.add("active");
    overviewSection.classList.remove("active");
    schedulerSection.classList.remove("active");
    updateStatus("Recall Roster tab active");
  });
}

/**
 * Initialize UTA Scheduler functionality
 */
function initializeScheduler() {
  const schedulerFileInput = document.getElementById("scheduler-file");
  const airmanSelect = document.getElementById("airman-select");
  const generateButton = document.getElementById("generate-schedule");
  const timelineContainer = document.getElementById("timeline");
  const generalListContainer = document.getElementById("general-list");
  const summaryContainer = document.getElementById("summary");

  // Restore UI if data was loaded from localStorage
  if (schedulerData.length > 0) {
    updateUploadedFilesList();
    populateAirmanDropdown(schedulerData, airmanSelect);
    airmanSelect.disabled = false;
    generateButton.disabled = false;
  }
  
  // Initialize overview on load
  updateOverview();

  // Handle multiple file uploads
  schedulerFileInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    updateStatus(`Loading ${files.length} file(s)...`);
    let filesLoaded = 0;
    const totalFiles = files.length;

    files.forEach((file) => {
      parseExcelFile(
        file,
        (data) => {
          // Always normalize the data to handle any column structure
          const normalizedData =
            data.length > 0 ? normalizeNonStandardFormat(data) : data;

          // Extract original column names from the first row of data
          const originalColumns = data.length > 0 ? Object.keys(data[0]) : [];

          // Store as JSON
          const fileData = {
            name: file.name,
            originalData: data,
            normalizedData: normalizedData,
            json: JSON.stringify(normalizedData, null, 2),
            recordCount: normalizedData.length,
            originalColumns: originalColumns, // Store original column names
          };

          // Check if file already exists (by name)
          const existingIndex = uploadedFiles.findIndex(
            (f) => f.name === file.name
          );
          if (existingIndex >= 0) {
            uploadedFiles[existingIndex] = fileData;
          } else {
            uploadedFiles.push(fileData);
          }

          filesLoaded++;

          // Rebuild combined data (includes manual events)
          rebuildCombinedData();

          // Save to localStorage
          savePersistedData();

          // Update UI
          updateUploadedFilesList();
          populateAirmanDropdown(schedulerData, airmanSelect);

          if (filesLoaded === totalFiles) {
            // Rebuild to include manual events
            rebuildCombinedData();

            // Save to localStorage
            savePersistedData();

            updateStatus(
              `Loaded ${totalFiles} file(s): ${schedulerData.length} total records`
            );
            airmanSelect.disabled = schedulerData.length === 0;
            generateButton.disabled = schedulerData.length === 0;
          }
        },
        (error) => {
          filesLoaded++;
          updateStatus(`Error loading ${file.name}: ${error.message}`);
          console.error("File parsing error:", error);

          if (filesLoaded === totalFiles) {
            // Still update UI even if some files failed
            rebuildCombinedData();
            savePersistedData();
            updateUploadedFilesList();
            populateAirmanDropdown(schedulerData, airmanSelect);
            airmanSelect.disabled = schedulerData.length === 0;
            generateButton.disabled = schedulerData.length === 0;
          }
        }
      );
    });
  });

  // Handle view toggle (individual vs overall)
  const viewToggles = document.querySelectorAll('input[name="schedule-view"]');
  viewToggles.forEach((toggle) => {
    toggle.addEventListener("change", () => {
      if (toggle.checked) {
        const viewType = toggle.value;
        if (viewType === "overall") {
          airmanSelect.style.display = "none";
          generateButton.textContent = "Generate Overall Schedule";
          if (schedulerData.length > 0) {
            generateOverallSchedule();
          }
        } else {
          airmanSelect.style.display = "block";
          generateButton.textContent = "Generate Schedule";
          if (airmanSelect.value) {
            generateButton.click();
          } else {
            // Clear display if no airman selected
            timelineContainer.innerHTML = "";
            generalListContainer.innerHTML = "";
            summaryContainer.innerHTML = "";
          }
        }
      }
    });
  });

  // Handle schedule generation
  generateButton.addEventListener("click", () => {
    const viewType =
      document.querySelector('input[name="schedule-view"]:checked')?.value ||
      "individual";

    if (viewType === "overall") {
      generateOverallSchedule();
    } else {
      const selectedAirman = airmanSelect.value;
      if (!selectedAirman) {
        updateStatus("Please select an Airman");
        return;
      }

      // Rebuild combined data to ensure manual events are included
      rebuildCombinedData();

      // Debug: Check if manual events are in schedulerData
      console.log(
        "Scheduler data before filter:",
        schedulerData.length,
        "items"
      );
      console.log("Manual events:", manualEvents.length, "items");
      console.log("Selected airman:", selectedAirman);

      const airmanEvents = filterEventsByAirman(schedulerData, selectedAirman);
      console.log(
        "Filtered events for",
        selectedAirman,
        ":",
        airmanEvents.length,
        "items"
      );
      console.log(
        "Event types:",
        airmanEvents.map((e) => ({
          name: e.Name,
          itemType: e.itemType,
          title: e.Title,
        }))
      );

      if (airmanEvents.length === 0) {
        updateStatus("No events found for selected Airman");
        timelineContainer.innerHTML = "<p>No events found for this Airman.</p>";
        generalListContainer.innerHTML = "";
        summaryContainer.innerHTML = "";
        return;
      }

      // Always render as table
      renderScheduleTable(airmanEvents, timelineContainer);

      renderGeneralList(airmanEvents, generalListContainer);
      renderSummary(airmanEvents, summaryContainer);
      const printBtn = document.getElementById("print-schedule");
      if (printBtn) printBtn.disabled = false;
      updateStatus(`Schedule generated: ${airmanEvents.length} events`);
    }
  });

  // Auto-generate when airman is selected (if file already loaded)
  airmanSelect.addEventListener("change", () => {
    if (
      airmanSelect.value &&
      (schedulerData.length > 0 || manualEvents.length > 0)
    ) {
      generateButton.click();
    }
  });

  // Handle print schedule
  const printButton = document.getElementById("print-schedule");
  printButton.addEventListener("click", () => {
    printSchedule();
  });

  // Handle manual event entry
  const manualEventForm = document.getElementById("manual-event-form");
  const clearFormButton = document.getElementById("clear-form-button");

  manualEventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addManualEvent();
  });

  clearFormButton.addEventListener("click", () => {
    manualEventForm.reset();
  });
}

/**
 * Add manually entered event
 */
function addManualEvent() {
  const eventInput = document.getElementById("manual-event");
  const timeInput = document.getElementById("manual-time");
  const typeInput = document.getElementById("manual-type");
  const locationInput = document.getElementById("manual-location");
  const nameInput = document.getElementById("manual-name");
  const notesInput = document.getElementById("manual-notes");

  const event = eventInput.value.trim();
  const time = timeInput.value.trim();
  const type = typeInput.value.trim() || "task";
  const location = locationInput.value.trim();
  const name = nameInput.value.trim();
  const notes = notesInput.value.trim();

  if (!event) {
    updateStatus("✗ Error: Event name is required. Please enter an event name.");
    // Highlight the event input field
    eventInput.focus();
    eventInput.style.borderColor = "#e74c3c";
    setTimeout(() => {
      eventInput.style.borderColor = "";
    }, 2000);
    return;
  }

  // Parse time range if provided
  let startTime = "";
  let endTime = "";
  let timeError = "";
  
  if (time) {
    if (time.includes("-") || time.includes("–")) {
      const separator = time.includes("–") ? "–" : "-";
      const parts = time.split(separator);
      if (parts.length === 2) {
        startTime = parts[0].trim();
        endTime = parts[1].trim();
      } else {
        startTime = time;
      }
    } else {
      startTime = time;
    }
  }

  // Determine item type based on whether it has times
  // If it has times, it's an event; if not, it's a general item
  const startTimeParsed = startTime ? parseTime(startTime) : null;
  const endTimeParsed = endTime ? parseTime(endTime) : null;
  
  // Validate time format if provided
  if (time && time.trim() !== "") {
    if (!startTimeParsed) {
      timeError = `Invalid time format: "${time}". Please use format like "07:00", "0700", or "07:00-08:00".`;
    } else if (endTime && endTime.trim() !== "" && !endTimeParsed) {
      timeError = `Invalid end time format: "${endTime}". Please use format like "07:00" or "0700".`;
    }
  }
  
  // If there's a time error, show it but still allow adding as general item
  if (timeError) {
    updateStatus(timeError + " Adding as general item without time.");
  }
  
  // Consider it an event if there's a valid start time (end time is optional)
  const hasValidTime =
    startTime &&
    startTime.trim() !== "" &&
    startTimeParsed !== null;

  // Create normalized event object
  const manualEvent = {
    Name: name,
    Date: "", // Manual events don't have dates by default
    StartTime: hasValidTime ? startTime : "",
    EndTime: hasValidTime && endTimeParsed ? endTime : "",
    Type: type, // Use selected type
    Title: event,
    Location: location,
    Notes: notes || "Manually entered", // Use provided notes or default
    _isManual: true, // Flag to identify manual events
    _manualEventId: Date.now() + Math.random(), // Unique ID for manual events
    itemType: hasValidTime ? "event" : "general", // Pre-classify the item type
  };

  // Add to manual events array
  try {
    manualEvents.push(manualEvent);

    // Rebuild combined data
    rebuildCombinedData();

    // Save to localStorage
    savePersistedData();

    // Update UI
    const airmanSelectEl = document.getElementById("airman-select");
    const generateButtonEl = document.getElementById("generate-schedule");
    populateAirmanDropdown(schedulerData, airmanSelectEl);
    airmanSelectEl.disabled = schedulerData.length === 0;
    generateButtonEl.disabled = schedulerData.length === 0;
    
    // Provide clear success message
    const itemTypeLabel = hasValidTime ? "scheduled event" : "general item";
    const nameLabel = name ? ` for ${name}` : " (for everyone)";
    
    // Format time for display (HH:MM format)
    let timeLabel = "";
    if (hasValidTime && startTimeParsed) {
      const hours = String(startTimeParsed.hours).padStart(2, "0");
      const minutes = String(startTimeParsed.minutes).padStart(2, "0");
      timeLabel = ` at ${hours}:${minutes}`;
      if (endTimeParsed) {
        const endHours = String(endTimeParsed.hours).padStart(2, "0");
        const endMinutes = String(endTimeParsed.minutes).padStart(2, "0");
        timeLabel += `-${endHours}:${endMinutes}`;
      }
    }
    
    if (!timeError) {
      updateStatus(`✓ ${itemTypeLabel.charAt(0).toUpperCase() + itemTypeLabel.slice(1)} added: "${event}"${nameLabel}${timeLabel}`);
    } else {
      updateStatus(`✓ General item added: "${event}"${nameLabel} (time ignored due to invalid format)`);
    }
    
    // Update overview if on that tab
    const overviewSection = document.getElementById("overview-section");
    if (overviewSection && overviewSection.classList.contains("active")) {
      updateOverview();
    }

    // Clear form
    document.getElementById("manual-event-form").reset();
  } catch (error) {
    console.error("Error adding manual event:", error);
    updateStatus(`✗ Error adding event: ${error.message}. Please try again.`);
  }

  // Auto-generate if in individual view and name matches selected airman
  const viewType =
    document.querySelector('input[name="schedule-view"]:checked')?.value ||
    "individual";
  if (viewType === "individual" && airmanSelectEl.value === name) {
    generateButtonEl.click();
  }
}

/**
 * Rebuild combined data from uploaded files and manual events
 */
function rebuildCombinedData() {
  schedulerData = [];

  // Add uploaded files data
  uploadedFiles.forEach((f) => {
    schedulerData = schedulerData.concat(f.normalizedData);
  });

  // Add manual events (they already have itemType set)
  schedulerData = schedulerData.concat(manualEvents);

  // Update uploaded files list to show manual events count
  updateUploadedFilesList();
}

/**
 * Clear all persisted data (for testing/debugging)
 */
function clearAllPersistedData() {
  if (
    confirm(
      "Clear all persisted data? This will remove all uploaded files and manual events."
    )
  ) {
    localStorage.removeItem("uta_tools_uploaded_files");
    localStorage.removeItem("uta_tools_manual_events");
    uploadedFiles = [];
    manualEvents = [];
    schedulerData = [];
    rebuildCombinedData();
    updateUploadedFilesList();
    populateAirmanDropdown(
      schedulerData,
      document.getElementById("airman-select")
    );
    updateStatus("All persisted data cleared");
  }
}

/**
 * Initialize Recall Roster functionality
 */
function initializeRecallRoster() {
  const rosterFileInput = document.getElementById("roster-file");
  const generateButton = document.getElementById("generate-roster");
  const diagramContainer = document.getElementById("diagram");

  // Handle file upload
  rosterFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      updateStatus("Loading roster file...");
      parseExcelFile(
        file,
        (data) => {
          recallData = data;
          generateButton.disabled = false;
          updateStatus(`Roster loaded: ${data.length} members found`);
        },
        (error) => {
          updateStatus(`Error: ${error.message}`);
          console.error("File parsing error:", error);
        }
      );
    }
  });

  // Handle diagram generation
  generateButton.addEventListener("click", () => {
    if (recallData.length === 0) {
      updateStatus("Please upload a roster file first");
      return;
    }

    const mermaidCode = generateMermaidDiagram(recallData);
    renderMermaidDiagram(mermaidCode, diagramContainer);
    updateStatus("Recall diagram generated");
  });
}

/**
 * Detect column types dynamically by analyzing headers and content
 * @param {Array} data - Raw data from spreadsheet
 * @returns {Object} Column mapping configuration
 */
function detectColumnMapping(data) {
  if (data.length === 0) {
    return {};
  }

  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  const mapping = {
    name: null,
    date: null,
    startTime: null,
    endTime: null,
    type: null,
    title: null,
    location: null,
    notes: [],
  };

  // Analyze each column - prioritize Event, Time, Location, Name format
  columns.forEach((col) => {
    const colLower = col.toLowerCase().trim();
    const colNormalized = colLower.replace(/[_\s-]/g, "");

    // Detect Event column (highest priority - new standard format)
    if (!mapping.title && colNormalized === "event") {
      mapping.title = col;
    }
    // Detect Time column (new standard format - may contain time range)
    else if (!mapping.startTime && colNormalized === "time") {
      mapping.startTime = col; // Store in startTime, we'll parse the range
    }
    // Detect Location column (new standard format)
    else if (!mapping.location && colNormalized === "location") {
      mapping.location = col;
    }
    // Detect Name column (new standard format or fallback)
    else if (
      !mapping.name &&
      (colNormalized === "name" ||
        colNormalized === "ratename" ||
        colNormalized.includes("name") ||
        colNormalized === "airman" ||
        colNormalized === "member" ||
        colNormalized === "person" ||
        columns.indexOf(col) === 0)
    ) {
      mapping.name = col;
    }
    // Detect Date column (fallback for compatibility)
    else if (
      !mapping.date &&
      (colNormalized.includes("date") ||
        colNormalized.includes("day") ||
        parseDate(firstRow[col]) !== null)
    ) {
      mapping.date = col;
    }
    // Detect StartTime column (fallback for compatibility)
    else if (
      !mapping.startTime &&
      (colNormalized.includes("starttime") ||
        colNormalized.includes("start_time") ||
        colNormalized.includes("begintime") ||
        (colNormalized.includes("start") && colNormalized.includes("time")) ||
        (colNormalized === "start" && parseTime(firstRow[col]) !== null))
    ) {
      mapping.startTime = col;
    }
    // Detect EndTime column (fallback for compatibility)
    else if (
      !mapping.endTime &&
      (colNormalized.includes("endtime") ||
        colNormalized.includes("end_time") ||
        colNormalized.includes("finishtime") ||
        (colNormalized.includes("end") && colNormalized.includes("time")) ||
        (colNormalized === "end" && parseTime(firstRow[col]) !== null))
    ) {
      mapping.endTime = col;
    }
    // Detect Type column
    else if (
      !mapping.type &&
      (colNormalized.includes("type") ||
        colNormalized.includes("category") ||
        colNormalized === "kind")
    ) {
      mapping.type = col;
    }
    // Detect Title/Description column (fallback - but not if it's already the name column)
    else if (
      !mapping.title &&
      col !== mapping.name &&
      (colNormalized.includes("title") ||
        colNormalized.includes("description") ||
        colNormalized.includes("task") ||
        colNormalized.includes("subject") ||
        colNormalized.includes("summary") ||
        colNormalized.includes("item"))
    ) {
      mapping.title = col;
    }
    // Detect Location column (fallback)
    else if (
      !mapping.location &&
      (colNormalized.includes("place") ||
        colNormalized.includes("venue") ||
        colNormalized.includes("room") ||
        colNormalized.includes("building"))
    ) {
      mapping.location = col;
    }
    // Everything else goes to notes
    else {
      mapping.notes.push(col);
    }
  });

  // If no title found, try to find a good title column from notes
  if (!mapping.title && mapping.notes.length > 0) {
    // Priority order for title candidates
    const titleCandidates = mapping.notes.filter((col) => {
      const colLower = col.toLowerCase();
      return (
        colLower.includes("status") ||
        colLower.includes("rating") ||
        colLower.includes("review") ||
        colLower.includes("epb") ||
        colLower.includes("epr") ||
        colLower.includes("type") ||
        colLower.includes("category")
      );
    });
    if (titleCandidates.length > 0) {
      mapping.title = titleCandidates[0];
      mapping.notes = mapping.notes.filter((c) => c !== titleCandidates[0]);
    } else if (mapping.notes.length > 0) {
      // Use first notes column as title if no better candidate
      mapping.title = mapping.notes[0];
      mapping.notes = mapping.notes.slice(1);
    }
  }

  // Ensure we have at least a name column (use first column if nothing detected)
  if (!mapping.name && columns.length > 0) {
    mapping.name = columns[0];
  }

  return mapping;
}

/**
 * Normalize any spreadsheet format to scheduler format using dynamic column detection
 * @param {Array} data - Raw data from spreadsheet
 * @returns {Array} Normalized data in scheduler format
 */
function normalizeNonStandardFormat(data) {
  if (data.length === 0) {
    return [];
  }

  // Detect column mapping
  const mapping = detectColumnMapping(data);

  return data.map((row) => {
    // Extract mapped fields
    const name = mapping.name
      ? (row[mapping.name] || "").toString().trim()
      : "";
    const date = mapping.date
      ? (row[mapping.date] || "").toString().trim()
      : "";

    // Handle Time column - may contain time range like "0700-0800" or "07:00-08:00"
    let startTime = "";
    let endTime = "";

    if (mapping.startTime) {
      const timeValue = (row[mapping.startTime] || "").toString().trim();
      // Check if it's a time range (contains dash or hyphen)
      if (timeValue.includes("-") || timeValue.includes("–")) {
        const separator = timeValue.includes("–") ? "–" : "-";
        const parts = timeValue.split(separator);
        if (parts.length === 2) {
          startTime = parts[0].trim();
          endTime = parts[1].trim();
        } else {
          startTime = timeValue;
        }
      } else {
        startTime = timeValue;
      }
    }

    // Fallback to separate start/end time columns if available
    if (!startTime && mapping.startTime && !mapping.endTime) {
      startTime = (row[mapping.startTime] || "").toString().trim();
    }
    if (!endTime && mapping.endTime) {
      endTime = (row[mapping.endTime] || "").toString().trim();
    }

    const type = mapping.type
      ? (row[mapping.type] || "").toString().toLowerCase().trim()
      : "task";
    const title = mapping.title
      ? (row[mapping.title] || "").toString().trim()
      : "";
    const location = mapping.location
      ? (row[mapping.location] || "").toString().trim()
      : "";

    // Build notes from all other columns
    const notesParts = [];
    
    // List of columns to preserve directly (not put in Notes)
    const preserveColumns = [
      "Ratee Name",
      "Rank or Grade",
      "Evaluation Reason",
      "Evaluation Created Date",
      "Review Period Start Date",
      "Evaluation Closeout Date",
      "Review Period End Date",
      "Coordination Status",
      "# Days in Coordination",
      "Assigned To"
    ];
    
    mapping.notes.forEach((col) => {
      // Don't add preserved columns to notes
      if (!preserveColumns.includes(col)) {
        const value = row[col];
        if (value && value.toString().trim() !== "") {
          // Format the column name nicely
          const formattedKey = col
            .replace(/_/g, " ")
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          notesParts.push(`${formattedKey}: ${value}`);
        }
      }
    });

    // Also add any unmapped columns that might have been missed
    Object.keys(row).forEach((key) => {
      const isMapped =
        key === mapping.name ||
        key === mapping.date ||
        key === mapping.startTime ||
        key === mapping.endTime ||
        key === mapping.type ||
        key === mapping.title ||
        key === mapping.location ||
        mapping.notes.includes(key) ||
        preserveColumns.includes(key);

      if (!isMapped) {
        const value = row[key];
        if (value && value.toString().trim() !== "") {
          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          notesParts.push(`${formattedKey}: ${value}`);
        }
      }
    });

    // Create title if missing
    let finalTitle = title;
    if (!finalTitle || finalTitle === "") {
      // Try to create title from notes or other fields
      if (notesParts.length > 0) {
        // Use first note as title
        finalTitle = notesParts[0].split(":")[0] || "General Item";
      } else {
        finalTitle = "General Item";
      }
    }

    // Preserve all original row data, especially EPB evaluation columns
    const result = {
      Name: name,
      Date: date,
      StartTime: startTime,
      EndTime: endTime,
      Type: type || "task",
      Title: finalTitle,
      Location: location,
    };
    
    // Only add Notes if there are actual notes (not empty)
    if (notesParts.length > 0) {
      result.Notes = notesParts.join(" | ");
    }
    
    // Preserve EPB evaluation columns from original row
    if (row["Ratee Name"]) result["Ratee Name"] = row["Ratee Name"];
    if (row["Rank or Grade"]) result["Rank or Grade"] = row["Rank or Grade"];
    if (row["Evaluation Reason"]) result["Evaluation Reason"] = row["Evaluation Reason"];
    if (row["Evaluation Created Date"]) result["Evaluation Created Date"] = row["Evaluation Created Date"];
    if (row["Review Period Start Date"]) result["Review Period Start Date"] = row["Review Period Start Date"];
    if (row["Evaluation Closeout Date"]) result["Evaluation Closeout Date"] = row["Evaluation Closeout Date"];
    if (row["Review Period End Date"]) result["Review Period End Date"] = row["Review Period End Date"];
    if (row["Coordination Status"]) result["Coordination Status"] = row["Coordination Status"];
    if (row["# Days in Coordination"]) result["# Days in Coordination"] = row["# Days in Coordination"];
    if (row["Assigned To"]) result["Assigned To"] = row["Assigned To"];
    
    return result;
  });
}

/**
 * Parse Excel or CSV file using SheetJS
 * @param {File} file - The file to parse
 * @param {Function} onSuccess - Callback with parsed data
 * @param {Function} onError - Callback with error
 */
function parseExcelFile(file, onSuccess, onError) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        defval: "", // Default value for empty cells
        raw: false, // Convert all values to strings
      });

      onSuccess(jsonData);
    } catch (error) {
      onError(error);
    }
  };

  reader.onerror = () => {
    onError(new Error("Failed to read file"));
  };

  reader.readAsArrayBuffer(file);
}

/**
 * Populate airman dropdown with unique names from data
 * @param {Array} data - Parsed spreadsheet data
 * @param {HTMLElement} selectElement - Select dropdown element
 */
function populateAirmanDropdown(data, selectElement) {
  // Extract unique names
  const names = [
    ...new Set(
      data.map((row) => row.Name).filter((name) => name && name.trim())
    ),
  ];
  names.sort();

  // Clear existing options
  selectElement.innerHTML = '<option value="">Select an Airman...</option>';

  // Add options
  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    selectElement.appendChild(option);
  });
}

/**
 * Determine if a row is an event (scheduled) or a general item (administrative/pending)
 * @param {Object} row - Row data from spreadsheet
 * @returns {string} 'event' or 'general'
 */
function determineItemType(row) {
  const title = (row.Title || "").toLowerCase();
  const type = (row.Type || "").toLowerCase();
  const notes = (row.Notes || "").toLowerCase();
  const location = (row.Location || "").toLowerCase();
  const searchText = `${title} ${type} ${notes} ${location}`;

  // Check if it has valid scheduled times
  const hasValidTime =
    row.StartTime &&
    row.EndTime &&
    row.StartTime.trim() !== "" &&
    row.EndTime.trim() !== "" &&
    parseTime(row.StartTime) !== null &&
    parseTime(row.EndTime) !== null;

  // Keywords that indicate this is a general item (not a scheduled event)
  const generalItemKeywords = [
    "overdue",
    "pending",
    "needs attention",
    "past due",
    "due date",
    "status",
    "complete",
    "incomplete",
    "missing",
    "required",
    "outstanding",
    "outstanding epb",
    "outstanding training",
    "outstanding voucher",
    "needs review",
    "needs completion",
    "action required",
    "follow up",
    "reminder",
  ];

  // Check if it contains general item keywords
  const hasGeneralKeywords = generalItemKeywords.some((keyword) =>
    searchText.includes(keyword)
  );

  // Items with valid times AND location are definitely events
  if (hasValidTime && location.trim() !== "") {
    return "event";
  }

  // Items with valid times but no general keywords are events
  if (hasValidTime && !hasGeneralKeywords) {
    return "event";
  }

  // Items with general keywords are general items (even if they have times)
  if (hasGeneralKeywords) {
    return "general";
  }

  // Items without times are general items
  if (!hasValidTime) {
    return "general";
  }

  // Default: if it has times, it's an event
  return hasValidTime ? "event" : "general";
}

/**
 * Filter events by airman name and sort by date/time
 * Also determines if items are events or general items
 * @param {Array} data - All event data
 * @param {string} airmanName - Name of the airman to filter
 * @returns {Array} Filtered and sorted events with itemType property
 */
function filterEventsByAirman(data, airmanName) {
  const normalizedName = airmanName.trim().toLowerCase();
  return data
    .filter(
      (row) => {
        // Include events with no name (empty or undefined) - these are for everyone
        if (!row.Name || row.Name.trim() === "") {
          return true;
        }
        // Include events that match the airman's name
        return row.Name.trim().toLowerCase() === normalizedName;
      }
    )
    .map((row) => {
      // Parse date and times
      const dateStr = row.Date || "";
      const startTimeStr = row.StartTime || "";
      const endTimeStr = row.EndTime || "";

      // Determine if this is an event or general item
      // Use pre-classified itemType if available (for manual events), otherwise determine it
      const itemType = row.itemType || determineItemType(row);

      // Create Date objects for sorting
      let startDateTime = null;
      let endDateTime = null;

      try {
        // Handle different date formats
        const date = parseDate(dateStr);
        const startTime = parseTime(startTimeStr);
        const endTime = parseTime(endTimeStr);

        if (date && startTime) {
          startDateTime = new Date(date);
          startDateTime.setHours(startTime.hours, startTime.minutes, 0, 0);
        }

        if (date && endTime) {
          endDateTime = new Date(date);
          endDateTime.setHours(endTime.hours, endTime.minutes, 0, 0);
        }
      } catch (error) {
        console.warn("Error parsing date/time:", error);
      }

      // Preserve all original row data, especially EPB evaluation columns
      const result = {
        Name: row.Name,
        Date: dateStr,
        StartTime: startTimeStr,
        EndTime: endTimeStr,
        Type: (row.Type || "").toLowerCase(),
        Title: row.Title || "",
        Location: row.Location || "",
        Notes: row.Notes || "",
        itemType: itemType, // 'event' or 'general'
        _startDateTime: startDateTime,
        _endDateTime: endDateTime,
      };
      
      // Preserve EPB evaluation columns
      if (row["Ratee Name"]) result["Ratee Name"] = row["Ratee Name"];
      if (row["Rank or Grade"]) result["Rank or Grade"] = row["Rank or Grade"];
      if (row["Evaluation Reason"]) result["Evaluation Reason"] = row["Evaluation Reason"];
      if (row["Evaluation Created Date"]) result["Evaluation Created Date"] = row["Evaluation Created Date"];
      if (row["Review Period Start Date"]) result["Review Period Start Date"] = row["Review Period Start Date"];
      if (row["Evaluation Closeout Date"]) result["Evaluation Closeout Date"] = row["Evaluation Closeout Date"];
      if (row["Review Period End Date"]) result["Review Period End Date"] = row["Review Period End Date"];
      if (row["Coordination Status"]) result["Coordination Status"] = row["Coordination Status"];
      if (row["# Days in Coordination"]) result["# Days in Coordination"] = row["# Days in Coordination"];
      if (row["Assigned To"]) result["Assigned To"] = row["Assigned To"];
      
      return result;
    })
    .sort((a, b) => {
      // Sort events by date/time, general items by title
      if (a.itemType === "event" && b.itemType === "event") {
        if (a._startDateTime && b._startDateTime) {
          return a._startDateTime - b._startDateTime;
        }
        if (a.Date !== b.Date) {
          return a.Date.localeCompare(b.Date);
        }
        return a.StartTime.localeCompare(b.StartTime);
      }
      // General items come after events, sorted by title
      if (a.itemType === "general" && b.itemType === "general") {
        return a.Title.localeCompare(b.Title);
      }
      // Events come before general items
      return a.itemType === "event" ? -1 : 1;
    });
}

/**
 * Parse date string (handles YYYY-MM-DD and other formats)
 * @param {string} dateStr - Date string
 * @returns {Date|null} Parsed date or null
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Try ISO format first (YYYY-MM-DD)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try other common formats
  const parts = dateStr.split(/[-\/]/);
  if (parts.length === 3) {
    // Assume YYYY-MM-DD or MM/DD/YYYY
    if (parts[0].length === 4) {
      date = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      date = new Date(parts[2], parts[0] - 1, parts[1]);
    }
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Parse time string (handles HH:MM format)
 * @param {string} timeStr - Time string
 * @returns {Object|null} Object with hours and minutes, or null
 */
function parseTime(timeStr) {
  if (!timeStr) return null;

  // Remove any whitespace
  timeStr = timeStr.trim();

  // Handle HH:MM format (e.g., "07:00", "7:30")
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { hours, minutes };
    }
  }

  // Handle HHMM format (military time without colon)
  // Supports 3-digit (e.g., "730" = 7:30) and 4-digit (e.g., "0730" = 7:30, "0700" = 7:00)
  const match2 = timeStr.match(/^(\d{3,4})$/);
  if (match2) {
    const time = match2[1];
    let hours, minutes;
    
    if (time.length === 4) {
      // 4-digit format: HHMM (e.g., "0700" = 7:00, "1430" = 14:30)
      hours = parseInt(time.substring(0, 2), 10);
      minutes = parseInt(time.substring(2, 4), 10);
    } else if (time.length === 3) {
      // 3-digit format: HMM (e.g., "730" = 7:30, "930" = 9:30)
      hours = parseInt(time.substring(0, 1), 10);
      minutes = parseInt(time.substring(1, 3), 10);
    }
    
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { hours, minutes };
    }
  }

  return null;
}

/**
 * Format time for display (HHMM format)
 * @param {string} timeStr - Time string
 * @returns {string} Formatted time
 */
function formatTime(timeStr) {
  if (!timeStr) return "";

  const time = parseTime(timeStr);
  if (time) {
    const hours = String(time.hours).padStart(2, "0");
    const minutes = String(time.minutes).padStart(2, "0");
    return `${hours}${minutes}`;
  }

  return timeStr;
}

/**
 * Render timeline of events (only items classified as 'event')
 * @param {Array} events - Array of event objects
 * @param {HTMLElement} container - Container element
 */
function renderTimeline(events, container) {
  // Filter to only show items classified as events
  const scheduledEvents = events.filter((event) => event.itemType === "event");

  if (scheduledEvents.length === 0) {
    container.innerHTML = "<p>No scheduled events found.</p>";
    return;
  }

  container.innerHTML = scheduledEvents
    .map((event) => {
      const timeRange = `${formatTime(event.StartTime)}–${formatTime(
        event.EndTime
      )}`;
      const typeClass = event.Type || "task";
      const title = escapeHtml(event.Title || "Untitled");
      const location = escapeHtml(event.Location || "");
      const notes = escapeHtml(event.Notes || "");

      return `
      <div class="timeline-item ${typeClass}">
        <div class="timeline-time">${timeRange}</div>
        <div class="timeline-title">${title}</div>
        ${
          location
            ? `<div class="timeline-location">Location: ${location}</div>`
            : ""
        }
        ${notes ? `<div class="timeline-notes">Notes: ${notes}</div>` : ""}
        <span class="timeline-type">${typeClass}</span>
      </div>
    `;
    })
    .join("");
}

/**
 * Render schedule as a table (matching overview table style)
 * @param {Array} events - Array of event objects
 * @param {HTMLElement} container - Container element
 */
function renderScheduleTable(events, container) {
  // Filter to only show items classified as events
  const scheduledEvents = events.filter((event) => event.itemType === "event");

  if (scheduledEvents.length === 0) {
    container.innerHTML = "<p>No scheduled events found.</p>";
    return;
  }

  // Sort events by date and time
  const sortedEvents = [...scheduledEvents].sort((a, b) => {
    if (a._startDateTime && b._startDateTime) {
      return a._startDateTime - b._startDateTime;
    }
    if (a.Date !== b.Date) {
      return (a.Date || "").localeCompare(b.Date || "");
    }
    return (a.StartTime || "").localeCompare(b.StartTime || "");
  });

  let html = `
    <div class="schedule-table-wrapper">
      <table class="schedule-data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Event</th>
            <th>Type</th>
            <th>Location</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  sortedEvents.forEach((event, index) => {
    const date = event.Date || "";
    const timeRange = event.StartTime && event.EndTime
      ? `${formatTime(event.StartTime)}–${formatTime(event.EndTime)}`
      : formatTime(event.StartTime) || "";
    const title = escapeHtml(event.Title || "Untitled");
    const type = (event.Type || "task").toLowerCase();
    const location = escapeHtml(event.Location || "");
    const notes = escapeHtml(event.Notes || "");
    const canDelete = event._isManual || event._manualEventId; // Only manual events can be deleted
    const eventId = event._manualEventId || `event-${index}`;

    html += `
      <tr class="schedule-table-row schedule-table-row-${type}" data-event-id="${eventId}">
        <td>${escapeHtml(date)}</td>
        <td>${timeRange}</td>
        <td>${title}</td>
        <td><span class="type-badge type-${type}">${type}</span></td>
        <td>${location}</td>
        <td>${notes}</td>
        <td>
          ${canDelete ? `<button class="delete-event-btn" data-event-id="${eventId}" title="Remove event">🗑️</button>` : ''}
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render overall schedule as a table (grouped by person, matching overview style)
 * @param {Array} events - Array of event objects
 * @param {HTMLElement} container - Container element
 */
function renderOverallScheduleTable(events, container) {
  const scheduledEvents = events.filter((event) => event.itemType === "event");

  if (scheduledEvents.length === 0) {
    container.innerHTML = "<p>No scheduled events found.</p>";
    return;
  }

  // Sort all events together (not grouped by person)
  const sortedEvents = scheduledEvents.sort((a, b) => {
    if (a._startDateTime && b._startDateTime) {
      return a._startDateTime - b._startDateTime;
    }
    if (a.Date !== b.Date) {
      return (a.Date || "").localeCompare(b.Date || "");
    }
    return (a.StartTime || "").localeCompare(b.StartTime || "");
  });

  let html = `
    <div class="schedule-table-wrapper">
      <table class="schedule-data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Event</th>
            <th>Type</th>
            <th>Location</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  sortedEvents.forEach((event, index) => {
    // Events without names are for everyone
    const name = (event.Name && event.Name.trim() !== "") ? event.Name : "Everyone";
    const date = event.Date || "";
    const timeRange = event.StartTime && event.EndTime
      ? `${formatTime(event.StartTime)}–${formatTime(event.EndTime)}`
      : formatTime(event.StartTime) || "";
    const title = escapeHtml(event.Title || "Untitled");
    const type = (event.Type || "task").toLowerCase();
    const location = escapeHtml(event.Location || "");
    const notes = escapeHtml(event.Notes || "");
    const canDelete = event._isManual || event._manualEventId; // Only manual events can be deleted
    const eventId = event._manualEventId || `event-${index}`;

    html += `
      <tr class="schedule-table-row schedule-table-row-${type}" data-event-id="${eventId}">
        <td>${escapeHtml(name)}</td>
        <td>${escapeHtml(date)}</td>
        <td>${timeRange}</td>
        <td>${title}</td>
        <td><span class="type-badge type-${type}">${type}</span></td>
        <td>${location}</td>
        <td>${notes}</td>
        <td>
          ${canDelete ? `<button class="delete-event-btn" data-event-id="${eventId}" title="Remove event">🗑️</button>` : ''}
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Add event listeners for delete buttons
  container.querySelectorAll('.delete-event-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = btn.getAttribute('data-event-id');
      removeEvent(eventId);
    });
  });
}

/**
 * Remove an event (manual events only)
 * @param {string} eventId - The unique ID of the event to remove
 */
function removeEvent(eventId) {
  if (!eventId) return;

  // Find and remove the manual event
  // Handle both string and number comparisons for the ID
  const eventIndex = manualEvents.findIndex(e => {
    if (!e._isManual && !e._manualEventId) return false;
    // Compare as strings to handle both number and string IDs
    return String(e._manualEventId) === String(eventId);
  });

  if (eventIndex === -1) {
    updateStatus("Event not found or cannot be removed");
    return;
  }

  const removedEvent = manualEvents[eventIndex];
  manualEvents.splice(eventIndex, 1);

  // Rebuild combined data
  rebuildCombinedData();

  // Save to localStorage
  savePersistedData();

  // Update UI
  const airmanSelect = document.getElementById("airman-select");
  const generateButton = document.getElementById("generate-schedule");
  populateAirmanDropdown(schedulerData, airmanSelect);
  airmanSelect.disabled = schedulerData.length === 0;
  generateButton.disabled = schedulerData.length === 0;

  updateStatus(`Event removed: ${removedEvent.Title || 'Untitled'}`);

  // Regenerate the current view
  const viewType = document.querySelector('input[name="schedule-view"]:checked')?.value || "individual";
  if (viewType === "overall") {
    generateOverallSchedule();
  } else {
    if (airmanSelect.value) {
      generateButton.click();
    }
  }

  // Update overview if on that tab
  const overviewSection = document.getElementById("overview-section");
  if (overviewSection && overviewSection.classList.contains("active")) {
    updateOverview();
  }
}

/**
 * Render summary statistics
 * @param {Array} events - Array of event objects
 * @param {HTMLElement} container - Container element
 */
function renderSummary(events, container) {
  const counts = events.reduce((acc, event) => {
    const type = (event.Type || "task").toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const mandatoryCount = counts.mandatory || 0;
  const appointmentCount = counts.appointment || 0;
  const taskCount = counts.task || 0;

  container.innerHTML = `
    <span class="summary-pill mandatory">Mandatory: ${mandatoryCount}</span>
    <span class="summary-pill appointment">Appointments: ${appointmentCount}</span>
    <span class="summary-pill task">Tasks: ${taskCount}</span>
  `;
}

/**
 * Categorize events into training, EPB, EPB evaluations, and overdue vouchers
 * Includes both general items and events that match categories
 * @param {Array} events - Array of event objects
 * @returns {Object} Categorized events
 */
function categorizeGeneralItems(events) {
  const training = [];
  const epbEvaluations = [];
  const overdueVouchers = [];
  const overdueEpb = [];

  events.forEach((event) => {
    const title = (event.Title || "").toLowerCase();
    const type = (event.Type || "").toLowerCase();
    const notes = (event.Notes || "").toLowerCase();
    const searchText = `${title} ${type} ${notes}`;

    // Check for EPB evaluation data (has specific EPB evaluation columns)
    const hasEpbEvaluationColumns =
      event["Ratee Name"] ||
      event["Rank or Grade"] ||
      event["Evaluation Reason"] ||
      event["Evaluation Created Date"] ||
      event["Review Period Start Date"] ||
      event["Evaluation Closeout Date"] ||
      event["Review Period End Date"] ||
      event["Coordination Status"] ||
      event["# Days in Coordination"] ||
      event["Assigned To"];

    if (hasEpbEvaluationColumns) {
      epbEvaluations.push(event);
      return; // Don't add to other categories
    }

    // Include all items (both events and general items) in categorization
    // General items will be highlighted, but scheduled events that match
    // categories will also appear in the general list for visibility

    // Check for overdue EPB items (highest priority - goes to overdue EPB category)
    if (
      (searchText.includes("overdue") &&
        (searchText.includes("epb") || searchText.includes("epr"))) ||
      (searchText.includes("epb") && searchText.includes("overdue")) ||
      (searchText.includes("epr") && searchText.includes("overdue")) ||
      searchText.includes("overdue epb") ||
      searchText.includes("overdue epr")
    ) {
      overdueEpb.push(event);
      return; // Don't add to regular EPB list
    }

    // Check for training items
    if (
      searchText.includes("training") ||
      searchText.includes("cdc") ||
      searchText.includes("course") ||
      searchText.includes("certification") ||
      searchText.includes("qualification") ||
      searchText.includes("refresher") ||
      searchText.includes("overdue training")
    ) {
      training.push(event);
    }

    // Check for overdue vouchers
    if (
      searchText.includes("voucher") ||
      searchText.includes("gtc") ||
      searchText.includes("travel") ||
      (searchText.includes("overdue") &&
        (searchText.includes("voucher") ||
          searchText.includes("gtc") ||
          searchText.includes("travel"))) ||
      searchText.includes("overdue voucher")
    ) {
      overdueVouchers.push(event);
    }

    // All items (both events and general items) that match categories are included
    // General items will be highlighted with "No Scheduled Time" badge
  });

  return { training, epbEvaluations, overdueVouchers, overdueEpb };
}

/**
 * Render general list (training, EPB, overdue vouchers, overdue EPBs)
 * @param {Array} events - Array of event objects
 * @param {HTMLElement} container - Container element
 */
function renderGeneralList(events, container) {
  const categorized = categorizeGeneralItems(events);
  const { training, epbEvaluations, overdueVouchers, overdueEpb } = categorized;

  // Only show if there are items in any category
  if (
    training.length === 0 &&
    epbEvaluations.length === 0 &&
    overdueVouchers.length === 0 &&
    overdueEpb.length === 0
  ) {
    container.innerHTML = "";
    return;
  }

  let html = '<div class="general-list-header"><h3>General Items</h3></div>';

  // Helper function to render a category as a table
  const renderCategoryTable = (items, categoryName, icon) => {
    if (items.length === 0) return "";

    let tableHtml = `
      <div class="general-list-section">
        <div class="general-list-category ${categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-category">${icon} ${categoryName}</div>
        <div class="schedule-table-wrapper">
          <table class="schedule-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Item</th>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
    `;

    items.forEach((item, index) => {
      const name = escapeHtml(item.Name || "");
      const title = escapeHtml(item.Title || "Untitled");
      const date = escapeHtml(item.Date || "");
      const hasTime =
        item.StartTime &&
        item.EndTime &&
        item.StartTime.trim() !== "" &&
        item.EndTime.trim() !== "";
      const timeRange = hasTime
        ? `${formatTime(item.StartTime)}–${formatTime(item.EndTime)}`
        : "";
      const type = (item.Type || "task").toLowerCase();
      const notes = escapeHtml(item.Notes || "");
      const isGeneralItem = item.itemType === "general";
      const generalBadge = isGeneralItem
        ? ' <span class="type-badge" style="background-color: #95a5a6; color: white; margin-left: 0.5rem;">General</span>'
        : "";
      const canDelete = item._isManual || item._manualEventId; // Only manual events can be deleted
      const eventId = item._manualEventId || `general-${categoryName}-${index}`;

      tableHtml += `
        <tr class="general-table-row" data-event-id="${eventId}">
          <td>${name}</td>
          <td>${title}${generalBadge}</td>
          <td>${date}</td>
          <td>${timeRange}</td>
          <td><span class="type-badge type-${type}">${type}</span></td>
          <td>${notes}</td>
          <td>
            ${canDelete ? `<button class="delete-event-btn" data-event-id="${eventId}" title="Remove item">🗑️</button>` : ''}
          </td>
        </tr>
      `;
    });

    tableHtml += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    return tableHtml;
  };

  // Helper function to render EPB evaluations with all their columns
  const renderEpbEvaluationsTable = (items) => {
    if (items.length === 0) return "";

    let tableHtml = `
      <div class="general-list-section">
        <div class="general-list-category epbevaluations-category">📊 EPB Evaluations</div>
        <div class="schedule-table-wrapper">
          <table class="schedule-data-table">
            <thead>
              <tr>
                <th>Ratee Name</th>
                <th>Rank or Grade</th>
                <th>Evaluation Reason</th>
                <th>Evaluation Created Date</th>
                <th>Review Period Start Date</th>
                <th>Evaluation Closeout Date</th>
                <th>Review Period End Date</th>
                <th>Coordination Status</th>
                <th># Days in Coordination</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
    `;

    items.forEach((item) => {
      const rateeName = escapeHtml(item["Ratee Name"] || item.Name || "");
      const rankOrGrade = escapeHtml(item["Rank or Grade"] || "");
      const evaluationReason = escapeHtml(item["Evaluation Reason"] || "");
      const evaluationCreatedDate = escapeHtml(item["Evaluation Created Date"] || "");
      const reviewPeriodStartDate = escapeHtml(item["Review Period Start Date"] || "");
      const evaluationCloseoutDate = escapeHtml(item["Evaluation Closeout Date"] || "");
      const reviewPeriodEndDate = escapeHtml(item["Review Period End Date"] || "");
      const coordinationStatus = escapeHtml(item["Coordination Status"] || "");
      const daysInCoordination = escapeHtml(item["# Days in Coordination"] || "");
      const assignedTo = escapeHtml(item["Assigned To"] || "");

      tableHtml += `
        <tr class="general-table-row">
          <td>${rateeName}</td>
          <td>${rankOrGrade}</td>
          <td>${evaluationReason}</td>
          <td>${evaluationCreatedDate}</td>
          <td>${reviewPeriodStartDate}</td>
          <td>${evaluationCloseoutDate}</td>
          <td>${reviewPeriodEndDate}</td>
          <td>${coordinationStatus}</td>
          <td>${daysInCoordination}</td>
          <td>${assignedTo}</td>
        </tr>
      `;
    });

    tableHtml += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    return tableHtml;
  };

  // Overdue EPB section (show first as highest priority)
  html += renderCategoryTable(overdueEpb, "Overdue EPB Items", "⚠️");

  // EPB Evaluations section
  html += renderEpbEvaluationsTable(epbEvaluations);

  // Training section
  html += renderCategoryTable(training, "Training Items", "📚");

  // Overdue vouchers section
  html += renderCategoryTable(overdueVouchers, "Overdue Vouchers", "💰");

  container.innerHTML = html;

  // Add event listeners for delete buttons in general items
  container.querySelectorAll('.delete-event-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = btn.getAttribute('data-event-id');
      removeEvent(eventId);
    });
  });
}

/**
 * Generate Mermaid diagram code from roster data
 * @param {Array} data - Roster data with Name, Phone, Supervisor columns
 * @returns {string} Mermaid diagram code
 */
function generateMermaidDiagram(data) {
  if (!data || data.length === 0) {
    return 'flowchart TB\n  Empty["No data available"]';
  }

  // Build node map
  const nodes = new Map();
  const edges = [];

  // Process each row
  data.forEach((row) => {
    const name = (row.Name || "").trim();
    const phone = (row.Phone || "").trim();
    const supervisor = (row.Supervisor || "").trim();

    if (!name) return; // Skip rows without names

    const nodeId = sanitizeMermaidId(name);
    nodes.set(name, {
      id: nodeId,
      name: name,
      phone: phone,
    });

    // Create edge if supervisor exists
    if (supervisor) {
      const supervisorId = sanitizeMermaidId(supervisor);
      edges.push({
        from: supervisorId,
        to: nodeId,
        supervisorName: supervisor,
      });
    }
  });

  // Build Mermaid code
  let mermaidCode = "flowchart TB\n";

  // Add all nodes
  nodes.forEach((node, name) => {
    const displayText = node.phone
      ? `${escapeMermaidText(name)}\\n${escapeMermaidText(node.phone)}`
      : escapeMermaidText(name);
    mermaidCode += `  ${node.id}["${displayText}"]\n`;
  });

  // Add all edges
  edges.forEach((edge) => {
    // Verify both nodes exist
    const fromExists = Array.from(nodes.values()).some(
      (n) => n.id === edge.from
    );
    const toExists = Array.from(nodes.values()).some((n) => n.id === edge.to);

    if (fromExists && toExists) {
      mermaidCode += `  ${edge.from} --> ${edge.to}\n`;
    }
  });

  return mermaidCode;
}

/**
 * Render Mermaid diagram
 * @param {string} mermaidCode - Mermaid diagram code
 * @param {HTMLElement} container - Container element
 */
function renderMermaidDiagram(mermaidCode, container) {
  // Clear container
  container.innerHTML = "";

  // Create a unique ID for this diagram
  const diagramId = "mermaid-diagram-" + Date.now();

  // Create div for Mermaid
  const mermaidDiv = document.createElement("div");
  mermaidDiv.id = diagramId;
  mermaidDiv.className = "mermaid";
  mermaidDiv.textContent = mermaidCode;
  container.appendChild(mermaidDiv);

  // Initialize Mermaid
  try {
    // Check if Mermaid is available
    if (typeof mermaid === "undefined") {
      throw new Error("Mermaid library not loaded");
    }

    // Initialize Mermaid configuration
    const config = {
      startOnLoad: false,
      theme: "default",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
      },
    };

    // Try different Mermaid API versions
    if (typeof mermaid.initialize === "function") {
      mermaid.initialize(config);
    }

    // Try mermaid.run() (v10+)
    if (typeof mermaid.run === "function") {
      mermaid
        .run({
          nodes: [mermaidDiv],
        })
        .then(() => {
          updateStatus("Diagram rendered successfully");
        })
        .catch((error) => {
          console.error("Mermaid rendering error:", error);
          // Fallback to mermaid.init()
          tryFallbackRender(mermaidDiv, mermaidCode, container);
        });
    }
    // Fallback to mermaid.init() (older versions)
    else if (typeof mermaid.init === "function") {
      tryFallbackRender(mermaidDiv, mermaidCode, container);
    }
    // Last resort: try contentLoaded
    else if (typeof mermaid.contentLoaded === "function") {
      mermaid.contentLoaded();
      updateStatus("Diagram rendered successfully");
    } else {
      throw new Error("Mermaid API not recognized");
    }
  } catch (error) {
    console.error("Mermaid initialization error:", error);
    updateStatus("Error initializing diagram renderer");
    container.innerHTML = `<pre>${escapeHtml(
      mermaidCode
    )}</pre><p style="color: red;">Error: ${error.message}</p>`;
  }
}

/**
 * Fallback Mermaid rendering using mermaid.init()
 * @param {HTMLElement} mermaidDiv - Mermaid div element
 * @param {string} mermaidCode - Mermaid code
 * @param {HTMLElement} container - Container element
 */
function tryFallbackRender(mermaidDiv, mermaidCode, container) {
  try {
    if (typeof mermaid.init === "function") {
      mermaid.init(undefined, mermaidDiv);
      updateStatus("Diagram rendered successfully");
    } else {
      throw new Error("Mermaid init function not available");
    }
  } catch (error) {
    console.error("Fallback rendering error:", error);
    updateStatus("Error rendering diagram. Check console for details.");
    container.innerHTML = `<pre>${escapeHtml(
      mermaidCode
    )}</pre><p style="color: red;">Error rendering diagram. Raw code shown above.</p>`;
  }
}

/**
 * Sanitize string for use as Mermaid node ID
 * @param {string} str - Input string
 * @returns {string} Sanitized ID
 */
function sanitizeMermaidId(str) {
  if (!str) return "node";

  // Replace spaces and special characters with underscores
  return (
    str
      .trim()
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") || "node"
  );
}

/**
 * Escape text for Mermaid (handle special characters)
 * @param {string} str - Input string
 * @returns {string} Escaped string
 */
function escapeMermaidText(str) {
  if (!str) return "";

  // Escape quotes and backslashes
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - Input string
 * @returns {string} Escaped HTML
 */
function escapeHtml(str) {
  if (!str) return "";

  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Update uploaded files list display
 */
function updateUploadedFilesList() {
  const container = document.getElementById("uploaded-files");
  if (!container) return;

  if (uploadedFiles.length === 0) {
    container.innerHTML = "";
    return;
  }

  let html = '<div class="uploaded-files-header"><h4>Data Sources</h4></div>';
  html += '<div class="uploaded-files-list">';

  // Show uploaded files
  uploadedFiles.forEach((file, index) => {
    html += `
      <div class="uploaded-file-item">
        <div class="uploaded-file-info">
          <span class="uploaded-file-name">📄 ${escapeHtml(file.name)}</span>
          <span class="uploaded-file-count">${file.recordCount} records</span>
        </div>
        <div class="uploaded-file-actions">
          <button class="view-json-btn" data-index="${index}" title="View JSON">JSON</button>
          <button class="remove-file-btn" data-index="${index}" title="Remove">×</button>
        </div>
      </div>
    `;
  });

  // Show manual events
  if (manualEvents.length > 0) {
    html += `
      <div class="uploaded-file-item manual-events-item">
        <div class="uploaded-file-info">
          <span class="uploaded-file-name">✏️ Manually Entered Events</span>
          <span class="uploaded-file-count">${manualEvents.length} events</span>
        </div>
        <div class="uploaded-file-actions">
          <button class="clear-manual-events-btn" title="Clear All Manual Events">Clear All</button>
        </div>
      </div>
    `;
  }

  html += "</div>";
  container.innerHTML = html;

  // Add event listeners
  container.querySelectorAll(".remove-file-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));
      uploadedFiles.splice(index, 1);

      // Rebuild combined data (includes manual events)
      rebuildCombinedData();

      // Save to localStorage
      savePersistedData();

      updateUploadedFilesList();
      populateAirmanDropdown(schedulerData, airmanSelect);
      updateStatus(
        `File removed. ${schedulerData.length} total records remaining.`
      );
      
      // Update overview if on that tab
      const overviewSection = document.getElementById("overview-section");
      if (overviewSection && overviewSection.classList.contains("active")) {
        updateOverview();
      }
    });
  });

  container.querySelectorAll(".view-json-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));
      const file = uploadedFiles[index];
      showJsonModal(file.name, file.json);
    });
  });

  // Handle clear manual events
  container.querySelectorAll(".clear-manual-events-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (
        confirm(`Clear all ${manualEvents.length} manually entered events?`)
      ) {
        manualEvents = [];
        rebuildCombinedData();
        updateUploadedFilesList();
        populateAirmanDropdown(
          schedulerData,
          document.getElementById("airman-select")
        );
        updateStatus("All manual events cleared");

        // Update overview if on that tab
        const overviewSection = document.getElementById("overview-section");
        if (overviewSection && overviewSection.classList.contains("active")) {
          updateOverview();
        }

        // Refresh current view
        const viewType =
          document.querySelector('input[name="schedule-view"]:checked')
            ?.value || "individual";
        if (viewType === "overall") {
          generateOverallSchedule();
        } else {
          const airmanSelect = document.getElementById("airman-select");
          if (airmanSelect.value) {
            document.getElementById("generate-schedule").click();
          }
        }
      }
    });
  });
}

/**
 * Show JSON in a modal
 */
function showJsonModal(fileName, jsonContent) {
  // Create modal
  const modal = document.createElement("div");
  modal.className = "json-modal";
  modal.innerHTML = `
    <div class="json-modal-content">
      <div class="json-modal-header">
        <h3>JSON Data: ${escapeHtml(fileName)}</h3>
        <button class="json-modal-close">×</button>
      </div>
      <div class="json-modal-body">
        <pre><code>${escapeHtml(jsonContent)}</code></pre>
      </div>
      <div class="json-modal-footer">
        <button class="copy-json-btn">Copy JSON</button>
        <button class="json-modal-close">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  modal.querySelectorAll(".json-modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  });

  // Copy handler
  modal.querySelector(".copy-json-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(jsonContent).then(() => {
      updateStatus("JSON copied to clipboard");
    });
  });

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

/**
 * Generate overall schedule for all people
 */
function generateOverallSchedule() {
  const timelineContainer = document.getElementById("timeline");
  const generalListContainer = document.getElementById("general-list");
  const summaryContainer = document.getElementById("summary");

  // Rebuild combined data to ensure manual events are included
  rebuildCombinedData();

  if (schedulerData.length === 0) {
    updateStatus("No data loaded");
    timelineContainer.innerHTML =
      "<p>Please upload files or add events manually.</p>";
    generalListContainer.innerHTML = "";
    summaryContainer.innerHTML = "";
    return;
  }

  // Process all events
  const allEvents = schedulerData
    .map((row) => {
      const dateStr = row.Date || "";
      const startTimeStr = row.StartTime || "";
      const endTimeStr = row.EndTime || "";

      let startDateTime = null;
      let endDateTime = null;

      try {
        const date = parseDate(dateStr);
        const startTime = parseTime(startTimeStr);
        const endTime = parseTime(endTimeStr);

        if (date && startTime) {
          startDateTime = new Date(date);
          startDateTime.setHours(startTime.hours, startTime.minutes, 0, 0);
        }

        if (date && endTime) {
          endDateTime = new Date(date);
          endDateTime.setHours(endTime.hours, endTime.minutes, 0, 0);
        }
      } catch (error) {
        console.warn("Error parsing date/time:", error);
      }

      // Use pre-classified itemType if available (for manual events), otherwise determine it
      const itemType = row.itemType || determineItemType(row);

      const result = {
        Name: row.Name || "",
        Date: dateStr,
        StartTime: startTimeStr,
        EndTime: endTimeStr,
        Type: (row.Type || "").toLowerCase(),
        Title: row.Title || "",
        Location: row.Location || "",
        Notes: row.Notes || "",
        itemType: itemType,
        _startDateTime: startDateTime,
        _endDateTime: endDateTime,
      };

      // Preserve EPB evaluation columns
      if (row["Ratee Name"]) result["Ratee Name"] = row["Ratee Name"];
      if (row["Rank or Grade"]) result["Rank or Grade"] = row["Rank or Grade"];
      if (row["Evaluation Reason"]) result["Evaluation Reason"] = row["Evaluation Reason"];
      if (row["Evaluation Created Date"]) result["Evaluation Created Date"] = row["Evaluation Created Date"];
      if (row["Review Period Start Date"]) result["Review Period Start Date"] = row["Review Period Start Date"];
      if (row["Evaluation Closeout Date"]) result["Evaluation Closeout Date"] = row["Evaluation Closeout Date"];
      if (row["Review Period End Date"]) result["Review Period End Date"] = row["Review Period End Date"];
      if (row["Coordination Status"]) result["Coordination Status"] = row["Coordination Status"];
      if (row["# Days in Coordination"]) result["# Days in Coordination"] = row["# Days in Coordination"];
      if (row["Assigned To"]) result["Assigned To"] = row["Assigned To"];

      return result;
    })
    .sort((a, b) => {
      if (a.itemType === "event" && b.itemType === "event") {
        if (a._startDateTime && b._startDateTime) {
          return a._startDateTime - b._startDateTime;
        }
        if (a.Date !== b.Date) {
          return a.Date.localeCompare(b.Date);
        }
        return a.StartTime.localeCompare(b.StartTime);
      }
      if (a.itemType === "general" && b.itemType === "general") {
        return a.Title.localeCompare(b.Title);
      }
      return a.itemType === "event" ? -1 : 1;
    });

  // Render timeline with all events (grouped by person)
  renderOverallScheduleTable(allEvents, timelineContainer);
  renderGeneralList(allEvents, generalListContainer);
  renderOverallSummary(allEvents, summaryContainer);
  const printBtn = document.getElementById("print-schedule");
  if (printBtn) printBtn.disabled = false;
  updateStatus(
    `Overall schedule generated: ${allEvents.length} total events from ${uploadedFiles.length} file(s)`
  );
}

/**
 * Render overall timeline grouped by person
 */
function renderOverallTimeline(events, container) {
  const scheduledEvents = events.filter((event) => event.itemType === "event");

  if (scheduledEvents.length === 0) {
    container.innerHTML = "<p>No scheduled events found.</p>";
    return;
  }

  // Group by person
  const eventsByPerson = {};
  scheduledEvents.forEach((event) => {
    // Events without names are for everyone
    const name = (event.Name && event.Name.trim() !== "") ? event.Name : "Everyone";
    if (!eventsByPerson[name]) {
      eventsByPerson[name] = [];
    }
    eventsByPerson[name].push(event);
  });

  let html = "";
  Object.keys(eventsByPerson)
    .sort()
    .forEach((name) => {
      html += `<div class="person-group">`;
      html += `<h4 class="person-name">${escapeHtml(name)}</h4>`;
      html += `<div class="person-events">`;

      eventsByPerson[name].forEach((event) => {
        const timeRange = `${formatTime(event.StartTime)}–${formatTime(
          event.EndTime
        )}`;
        const typeClass = event.Type || "task";
        const title = escapeHtml(event.Title || "Untitled");
        const location = escapeHtml(event.Location || "");
        const notes = escapeHtml(event.Notes || "");

        html += `
          <div class="timeline-item ${typeClass}">
            <div class="timeline-time">${timeRange}</div>
            <div class="timeline-title">${title}</div>
            ${
              location
                ? `<div class="timeline-location">Location: ${location}</div>`
                : ""
            }
            ${notes ? `<div class="timeline-notes">Notes: ${notes}</div>` : ""}
            <span class="timeline-type">${typeClass}</span>
          </div>
        `;
      });

      html += `</div></div>`;
    });

  container.innerHTML = html;
}

/**
 * Render overall summary statistics
 */
function renderOverallSummary(events, container) {
  const counts = events.reduce((acc, event) => {
    const type = (event.Type || "task").toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const mandatoryCount = counts.mandatory || 0;
  const appointmentCount = counts.appointment || 0;
  const taskCount = counts.task || 0;

  // Count unique people
  const uniquePeople = new Set(events.map((e) => e.Name).filter((n) => n));
  const peopleCount = uniquePeople.size;

  container.innerHTML = `
    <span class="summary-pill people-count">People: ${peopleCount}</span>
    <span class="summary-pill mandatory">Mandatory: ${mandatoryCount}</span>
    <span class="summary-pill appointment">Appointments: ${appointmentCount}</span>
    <span class="summary-pill task">Tasks: ${taskCount}</span>
  `;
}

/**
 * Print schedule - generates clean print-optimized HTML
 */
function printSchedule() {
  const viewType =
    document.querySelector('input[name="schedule-view"]:checked')?.value ||
    "individual";

  const timelineContainer = document.getElementById("timeline");
  const generalListContainer = document.getElementById("general-list");
  const summaryContainer = document.getElementById("summary");

  if (!timelineContainer || timelineContainer.innerHTML.trim() === "") {
    updateStatus("No schedule to print. Generate a schedule first.");
    return;
  }

  // Get the actual event data to render cleanly
  const selectedAirman =
    document.getElementById("airman-select")?.value || "All Personnel";
  const title =
    viewType === "overall"
      ? "Overall Schedule"
      : `Schedule - ${selectedAirman}`;

  // Rebuild combined data to ensure we have all events
  rebuildCombinedData();

  let events = [];
  if (viewType === "overall") {
    // Get all events for overall view
    events = schedulerData.map((row) => {
      const dateStr = row.Date || "";
      const startTimeStr = row.StartTime || "";
      const endTimeStr = row.EndTime || "";

      let startDateTime = null;
      let endDateTime = null;

      try {
        const date = parseDate(dateStr);
        const startTime = parseTime(startTimeStr);
        const endTime = parseTime(endTimeStr);

        if (date && startTime) {
          startDateTime = new Date(date);
          startDateTime.setHours(startTime.hours, startTime.minutes, 0, 0);
        }

        if (date && endTime) {
          endDateTime = new Date(date);
          endDateTime.setHours(endTime.hours, endTime.minutes, 0, 0);
        }
      } catch (error) {
        console.warn("Error parsing date/time:", error);
      }

      const itemType = row.itemType || determineItemType(row);

      return {
        Name: row.Name || "",
        Date: dateStr,
        StartTime: startTimeStr,
        EndTime: endTimeStr,
        Type: (row.Type || "").toLowerCase(),
        Title: row.Title || "",
        Location: row.Location || "",
        Notes: row.Notes || "",
        itemType: itemType,
        _startDateTime: startDateTime,
        _endDateTime: endDateTime,
      };
    });
  } else {
    // Get events for selected airman
    events = filterEventsByAirman(schedulerData, selectedAirman);
  }

  // Separate events and general items
  const timelineEvents = events.filter((e) => e.itemType === "event");
  const generalItems = events.filter((e) => e.itemType === "general");
  
  // Also include EPB evaluations even if they're classified as events
  const allEpbEvaluations = events.filter((row) => {
    return row["Ratee Name"] ||
           row["Rank or Grade"] ||
           row["Evaluation Reason"] ||
           row["Evaluation Created Date"] ||
           row["Review Period Start Date"] ||
           row["Evaluation Closeout Date"] ||
           row["Review Period End Date"] ||
           row["Coordination Status"] ||
           row["# Days in Coordination"] ||
           row["Assigned To"];
  });
  
  const categorized = categorizeGeneralItems(generalItems);
  
  // Add EPB evaluations to categorized items
  if (allEpbEvaluations.length > 0) {
    categorized.epbEvaluations = allEpbEvaluations;
  }

  // Generate print HTML as tables
  let timelineHTML = "";
  if (viewType === "overall") {
    // Sort all events together (not grouped by person)
    const sortedEvents = timelineEvents.sort((a, b) => {
      if (a._startDateTime && b._startDateTime) {
        return a._startDateTime - b._startDateTime;
      }
      if (a.Date !== b.Date) {
        return (a.Date || "").localeCompare(b.Date || "");
      }
      return (a.StartTime || "").localeCompare(b.StartTime || "");
    });

    timelineHTML += `<table class="print-table">`;
    timelineHTML += `<thead><tr><th>Name</th><th>Date</th><th>Time</th><th>Event</th><th>Type</th><th>Location</th><th>Notes</th></tr></thead>`;
    timelineHTML += `<tbody>`;

    sortedEvents.forEach((event) => {
      // Events without names are for everyone
      const name = (event.Name && event.Name.trim() !== "") ? event.Name : "Everyone";
      const date = escapeHtml(event.Date || "");
      const timeRange = `${formatTime(event.StartTime)}–${formatTime(
        event.EndTime
      )}`;
      const title = escapeHtml(event.Title || "Untitled");
      const type = (event.Type || "task").toLowerCase();
      const location = escapeHtml(event.Location || "");
      const notes = escapeHtml(event.Notes || "");

      timelineHTML += `<tr>`;
      timelineHTML += `<td>${escapeHtml(name)}</td>`;
      timelineHTML += `<td>${date}</td>`;
      timelineHTML += `<td>${timeRange}</td>`;
      timelineHTML += `<td>${title}</td>`;
      timelineHTML += `<td>${type}</td>`;
      timelineHTML += `<td>${location}</td>`;
      timelineHTML += `<td>${notes}</td>`;
      timelineHTML += `</tr>`;
    });

    timelineHTML += `</tbody></table>`;
  } else {
    // Individual view - table
    timelineHTML += `<table class="print-table">`;
    timelineHTML += `<thead><tr><th>Date</th><th>Time</th><th>Event</th><th>Type</th><th>Location</th><th>Notes</th></tr></thead>`;
    timelineHTML += `<tbody>`;

    timelineEvents.forEach((event) => {
      const date = escapeHtml(event.Date || "");
      const timeRange = `${formatTime(event.StartTime)}–${formatTime(
        event.EndTime
      )}`;
      const title = escapeHtml(event.Title || "Untitled");
      const type = (event.Type || "task").toLowerCase();
      const location = escapeHtml(event.Location || "");
      const notes = escapeHtml(event.Notes || "");

      timelineHTML += `<tr>`;
      timelineHTML += `<td>${date}</td>`;
      timelineHTML += `<td>${timeRange}</td>`;
      timelineHTML += `<td>${title}</td>`;
      timelineHTML += `<td>${type}</td>`;
      timelineHTML += `<td>${location}</td>`;
      timelineHTML += `<td>${notes}</td>`;
      timelineHTML += `</tr>`;
    });

    timelineHTML += `</tbody></table>`;
  }

  // Generate general items HTML as tables
  let generalItemsHTML = "";
  const { training, epbEvaluations, overdueVouchers, overdueEpb } = categorized;

  // Helper function to render category as table
  const renderCategoryPrintTable = (items, categoryName, icon) => {
    if (items.length === 0) return "";

    let tableHtml = `<div class="general-list-section">`;
    tableHtml += `<div class="general-list-category">${icon} ${categoryName}</div>`;
    tableHtml += `<table class="print-table">`;
    tableHtml += `<thead><tr><th>Name</th><th>Item</th><th>Date</th><th>Time</th><th>Type</th><th>Notes</th></tr></thead>`;
    tableHtml += `<tbody>`;

    items.forEach((item) => {
      const name = escapeHtml(item.Name || "");
      const title = escapeHtml(item.Title || "Untitled");
      const date = escapeHtml(item.Date || "");
      const hasTime =
        item.StartTime &&
        item.EndTime &&
        item.StartTime.trim() !== "" &&
        item.EndTime.trim() !== "";
      const timeRange = hasTime
        ? `${formatTime(item.StartTime)}–${formatTime(item.EndTime)}`
        : "";
      const type = (item.Type || "task").toLowerCase();
      const notes = escapeHtml(item.Notes || "");

      tableHtml += `<tr>`;
      tableHtml += `<td>${name}</td>`;
      tableHtml += `<td>${title}</td>`;
      tableHtml += `<td>${date}</td>`;
      tableHtml += `<td>${timeRange}</td>`;
      tableHtml += `<td>${type}</td>`;
      tableHtml += `<td>${notes}</td>`;
      tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table></div>`;
    return tableHtml;
  };

  // Helper function to render EPB evaluations with all columns
  const renderEpbEvaluationsPrintTable = (items) => {
    if (items.length === 0) return "";

    let tableHtml = `<div class="general-list-section">`;
    tableHtml += `<div class="general-list-category">📊 EPB Evaluations</div>`;
    tableHtml += `<table class="print-table">`;
    tableHtml += `<thead><tr><th>Ratee Name</th><th>Rank or Grade</th><th>Evaluation Reason</th><th>Evaluation Created Date</th><th>Review Period Start Date</th><th>Evaluation Closeout Date</th><th>Review Period End Date</th><th>Coordination Status</th><th># Days in Coordination</th><th>Assigned To</th></tr></thead>`;
    tableHtml += `<tbody>`;

    items.forEach((item) => {
      const rateeName = escapeHtml(item["Ratee Name"] || item.Name || "");
      const rankOrGrade = escapeHtml(item["Rank or Grade"] || "");
      const evaluationReason = escapeHtml(item["Evaluation Reason"] || "");
      const evaluationCreatedDate = escapeHtml(item["Evaluation Created Date"] || "");
      const reviewPeriodStartDate = escapeHtml(item["Review Period Start Date"] || "");
      const evaluationCloseoutDate = escapeHtml(item["Evaluation Closeout Date"] || "");
      const reviewPeriodEndDate = escapeHtml(item["Review Period End Date"] || "");
      const coordinationStatus = escapeHtml(item["Coordination Status"] || "");
      const daysInCoordination = escapeHtml(item["# Days in Coordination"] || "");
      const assignedTo = escapeHtml(item["Assigned To"] || "");

      tableHtml += `<tr>`;
      tableHtml += `<td>${rateeName}</td>`;
      tableHtml += `<td>${rankOrGrade}</td>`;
      tableHtml += `<td>${evaluationReason}</td>`;
      tableHtml += `<td>${evaluationCreatedDate}</td>`;
      tableHtml += `<td>${reviewPeriodStartDate}</td>`;
      tableHtml += `<td>${evaluationCloseoutDate}</td>`;
      tableHtml += `<td>${reviewPeriodEndDate}</td>`;
      tableHtml += `<td>${coordinationStatus}</td>`;
      tableHtml += `<td>${daysInCoordination}</td>`;
      tableHtml += `<td>${assignedTo}</td>`;
      tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table></div>`;
    return tableHtml;
  };

  if (overdueEpb.length > 0) {
    generalItemsHTML += renderCategoryPrintTable(overdueEpb, "Overdue EPB Items", "⚠️");
  }

  if (epbEvaluations && epbEvaluations.length > 0) {
    generalItemsHTML += renderEpbEvaluationsPrintTable(epbEvaluations);
  }

  if (training.length > 0) {
    generalItemsHTML += renderCategoryPrintTable(training, "Training Items", "📚");
  }


  if (overdueVouchers.length > 0) {
    generalItemsHTML += renderCategoryPrintTable(overdueVouchers, "Overdue Vouchers", "💰");
  }

  // Generate summary HTML
  const counts = events.reduce((acc, event) => {
    const type = (event.Type || "task").toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const mandatoryCount = counts.mandatory || 0;
  const appointmentCount = counts.appointment || 0;
  const taskCount = counts.task || 0;

  let summaryHTML = "";
  if (viewType === "overall") {
    const uniquePeople = new Set(events.map((e) => e.Name).filter((n) => n));
    summaryHTML = `
      <span class="summary-pill">People: ${uniquePeople.size}</span>
      <span class="summary-pill">Mandatory: ${mandatoryCount}</span>
      <span class="summary-pill">Appointments: ${appointmentCount}</span>
      <span class="summary-pill">Tasks: ${taskCount}</span>
    `;
  } else {
    summaryHTML = `
      <span class="summary-pill">Mandatory: ${mandatoryCount}</span>
      <span class="summary-pill">Appointments: ${appointmentCount}</span>
      <span class="summary-pill">Tasks: ${taskCount}</span>
    `;
  }

  // Create print window
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="UTF-8">
      <style>
        @page {
          size: letter;
          margin: 0.5in;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.5;
          color: #000;
          background: white;
        }
        .print-header {
          text-align: center;
          margin-bottom: 20pt;
          border-bottom: 2pt solid #000;
          padding-bottom: 10pt;
        }
        .print-header h1 {
          margin: 0;
          font-size: 18pt;
          font-weight: bold;
        }
        .print-header .subtitle {
          font-size: 11pt;
          margin-top: 5pt;
          color: #333;
        }
        .print-section {
          margin-bottom: 20pt;
          page-break-inside: avoid;
        }
        .print-section h2 {
          font-size: 13pt;
          font-weight: bold;
          margin: 15pt 0 10pt 0;
          border-bottom: 1pt solid #000;
          padding-bottom: 5pt;
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15pt;
          font-size: 9pt;
          page-break-inside: avoid;
        }
        .print-table thead {
          background-color: #2c3e50;
          color: white;
        }
        .print-table th {
          padding: 6pt;
          text-align: left;
          font-weight: 600;
          font-size: 9pt;
          border: 1pt solid #000;
        }
        .print-table td {
          padding: 5pt;
          border: 1pt solid #ccc;
          vertical-align: top;
        }
        .print-table tbody tr:nth-child(even) {
          background-color: #f5f5f5;
        }
        .person-group {
          margin-bottom: 20pt;
          page-break-inside: avoid;
        }
        .person-name {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 8pt;
          border-bottom: 1.5pt solid #000;
          padding-bottom: 3pt;
        }
        .general-list-section {
          margin-bottom: 15pt;
          page-break-inside: avoid;
        }
        .general-list-category {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 8pt;
          border-bottom: 1pt solid #000;
          padding-bottom: 3pt;
        }
        .summary-container {
          margin-top: 15pt;
          padding-top: 10pt;
          border-top: 1.5pt solid #000;
          display: flex;
          gap: 8pt;
          flex-wrap: wrap;
        }
        .summary-pill {
          padding: 4pt 8pt;
          border: 1pt solid #000;
          font-weight: 500;
          font-size: 9pt;
          background-color: #f0f0f0;
        }
        .print-footer {
          margin-top: 20pt;
          padding-top: 10pt;
          border-top: 1pt solid #ccc;
          font-size: 8pt;
          color: #666;
          text-align: center;
        }
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print-section {
            page-break-inside: avoid;
          }
          .print-table,
          .person-group {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .print-table tbody tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>UTA Schedule</h1>
        <div class="subtitle">${escapeHtml(title)}</div>
        <div class="subtitle" style="font-size: 9pt; margin-top: 3pt;">Generated: ${new Date().toLocaleString()}</div>
      </div>
      
      ${
        timelineHTML
          ? `
      <div class="print-section">
        <h2>Timeline</h2>
        ${timelineHTML}
      </div>
      `
          : ""
      }
      
      ${
        generalItemsHTML
          ? `
      <div class="print-section">
        <h2>General Items</h2>
        ${generalItemsHTML}
      </div>
      `
          : ""
      }
      
      ${
        summaryHTML
          ? `
      <div class="print-section">
        <h2>Summary</h2>
        <div class="summary-container">
          ${summaryHTML}
        </div>
      </div>
      `
          : ""
      }
      
      <div class="print-footer">
        UTA Tools - Generated Schedule
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
    updateStatus("Print dialog opened");
  }, 250);
}

/**
 * Update overview page with current data statistics
 */
function updateOverview() {
  const overviewContent = document.getElementById("overview-content");
  if (!overviewContent) return;

  // Rebuild combined data to ensure we have latest
  rebuildCombinedData();

  if (schedulerData.length === 0 && uploadedFiles.length === 0 && manualEvents.length === 0) {
    overviewContent.innerHTML = `
      <div class="overview-empty">
        <p>No data loaded yet.</p>
        <p>Upload files in the Scheduler tab to see statistics.</p>
      </div>
    `;
    return;
  }

  // Calculate statistics
  const totalRecords = schedulerData.length;
  const totalFiles = uploadedFiles.length;
  const totalManualEvents = manualEvents.length;

  // Get unique people
  const uniquePeople = new Set(schedulerData.map((row) => row.Name).filter((n) => n));
  const peopleCount = uniquePeople.size;

  // Count by event type
  const typeCounts = schedulerData.reduce((acc, row) => {
    const type = (row.Type || "task").toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Count events vs general items
  const eventCount = schedulerData.filter((row) => {
    const itemType = row.itemType || determineItemType(row);
    return itemType === "event";
  }).length;
  const generalItemCount = schedulerData.length - eventCount;

  // Count by person
  const personStats = {};
  schedulerData.forEach((row) => {
    const name = row.Name || "Unknown";
    if (!personStats[name]) {
      personStats[name] = {
        total: 0,
        events: 0,
        general: 0,
        mandatory: 0,
        appointment: 0,
        task: 0,
      };
    }
    personStats[name].total++;
    const itemType = row.itemType || determineItemType(row);
    if (itemType === "event") {
      personStats[name].events++;
    } else {
      personStats[name].general++;
    }
    const type = (row.Type || "task").toLowerCase();
    if (type === "mandatory") personStats[name].mandatory++;
    if (type === "appointment") personStats[name].appointment++;
    if (type === "task") personStats[name].task++;
  });

  // Categorize general items
  const categorized = categorizeGeneralItems(
    schedulerData.filter((row) => {
      const itemType = row.itemType || determineItemType(row);
      return itemType === "general";
    })
  );

  // Count EPB evaluations (from all data, not just general items)
  const epbEvaluationsCount = schedulerData.filter((row) => {
    return row["Ratee Name"] ||
           row["Rank or Grade"] ||
           row["Evaluation Reason"] ||
           row["Evaluation Created Date"] ||
           row["Review Period Start Date"] ||
           row["Evaluation Closeout Date"] ||
           row["Review Period End Date"] ||
           row["Coordination Status"] ||
           row["# Days in Coordination"] ||
           row["Assigned To"];
  }).length;

  // Generate HTML
  let html = `
    <div class="overview-stats-grid">
      <div class="stat-card">
        <div class="stat-value">${totalRecords}</div>
        <div class="stat-label">Total Records</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalFiles}</div>
        <div class="stat-label">Uploaded Files</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalManualEvents}</div>
        <div class="stat-label">Manual Events</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${peopleCount}</div>
        <div class="stat-label">People</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${eventCount}</div>
        <div class="stat-label">Scheduled Events</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${generalItemCount}</div>
        <div class="stat-label">General Items</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${epbEvaluationsCount}</div>
        <div class="stat-label">Total EPBs Due</div>
      </div>
    </div>

    <div class="overview-section">
      <h3>Event Type Breakdown</h3>
      <div class="overview-breakdown">
        <div class="breakdown-item">
          <span class="breakdown-label">Mandatory:</span>
          <span class="breakdown-value">${typeCounts.mandatory || 0}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Appointments:</span>
          <span class="breakdown-value">${typeCounts.appointment || 0}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Tasks:</span>
          <span class="breakdown-value">${typeCounts.task || 0}</span>
        </div>
      </div>
    </div>

    <div class="overview-section">
      <h3>General Items Breakdown</h3>
      <div class="overview-breakdown">
        <div class="breakdown-item">
          <span class="breakdown-label">Training:</span>
          <span class="breakdown-value">${categorized.training.length}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">EPB Evaluations:</span>
          <span class="breakdown-value">${categorized.epbEvaluations ? categorized.epbEvaluations.length : 0}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Overdue EPB:</span>
          <span class="breakdown-value">${categorized.overdueEpb.length}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Overdue Vouchers:</span>
          <span class="breakdown-value">${categorized.overdueVouchers.length}</span>
        </div>
      </div>
    </div>

    <div class="overview-section">
      <h3>Uploaded Files Data</h3>
      <div class="overview-files-tables">
        ${uploadedFiles.length > 0
          ? uploadedFiles
              .map(
                (file, index) => {
                  // Use original columns if available, otherwise get from normalized data
                  let columnArray = [];
                  
                  if (file.originalColumns && file.originalColumns.length > 0) {
                    // Use original column names from the CSV/Excel file
                    // Filter to only include columns that actually have data in normalizedData
                    columnArray = file.originalColumns.filter(col => {
                      // Check if this column exists in any row of normalized data
                      return file.normalizedData.some(row => {
                        // Direct match
                        if (row.hasOwnProperty(col)) {
                          return row[col] !== undefined && row[col] !== null && row[col] !== "";
                        }
                        return false;
                      });
                    });
                    
                    // If no columns matched, fall back to normalized data columns
                    if (columnArray.length === 0) {
                      const columns = new Set();
                      file.normalizedData.forEach((row) => {
                        Object.keys(row).forEach((key) => {
                          if (key !== "_isManual" && !key.startsWith("_")) {
                            // Exclude Notes if it wasn't in original columns
                            if (key !== "Notes" || file.originalColumns.includes("Notes")) {
                              columns.add(key);
                            }
                          }
                        });
                      });
                      columnArray = Array.from(columns).sort();
                    }
                  } else {
                    // Fallback: get columns from normalized data
                    const columns = new Set();
                    file.normalizedData.forEach((row) => {
                      Object.keys(row).forEach((key) => {
                        // Include all columns except internal ones
                        if (key !== "_isManual" && !key.startsWith("_")) {
                          // Only add Notes if it was in the original data
                          if (key !== "Notes" || (file.originalData && file.originalData.length > 0 && file.originalData.some(r => r.hasOwnProperty("Notes")))) {
                            columns.add(key);
                          }
                        }
                      });
                    });
                    columnArray = Array.from(columns).sort();
                  }

                  // Generate table rows
                  const tableRows = file.normalizedData
                    .map(
                      (row) => `
                    <tr>
                      ${columnArray
                        .map(
                          (col) => `
                        <td>${escapeHtml(
                          row[col] !== undefined && row[col] !== null
                            ? String(row[col])
                            : ""
                        )}</td>
                      `
                        )
                        .join("")}
                    </tr>
                  `
                    )
                    .join("");

                  return `
                    <div class="overview-file-table-container">
                      <div class="file-table-header">
                        <h4>${escapeHtml(file.name)}</h4>
                        <span class="file-stats-badge">${file.recordCount} records</span>
                      </div>
                      <div class="file-table-wrapper">
                        <table class="overview-data-table">
                          <thead>
                            <tr>
                              ${columnArray
                                .map(
                                  (col) => `
                                <th>${escapeHtml(
                                  col
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())
                                )}</th>
                              `
                                )
                                .join("")}
                            </tr>
                          </thead>
                          <tbody>
                            ${tableRows}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  `;
                }
              )
              .join("")
          : "<p class='no-data'>No files uploaded</p>"}
      </div>
    </div>

    <div class="overview-section">
      <h3>Statistics by Person</h3>
      <div class="overview-people-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Total</th>
              <th>Events</th>
              <th>General</th>
              <th>Mandatory</th>
              <th>Appointments</th>
              <th>Tasks</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(personStats)
              .sort()
              .map(
                (name) => `
              <tr>
                <td>${escapeHtml(name)}</td>
                <td>${personStats[name].total}</td>
                <td>${personStats[name].events}</td>
                <td>${personStats[name].general}</td>
                <td>${personStats[name].mandatory}</td>
                <td>${personStats[name].appointment}</td>
                <td>${personStats[name].task}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  overviewContent.innerHTML = html;
}

/**
 * Update status message
 * @param {string} message - Status message
 */
function updateStatus(message) {
  const statusElement = document.getElementById("status-message");
  if (statusElement) {
    statusElement.textContent = message;
  }
}
