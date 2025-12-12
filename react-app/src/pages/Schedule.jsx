import React, { useState, useMemo, useEffect } from "react";
import { useSchedule } from "../context/ScheduleContext";
import {
  Upload,
  Plus,
  Filter,
  X,
  Calendar,
  User,
  Clock,
  FileSpreadsheet,
  Trash2,
  Edit,
  Printer,
  Settings,
} from "lucide-react";
import FileUpload from "../components/FileUpload";
import AddEventModal from "../components/AddEventModal";
import PersonFilter from "../components/PersonFilter";

const Schedule = () => {
  const { events, selectedPerson, people, removeEvent } = useSchedule();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [viewMode, setViewMode] = useState("detailed"); // 'detailed' or 'overview'
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printHeader, setPrintHeader] = useState({
    utaWeekend: "",
    fiscalYear: new Date().getFullYear(),
    unit: "",
    additionalInfo: "",
  });

  const handlePrint = () => {
    window.print();
  };

  // Load print header from localStorage
  useEffect(() => {
    const savedHeader = localStorage.getItem("uta-print-header");
    if (savedHeader) {
      setPrintHeader(JSON.parse(savedHeader));
    }
  }, []);

  // Save print header to localStorage
  const savePrintHeader = (header) => {
    setPrintHeader(header);
    localStorage.setItem("uta-print-header", JSON.stringify(header));
    setShowPrintSettings(false);
  };

  // Helper function to format date strings properly
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    // Convert to string if it's not already
    const dateStr = String(dateString);

    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateStr.split("-");

    // Validate we have all parts
    if (!year || !month || !day) return "-";

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter events based on selected person and date
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (selectedPerson) {
      filtered = filtered.filter((event) => event.person === selectedPerson);
    }

    if (selectedDate) {
      filtered = filtered.filter((event) => event.date === selectedDate);
    }

    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      if (!dateA) return 1;
      if (!dateB) return -1;
      return new Date(dateA) - new Date(dateB);
    });
  }, [events, selectedPerson, selectedDate]);

  // Create overview/summary data
  const overviewData = useMemo(() => {
    const summary = {};

    filteredEvents.forEach((event) => {
      const key = event.title || "Untitled Event";

      if (!summary[key]) {
        summary[key] = {
          title: key,
          count: 0,
          people: new Set(),
          locations: new Set(),
          dates: new Set(),
          times: new Set(),
          type: event.type,
        };
      }

      summary[key].count += 1;
      if (event.person) summary[key].people.add(event.person);
      if (event.location) summary[key].locations.add(event.location);
      if (event.date) summary[key].dates.add(event.date);
      if (event.time) summary[key].times.add(event.time);
    });

    // Convert Sets to arrays and sort by count
    return Object.values(summary)
      .map((item) => ({
        ...item,
        people: Array.from(item.people),
        locations: Array.from(item.locations),
        dates: Array.from(item.dates).sort(),
        times: Array.from(item.times),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* Print-Only Header */}
      <div className="hidden print:block">
        <div className="text-center mb-4 pb-3 border-b-2 border-gray-900">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unit Training Assembly (UTA) Schedule
          </h1>
          <div className="text-sm text-gray-800 space-y-1">
            {printHeader.unit && (
              <p className="font-semibold text-base">{printHeader.unit}</p>
            )}
            <div className="flex justify-center items-center gap-4 mt-2">
              {printHeader.utaWeekend && (
                <p className="font-medium">
                  UTA Weekend:{" "}
                  <span className="font-bold">{printHeader.utaWeekend}</span>
                </p>
              )}
              <p className="font-medium">FY {printHeader.fiscalYear}</p>
            </div>
            {printHeader.additionalInfo && (
              <p className="mt-2 text-xs">{printHeader.additionalInfo}</p>
            )}
            {selectedPerson && (
              <p className="mt-2 text-xs border-t border-gray-300 pt-2">
                Filtered by Personnel:{" "}
                <span className="font-semibold">{selectedPerson}</span>
              </p>
            )}
            {selectedDate && (
              <p className="mt-1 text-xs">
                Filtered by Date:{" "}
                <span className="font-semibold">
                  {formatDate(selectedDate)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-2 text-gray-600">
            {selectedPerson
              ? `Viewing schedule for ${selectedPerson}`
              : "View and manage all UTA events"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowPrintSettings(true)}
            className="btn-secondary flex items-center print:hidden"
          >
            <Settings className="h-4 w-4 mr-2" />
            Print Settings
          </button>
          <button
            onClick={handlePrint}
            className="btn-secondary flex items-center print:hidden"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-secondary flex items-center print:hidden"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </button>
          <button
            onClick={() => setShowAddEventModal(true)}
            className="btn-primary flex items-center print:hidden"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </button>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="card print:hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-lg font-bold text-gray-900">
                  {filteredEvents.length}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">People</p>
                <p className="text-lg font-bold text-gray-900">
                  {people.length}
                </p>
              </div>
            </div>
            {viewMode === "overview" && (
              <div className="flex items-center">
                <FileSpreadsheet className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Unique Events</p>
                  <p className="text-lg font-bold text-gray-900">
                    {overviewData.length}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="print:hidden">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field text-sm"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="text-gray-400 hover:text-gray-600"
                    title="Clear date filter"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="print:hidden">
              <PersonFilter />
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center print:hidden">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
          <button
            onClick={() => setViewMode("detailed")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "detailed"
                ? "bg-primary-600 text-white"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Detailed View
          </button>
          <button
            onClick={() => setViewMode("overview")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "overview"
                ? "bg-primary-600 text-white"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
        </div>
      </div>

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="card text-center py-12">
          <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events yet
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by importing a schedule or adding events manually
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-secondary flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </button>
            <button
              onClick={() => setShowAddEventModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </button>
          </div>
        </div>
      ) : viewMode === "overview" ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    People
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overviewData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 font-semibold rounded-full">
                        {item.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {item.people.length > 0 ? item.people.join(", ") : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {item.times.length > 0 ? item.times.join(", ") : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {item.locations.length > 0
                          ? item.locations.join(", ")
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.dates.length > 0 ? (
                        <div>
                          {item.dates.length === 1
                            ? formatDate(item.dates[0])
                            : `${formatDate(item.dates[0])} - ${formatDate(
                                item.dates[item.dates.length - 1]
                              )}`}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.type === "scheduler"
                            ? "bg-blue-100 text-blue-800"
                            : item.type === "epb"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.type === "scheduler"
                          ? "Scheduler"
                          : item.type === "epb"
                          ? "EPB"
                          : "Other"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No events to display
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {event.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.person || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.time || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {event.location || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            event.type === "scheduler"
                              ? "bg-blue-100 text-blue-800"
                              : event.type === "epb"
                              ? "bg-purple-100 text-purple-800"
                              : event.isManual
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.type === "scheduler"
                            ? "Scheduler"
                            : event.type === "epb"
                            ? "EPB"
                            : event.isManual
                            ? "Manual"
                            : "Other"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium print:hidden">
                        {event.isManual && (
                          <button
                            onClick={() => removeEvent(event.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showUploadModal && (
        <FileUpload onClose={() => setShowUploadModal(false)} />
      )}

      {showAddEventModal && (
        <AddEventModal onClose={() => setShowAddEventModal(false)} />
      )}

      {/* Print Settings Modal */}
      {showPrintSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Settings className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Print Header Settings
                </h2>
              </div>
              <button
                onClick={() => setShowPrintSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                savePrintHeader({
                  utaWeekend: formData.get("utaWeekend"),
                  fiscalYear: formData.get("fiscalYear"),
                  unit: formData.get("unit"),
                  additionalInfo: formData.get("additionalInfo"),
                });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Name
                </label>
                <input
                  type="text"
                  name="unit"
                  defaultValue={printHeader.unit}
                  className="input-field"
                  placeholder="e.g., 123rd Fighter Squadron"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UTA Weekend
                </label>
                <input
                  type="text"
                  name="utaWeekend"
                  defaultValue={printHeader.utaWeekend}
                  className="input-field"
                  placeholder="e.g., 13-14 Dec 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiscal Year
                </label>
                <input
                  type="number"
                  name="fiscalYear"
                  defaultValue={printHeader.fiscalYear}
                  className="input-field"
                  placeholder={new Date().getFullYear().toString()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  defaultValue={printHeader.additionalInfo}
                  rows="2"
                  className="input-field"
                  placeholder="e.g., Classification, POC, etc."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPrintSettings(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
