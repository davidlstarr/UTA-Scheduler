import React, { useState, useEffect } from "react";
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  HelpCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

const Manning = () => {
  const [umprData, setUmprData] = useState(() => {
    // Load from localStorage on initial mount
    const saved = localStorage.getItem("umprData");
    return saved ? JSON.parse(saved) : null;
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("issues"); // 'issues' or 'roster' or 'byAFSC'
  const [selectedAFSC, setSelectedAFSC] = useState("all");
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Save to localStorage whenever umprData changes
  useEffect(() => {
    if (umprData) {
      localStorage.setItem("umprData", JSON.stringify(umprData));
    } else {
      localStorage.removeItem("umprData");
    }
  }, [umprData]);

  // Analyze data on mount or when umprData changes
  useEffect(() => {
    if (umprData) {
      const result = analyzeUMPR(umprData);
      setAnalysis(result);
    }
  }, [umprData]);

  const analyzeUMPR = (data) => {
    const issues = {
      overages: [],
      vacancies: [],
      gradeMismatches: [],
      criticalVacancies: [],
    };

    const stats = {
      totalAuthorized: 0,
      totalAssigned: 0,
      totalVacant: 0,
      totalOverage: 0,
      manningPercentage: 0,
      byAFSC: {},
    };

    data.forEach((position) => {
      const authorized = parseInt(position.authorized) || 0;
      const assigned = parseInt(position.assigned) || 0;
      const grade = position.grade || "";
      const positionTitle =
        position.positionTitle || position.title || "Unknown";
      const afsc = position.afsc || position.afs || "";
      const office = position.office || "Unassigned";
      const critical =
        position.critical?.toLowerCase() === "yes" ||
        position.critical?.toLowerCase() === "true";

      stats.totalAuthorized += authorized;
      stats.totalAssigned += assigned;

      // Track stats by AFSC
      const afscKey = afsc || "Unassigned";
      if (!stats.byAFSC[afscKey]) {
        stats.byAFSC[afscKey] = {
          authorized: 0,
          assigned: 0,
          vacant: 0,
          overage: 0,
        };
      }
      stats.byAFSC[afscKey].authorized += authorized;
      stats.byAFSC[afscKey].assigned += assigned;

      // Check for overages
      if (assigned > authorized) {
        const overage = assigned - authorized;
        stats.totalOverage += overage;
        stats.byAFSC[afscKey].overage += overage;
        issues.overages.push({
          position: positionTitle,
          grade,
          afsc,
          authorized,
          assigned,
          overage,
          office,
        });
      }

      // Check for vacancies
      if (assigned < authorized) {
        const vacant = authorized - assigned;
        stats.totalVacant += vacant;
        stats.byAFSC[afscKey].vacant += vacant;
        issues.vacancies.push({
          position: positionTitle,
          grade,
          afsc,
          authorized,
          assigned,
          vacant,
          critical,
          office,
        });

        // Track critical vacancies
        if (critical) {
          issues.criticalVacancies.push({
            position: positionTitle,
            grade,
            afsc,
            authorized,
            assigned,
            vacant,
          });
        }
      }

      // Check for grade mismatches (if person assigned but wrong grade)
      if (position.assignedGrade && position.assignedGrade !== grade) {
        issues.gradeMismatches.push({
          position: positionTitle,
          requiredGrade: grade,
          assignedGrade: position.assignedGrade,
          assignedName: position.assignedName || "Unknown",
          afsc,
        });
      }
    });

    stats.manningPercentage =
      stats.totalAuthorized > 0
        ? ((stats.totalAssigned / stats.totalAuthorized) * 100).toFixed(1)
        : 0;

    return { issues, stats };
  };

  const handleFileUpload = (parsedData) => {
    setUmprData(parsedData);
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Manning Analysis
            </h1>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-gray-400 hover:text-primary-600 transition-colors"
              title="UMPR Column Guide"
            >
              <HelpCircle className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-2 text-gray-600">
            Upload and analyze your Unit Personnel Management Roster (UMPR)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload UMPR
          </button>
          {umprData && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear the UMPR data?"
                  )
                ) {
                  setUmprData(null);
                  setAnalysis(null);
                  setSelectedAFSC("all");
                  setActiveTab("issues");
                }
              }}
              className="btn-secondary flex items-center"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Clear Data
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!umprData ? (
        <div className="card text-center py-16">
          <FileText className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No UMPR Data
          </h3>
          <p className="text-gray-600 mb-6">
            Upload your Unit Personnel Management Roster to analyze manning
            levels, identify vacancies, and detect position overages
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload UMPR File
          </button>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Manning %</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {analysis?.stats.manningPercentage}%
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${
                    parseFloat(analysis?.stats.manningPercentage) >= 90
                      ? "bg-green-100"
                      : parseFloat(analysis?.stats.manningPercentage) >= 75
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
                >
                  <Users
                    className={`h-6 w-6 ${
                      parseFloat(analysis?.stats.manningPercentage) >= 90
                        ? "text-green-600"
                        : parseFloat(analysis?.stats.manningPercentage) >= 75
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Assigned / Authorized
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {analysis?.stats.totalAssigned} /{" "}
                    {analysis?.stats.totalAuthorized}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vacancies</p>
                  <p className="mt-2 text-3xl font-bold text-red-600">
                    {analysis?.stats.totalVacant}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overages</p>
                  <p className="mt-2 text-3xl font-bold text-orange-600">
                    {analysis?.stats.totalOverage}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Critical Vacancies Alert */}
          {analysis?.issues.criticalVacancies.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">
                    Critical Position Vacancies Detected
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    {analysis.issues.criticalVacancies.length} critical
                    position(s) are currently vacant
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="card">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("issues")}
                  className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "issues"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  All Issues (
                  {(analysis?.issues.overages.length || 0) +
                    (analysis?.issues.vacancies.length || 0) +
                    (analysis?.issues.gradeMismatches.length || 0)}
                  )
                </button>
                <button
                  onClick={() => setActiveTab("roster")}
                  className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "roster"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Full Roster ({umprData?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("byAFSC")}
                  className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "byAFSC"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  By AFSC ({Object.keys(analysis?.stats.byAFSC || {}).length})
                </button>
              </nav>
            </div>

            <div className="mt-6 space-y-6">
              {/* By AFSC Tab */}
              {activeTab === "byAFSC" && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Manning by AFSC
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analysis?.stats.byAFSC || {})
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([afsc, stats]) => {
                        const manningPct =
                          stats.authorized > 0
                            ? (
                                (stats.assigned / stats.authorized) *
                                100
                              ).toFixed(0)
                            : 0;
                        const hasIssues = stats.vacant > 0 || stats.overage > 0;

                        return (
                          <div
                            key={afsc}
                            className={`card cursor-pointer transition-all hover:shadow-lg ${
                              hasIssues ? "border-l-4 border-yellow-500" : ""
                            }`}
                            onClick={() => {
                              setSelectedAFSC(afsc);
                              setActiveTab("roster");
                            }}
                          >
                            <h4 className="font-semibold text-gray-900 mb-3">
                              {afsc}
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Manning:</span>
                                <span
                                  className={`font-semibold ${
                                    parseFloat(manningPct) >= 90
                                      ? "text-green-600"
                                      : parseFloat(manningPct) >= 75
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {manningPct}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Assigned/Auth:
                                </span>
                                <span className="text-gray-900">
                                  {stats.assigned}/{stats.authorized}
                                </span>
                              </div>
                              {stats.vacant > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Vacancies:
                                  </span>
                                  <span className="text-red-600 font-semibold">
                                    {stats.vacant}
                                  </span>
                                </div>
                              )}
                              {stats.overage > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Overages:
                                  </span>
                                  <span className="text-orange-600 font-semibold">
                                    +{stats.overage}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Full Roster Tab */}
              {activeTab === "roster" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Complete UMPR Listing
                      </h3>
                      {selectedAFSC !== "all" && (
                        <p className="text-sm text-gray-600 mt-1">
                          Filtered by AFSC: {selectedAFSC}
                          <button
                            onClick={() => setSelectedAFSC("all")}
                            className="ml-2 text-primary-600 hover:text-primary-700 underline"
                          >
                            Clear filter
                          </button>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="btn-secondary text-sm"
                    >
                      Print Roster
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            AFSC
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            SAR
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Office
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Auth
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Asgd
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Assigned Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Remarks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {umprData
                          ?.filter(
                            (position) =>
                              selectedAFSC === "all" ||
                              position.afsc === selectedAFSC
                          )
                          .map((position, idx) => {
                            const authorized =
                              parseInt(position.authorized) || 0;
                            const assigned = parseInt(position.assigned) || 0;
                            const isVacant = assigned < authorized;
                            const isOverage = assigned > authorized;
                            const isCritical =
                              position.critical?.toLowerCase() === "yes";

                            return (
                              <tr
                                key={idx}
                                className={
                                  isVacant && isCritical
                                    ? "bg-red-50"
                                    : isVacant
                                    ? "bg-yellow-50"
                                    : isOverage
                                    ? "bg-orange-50"
                                    : ""
                                }
                              >
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {position.positionTitle}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {position.grade}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {position.afsc}
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                  {position.sar === "5" && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      TS/SCI
                                    </span>
                                  )}
                                  {position.sar === "6" && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Secret
                                    </span>
                                  )}
                                  {!position.sar && "-"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {position.office || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {authorized}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold">
                                  <span
                                    className={
                                      isVacant
                                        ? "text-red-600"
                                        : isOverage
                                        ? "text-orange-600"
                                        : "text-green-600"
                                    }
                                  >
                                    {assigned}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {position.assignedName || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 italic">
                                  {position.remarks || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <div className="flex gap-1 flex-wrap">
                                    {isCritical && isVacant && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Critical Vacancy
                                      </span>
                                    )}
                                    {!isCritical && isVacant && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Vacant
                                      </span>
                                    )}
                                    {isOverage && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        Overage
                                      </span>
                                    )}
                                    {assigned === authorized && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Filled
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Issues Tab */}
              {activeTab === "issues" && (
                <>
                  {/* Vacancies */}
                  {analysis?.issues.vacancies.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Vacant Positions ({analysis.issues.vacancies.length})
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Position
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Grade
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                AFSC
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Authorized
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Assigned
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Vacant
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analysis.issues.vacancies.map((vacancy, idx) => (
                              <tr
                                key={idx}
                                className={vacancy.critical ? "bg-red-50" : ""}
                              >
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {vacancy.position}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {vacancy.grade}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {vacancy.afsc}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {vacancy.authorized}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {vacancy.assigned}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-red-600">
                                  {vacancy.vacant}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  {vacancy.critical && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Critical
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Overages */}
                  {analysis?.issues.overages.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Position Overages ({analysis.issues.overages.length})
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Position
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Grade
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                AFSC
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Authorized
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Assigned
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Overage
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analysis.issues.overages.map((overage, idx) => (
                              <tr key={idx} className="bg-orange-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {overage.position}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {overage.grade}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {overage.afsc}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {overage.authorized}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {overage.assigned}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                                  +{overage.overage}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Grade Mismatches */}
                  {analysis?.issues.gradeMismatches.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Grade Mismatches (
                          {analysis.issues.gradeMismatches.length})
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Position
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Required Grade
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Assigned Grade
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Assigned Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                AFSC
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analysis.issues.gradeMismatches.map(
                              (mismatch, idx) => (
                                <tr key={idx} className="bg-yellow-50">
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {mismatch.position}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700">
                                    {mismatch.requiredGrade}
                                  </td>
                                  <td className="px-6 py-4 text-sm font-semibold text-yellow-700">
                                    {mismatch.assignedGrade}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700">
                                    {mismatch.assignedName}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700">
                                    {mismatch.afsc}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* No Issues */}
                  {analysis?.issues.vacancies.length === 0 &&
                    analysis?.issues.overages.length === 0 &&
                    analysis?.issues.gradeMismatches.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No Manning Issues Detected
                        </h3>
                        <p className="text-gray-600">
                          Your unit is fully manned with no overages or
                          vacancies.
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UMPRUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <UMPRHelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
};

const UMPRHelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-primary-50">
          <div className="flex items-center">
            <HelpCircle className="h-6 w-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              UMPR Column Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <p className="text-gray-600 mb-6">
            The UMPR (Unit Personnel Management Roster) contains 4 lines of
            information for each position. Here's a breakdown of all columns:
          </p>

          {/* Line 1 */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-red-600 mb-3 pb-2 border-b-2 border-red-200">
              Line 1: Authorization Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">AFSC:</span>
                <p className="text-sm text-gray-600">
                  Air Force Specialty Code (DAFSC of position)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">GR:</span>
                <p className="text-sm text-gray-600">
                  Authorized Grade of position
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Q1 (001):</span>
                <p className="text-sm text-gray-600">
                  Quarter 1 funding (1=funded, 0=being deleted)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Q2 (002):</span>
                <p className="text-sm text-gray-600">
                  Quarter 2 funding (1=funded, 0=being deleted)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Q3 (003):</span>
                <p className="text-sm text-gray-600">
                  Quarter 3 funding (1=funded, 0=being deleted)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Q4 (004):</span>
                <p className="text-sm text-gray-600">
                  Quarter 4 funding (1=funded, 0=being deleted)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Q5 (005):</span>
                <p className="text-sm text-gray-600">
                  Quarter 5 funding (1=funded, 0=being deleted)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">POS-NR:</span>
                <p className="text-sm text-gray-600">
                  Position Number - 9 characters (7 numbers + 2 MAJCOM code)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">SAR:</span>
                <p className="text-sm text-gray-600">
                  Security Access Requirement (5=TS/SCI, 6=Secret)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">FAC:</span>
                <p className="text-sm text-gray-600">
                  Functional Account Code - groups functions/work centers
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">PEC:</span>
                <p className="text-sm text-gray-600">
                  Program Element Code - identifies funding program
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">SEI:</span>
                <p className="text-sm text-gray-600">
                  Special Experience Identifier - special skill/advanced
                  training
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">PRP:</span>
                <p className="text-sm text-gray-600">
                  Personnel Reliability Program requirement
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">RPI:</span>
                <p className="text-sm text-gray-600">
                  Rated Position Identifier - requires operational flying rating
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">MP-RMKS:</span>
                <p className="text-sm text-gray-600">Manpower remarks</p>
              </div>
            </div>
          </div>

          {/* Line 2 */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-blue-600 mb-3 pb-2 border-b-2 border-blue-200">
              Line 2: Assigned Personnel Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">DAFSC:</span>
                <p className="text-sm text-gray-600">
                  Duty Air Force Specialty Code - AFSC position requires
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">GR:</span>
                <p className="text-sm text-gray-600">
                  Grade of member currently assigned
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">NAME:</span>
                <p className="text-sm text-gray-600">Name of assigned member</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">SSAN:</span>
                <p className="text-sm text-gray-600">
                  Social Security Number of assigned member
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">DS:</span>
                <p className="text-sm text-gray-600">
                  Duty Status on day UMPR was generated
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">CAFSC:</span>
                <p className="text-sm text-gray-600">
                  Control AFSC (enlisted only) - highest awarded AFSC in ladder
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">PAFSC:</span>
                <p className="text-sm text-gray-600">
                  Primary AFSC - AFSC member is most qualified to perform
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">2AFSC:</span>
                <p className="text-sm text-gray-600">
                  Secondary AFSC - fully qualified, doesn't match current DAFSC
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">3AFSC:</span>
                <p className="text-sm text-gray-600">
                  Third AFSC - member hasn't worked in recently
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">4AFSC:</span>
                <p className="text-sm text-gray-600">
                  Fourth AFSC - older qualification or feeder AFSC (enlisted
                  only)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">OVERAGE:</span>
                <p className="text-sm text-gray-600">
                  Overage/Overgrade code (0=pseudo, 3=readiness, 8=pseudo,
                  L=STEP, P=overgrade)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">AFR-SEC-ID:</span>
                <p className="text-sm text-gray-600">
                  Air Force Reserve Section ID - 2-digit unit identifier
                </p>
              </div>
            </div>
          </div>

          {/* Line 3 */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-green-600 mb-3 pb-2 border-b-2 border-green-200">
              Line 3: Branch Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">BRANCH:</span>
                <p className="text-sm text-gray-600">
                  Unit branch or section identifier
                </p>
              </div>
            </div>
          </div>

          {/* Line 4 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-yellow-600 mb-3 pb-2 border-b-2 border-yellow-200">
              Line 4: Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">DUTY TITLE:</span>
                <p className="text-sm text-gray-600">
                  Duty title of member currently assigned
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">REMARKS:</span>
                <p className="text-sm text-gray-600">
                  Usually blank unless retiring (RET: date) or gaining (GAIN:
                  date)
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">EXP-DT:</span>
                <p className="text-sm text-gray-600">
                  Expiration date of overage/overgrade
                </p>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Quick Reference:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Vacant positions</strong> show empty Line 2 data
              </li>
              <li>
                • <strong>Security clearances:</strong> SAR 5 = TS/SCI, SAR 6 =
                Secret
              </li>
              <li>
                • <strong>Funding quarters:</strong> 1 = funded, 0 = position
                being deleted
              </li>
              <li>
                • <strong>Overage codes:</strong> 0/8 = pseudo positions, 3 =
                readiness, L = STEP program, P = overgrade
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="btn-primary">
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

const UMPRUploadModal = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    // Check if it's a PDF
    if (file.name.toLowerCase().endsWith(".pdf")) {
      setError(
        "PDF files require manual data extraction. Please convert your UMPR PDF to Excel or CSV format first. You can:\n1. Copy data from PDF and paste into Excel\n2. Use online PDF to Excel converters\n3. Use Adobe Acrobat's Export feature"
      );
      setFile(null);
      return;
    }

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

        // Transform data to standardized format
        const transformedData = jsonData.map((row) => ({
          positionTitle:
            row["Position Title"] ||
            row["Position"] ||
            row["Title"] ||
            row["Duty Title"] ||
            "",
          grade: row["Grade"] || row["Rank"] || row["GR"] || "",
          afsc: row["AFSC"] || row["AFS"] || row["DAFSC"] || "",
          authorized: row["Authorized"] || row["Auth"] || row["PAA"] || 0,
          assigned: row["Assigned"] || row["Asgd"] || 0,
          assignedName:
            row["Assigned Name"] || row["Name"] || row["Assigned Name"] || "",
          assignedGrade:
            row["Assigned Grade"] ||
            row["Assigned GR"] ||
            row["Assigned Rank"] ||
            "",
          critical: row["Critical"] || row["Key Position"] || "No",
          office: row["Office"] || row["Section"] || "",
          q1: row["Q1"] || row["001"] || "",
          q2: row["Q2"] || row["002"] || "",
          q3: row["Q3"] || row["003"] || "",
          q4: row["Q4"] || row["004"] || "",
          q5: row["Q5"] || row["005"] || "",
          posNr: row["POS-NR"] || row["Position Number"] || "",
          sar: row["SAR"] || "",
          fac: row["FAC"] || "",
          pec: row["PEC"] || "",
          sei: row["SEI"] || "",
          prp: row["PRP"] || "",
          rpi: row["RPI"] || "",
          mpRmks: row["MP-RMKS"] || row["MP RMKS"] || "",
          dafsc: row["DAFSC"] || "",
          ssan: row["SSAN"] || "",
          ds: row["DS"] || "",
          cafsc: row["CAFSC"] || "",
          pafsc: row["PAFSC"] || "",
          afsc2: row["2AFSC"] || "",
          afsc3: row["3AFSC"] || "",
          afsc4: row["4AFSC"] || "",
          overage: row["OVERAGE"] || row["Overage Code"] || "",
          afrSecId: row["AFR-SEC-ID"] || "",
          branch: row["BRANCH"] || "",
          dutyTitle: row["Duty Title"] || "",
          remarks: row["Remarks"] || "",
          expDate: row["Exp Date"] || row["EXP DATE"] || "",
        }));

        setPreview(transformedData.slice(0, 5));
      } catch (err) {
        setError(
          "Error parsing file. Please ensure it's a valid UMPR Excel or CSV file."
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

        const transformedData = jsonData.map((row) => ({
          positionTitle:
            row["Position Title"] ||
            row["Position"] ||
            row["Title"] ||
            row["Duty Title"] ||
            "",
          grade: row["Grade"] || row["Rank"] || row["GR"] || "",
          afsc: row["AFSC"] || row["AFS"] || row["DAFSC"] || "",
          authorized: row["Authorized"] || row["Auth"] || row["PAA"] || 0,
          assigned: row["Assigned"] || row["Asgd"] || 0,
          assignedName:
            row["Assigned Name"] || row["Name"] || row["Assigned Name"] || "",
          assignedGrade:
            row["Assigned Grade"] ||
            row["Assigned GR"] ||
            row["Assigned Rank"] ||
            "",
          critical: row["Critical"] || row["Key Position"] || "No",
          office: row["Office"] || row["Section"] || "",
          q1: row["Q1"] || row["001"] || "",
          q2: row["Q2"] || row["002"] || "",
          q3: row["Q3"] || row["003"] || "",
          q4: row["Q4"] || row["004"] || "",
          q5: row["Q5"] || row["005"] || "",
          posNr: row["POS-NR"] || row["Position Number"] || "",
          sar: row["SAR"] || "",
          fac: row["FAC"] || "",
          pec: row["PEC"] || "",
          sei: row["SEI"] || "",
          prp: row["PRP"] || "",
          rpi: row["RPI"] || "",
          mpRmks: row["MP-RMKS"] || row["MP RMKS"] || "",
          dafsc: row["DAFSC"] || "",
          ssan: row["SSAN"] || "",
          ds: row["DS"] || "",
          cafsc: row["CAFSC"] || "",
          pafsc: row["PAFSC"] || "",
          afsc2: row["2AFSC"] || "",
          afsc3: row["3AFSC"] || "",
          afsc4: row["4AFSC"] || "",
          overage: row["OVERAGE"] || row["Overage Code"] || "",
          afrSecId: row["AFR-SEC-ID"] || "",
          branch: row["BRANCH"] || "",
          dutyTitle: row["Duty Title"] || "",
          remarks: row["Remarks"] || "",
          expDate: row["Exp Date"] || row["EXP DATE"] || "",
        }));

        onUpload(transformedData);
      } catch (err) {
        setError("Error importing data");
        console.error(err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Upload className="h-6 w-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Upload UMPR</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block w-full">
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 cursor-pointer transition-colors">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-600">
                  Excel (.xlsx, .xls), CSV, or PDF files with columns: Position
                  Title, Grade, AFSC, Authorized, Assigned
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Note: PDF files will need to be converted to Excel/CSV format
                  first
                </p>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 whitespace-pre-line">
              {error}
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
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Grade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        AFSC
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Auth
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Asgd
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.positionTitle}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.grade}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.afsc}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.authorized}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.assigned}
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
            Import UMPR
          </button>
        </div>
      </div>
    </div>
  );
};

export default Manning;
