import React, { useState } from "react";
import { X, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useSchedule } from "../context/ScheduleContext";
import * as XLSX from "xlsx";

const FileUpload = ({ onClose }) => {
  const { importScheduleData } = useSchedule();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          setError("The file appears to be empty");
          return;
        }

        // Transform data to match our event structure
        const transformedData = jsonData.map((row) => {
          // Detect format: Scheduler CSV (Event, Time, Location, Name) or EPB CSV (Ratee Name, Rank, etc.)
          const isSchedulerFormat = "Event" in row && "Time" in row;
          const isEPBFormat = "Ratee Name" in row || "Evaluation Reason" in row;

          // Helper function to convert Excel date serial numbers to YYYY-MM-DD
          const parseDate = (dateValue) => {
            if (!dateValue) return "";

            // If it's already a string in YYYY-MM-DD format, return it
            if (
              typeof dateValue === "string" &&
              dateValue.match(/^\d{4}-\d{2}-\d{2}$/)
            ) {
              return dateValue;
            }

            // If it's an Excel serial number (days since 1900-01-01)
            if (typeof dateValue === "number") {
              const excelEpoch = new Date(1899, 11, 30); // Excel's epoch
              const date = new Date(
                excelEpoch.getTime() + dateValue * 86400000
              );
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            }

            // Try to parse as a date string
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            }

            return "";
          };

          if (isSchedulerFormat) {
            // Scheduler CSV format
            return {
              title: row["Event"] || "",
              time: row["Time"] || "",
              location: row["Location"] || "",
              person: row["Name"] || "",
              date: parseDate(row["Date"]),
              type: "scheduler",
            };
          } else if (isEPBFormat) {
            // EPB CSV format
            return {
              person: row["Ratee Name"] || row["Name"] || "",
              rank: row["Rank or Grade"] || row["Rank"] || "",
              title: row["Evaluation Reason"] || "EPB Event",
              evaluationCreatedDate: parseDate(row["Evaluation Created Date"]),
              reviewPeriodStartDate: parseDate(row["Review Period Start Date"]),
              evaluationCloseoutDate: parseDate(
                row["Evaluation Closeout Date"]
              ),
              reviewPeriodEndDate: parseDate(row["Review Period End Date"]),
              status: row["Coordination Status"] || "",
              daysInCoordination: row["# Days in Coordination"] || "",
              assignedTo: row["Assigned To"] || "",
              date: parseDate(row["Evaluation Created Date"]),
              type: "epb",
            };
          } else {
            // Fallback for unknown format
            return {
              person: row["Name"] || row["person"] || "",
              title: row["Event"] || row["Title"] || "Event",
              date: parseDate(row["Date"] || row["date"]),
              status: row["Status"] || row["status"] || "",
              type: "unknown",
            };
          }
        });

        setPreview(transformedData.slice(0, 5)); // Show first 5 rows as preview
      } catch (err) {
        setError(
          "Error parsing file. Please ensure it's a valid Excel or CSV file."
        );
        console.error(err);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    if (!preview) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const transformedData = jsonData.map((row) => {
          // Detect format: Scheduler CSV (Event, Time, Location, Name) or EPB CSV (Ratee Name, Rank, etc.)
          const isSchedulerFormat = "Event" in row && "Time" in row;
          const isEPBFormat = "Ratee Name" in row || "Evaluation Reason" in row;

          // Helper function to convert Excel date serial numbers to YYYY-MM-DD
          const parseDate = (dateValue) => {
            if (!dateValue) return "";

            // If it's already a string in YYYY-MM-DD format, return it
            if (
              typeof dateValue === "string" &&
              dateValue.match(/^\d{4}-\d{2}-\d{2}$/)
            ) {
              return dateValue;
            }

            // If it's an Excel serial number (days since 1900-01-01)
            if (typeof dateValue === "number") {
              const excelEpoch = new Date(1899, 11, 30); // Excel's epoch
              const date = new Date(
                excelEpoch.getTime() + dateValue * 86400000
              );
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            }

            // Try to parse as a date string
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            }

            return "";
          };

          if (isSchedulerFormat) {
            // Scheduler CSV format
            return {
              title: row["Event"] || "",
              time: row["Time"] || "",
              location: row["Location"] || "",
              person: row["Name"] || "",
              date: parseDate(row["Date"]),
              type: "scheduler",
            };
          } else if (isEPBFormat) {
            // EPB CSV format
            return {
              person: row["Ratee Name"] || row["Name"] || "",
              rank: row["Rank or Grade"] || row["Rank"] || "",
              title: row["Evaluation Reason"] || "EPB Event",
              evaluationCreatedDate: parseDate(row["Evaluation Created Date"]),
              reviewPeriodStartDate: parseDate(row["Review Period Start Date"]),
              evaluationCloseoutDate: parseDate(
                row["Evaluation Closeout Date"]
              ),
              reviewPeriodEndDate: parseDate(row["Review Period End Date"]),
              status: row["Coordination Status"] || "",
              daysInCoordination: row["# Days in Coordination"] || "",
              assignedTo: row["Assigned To"] || "",
              date: parseDate(row["Evaluation Created Date"]),
              type: "epb",
            };
          } else {
            // Fallback for unknown format
            return {
              person: row["Name"] || row["person"] || "",
              title: row["Event"] || row["Title"] || "Event",
              date: parseDate(row["Date"] || row["date"]),
              status: row["Status"] || row["status"] || "",
              type: "unknown",
            };
          }
        });

        importScheduleData(transformedData);
        onClose();
      } catch (err) {
        setError("Error importing data");
        console.error(err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Upload className="h-6 w-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Import Schedule Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Upload Area */}
          <div className="mb-6">
            <label className="block w-full">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-600">
                  Excel (.xlsx, .xls) or CSV files
                </p>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Preview (First 5 rows)
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Person
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time/Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.type}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.person}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.time || row.date}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.location || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!preview}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import {preview ? `${preview.length}+ Events` : "Data"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
