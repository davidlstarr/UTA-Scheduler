import React, { useMemo } from "react";
import { useSchedule } from "../context/ScheduleContext";
import {
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  FileText,
  AlertTriangle,
  Target,
  Award,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { events, people } = useSchedule();

  const analytics = useMemo(() => {
    const totalEvents = events.length;
    const manualEvents = events.filter((e) => e.isManual).length;
    const importedEvents = totalEvents - manualEvents;
    const totalPeople = people.length;

    // Count events by person
    const eventsByPerson = {};
    events.forEach((event) => {
      if (event.person) {
        eventsByPerson[event.person] = (eventsByPerson[event.person] || 0) + 1;
      }
    });

    // Count events by type
    const eventsByType = {
      scheduler: events.filter((e) => e.type === "scheduler").length,
      epb: events.filter((e) => e.type === "epb").length,
      manual: manualEvents,
      other: events.filter((e) => !e.type || e.type === "unknown").length,
    };

    // Count events by status
    const eventsByStatus = {
      complete: 0,
      inProgress: 0,
      pending: 0,
    };
    events.forEach((event) => {
      const status = event.status?.toLowerCase().replace(" ", "");
      if (status === "complete") eventsByStatus.complete++;
      else if (status === "inprogress") eventsByStatus.inProgress++;
      else if (status === "pending") eventsByStatus.pending++;
    });

    // Count events by location
    const eventsByLocation = {};
    events.forEach((event) => {
      if (event.location) {
        eventsByLocation[event.location] =
          (eventsByLocation[event.location] || 0) + 1;
      }
    });

    // Upcoming events (future dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEventsList = events
      .filter((event) => {
        if (event.date) {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        }
        return false;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);

    const upcomingEvents = upcomingEventsList.length;

    // Events without dates (Unscheduled - needs attention)
    const eventsWithoutDates = events.filter((e) => !e.date).length;

    // Count unique event titles
    const uniqueEvents = new Set(events.map((e) => e.title)).size;

    // Categorize events by type
    const epbEvents = events.filter(
      (e) => e.title?.toLowerCase().includes("epb") || e.type === "epb"
    );

    // EPBs that are due, overdue, pending, or in progress (NOT completed)
    const epbsDue = epbEvents.filter((e) => {
      // Check title for keywords
      const titleMatch =
        e.title?.toLowerCase().includes("due") ||
        e.title?.toLowerCase().includes("pending") ||
        e.title?.toLowerCase().includes("needs attention") ||
        e.title?.toLowerCase().includes("overdue");

      // For EPB type events, ONLY show if status is NOT "Complete"
      if (e.type === "epb") {
        const isNotComplete =
          e.status?.toLowerCase() !== "complete" &&
          e.status?.toLowerCase() !== "completed";
        return isNotComplete;
      }

      // For scheduler events with EPB in title, check keywords
      return titleMatch;
    });

    const overdueVouchers = events.filter(
      (e) =>
        e.title?.toLowerCase().includes("overdue") &&
        (e.title?.toLowerCase().includes("voucher") ||
          e.title?.toLowerCase().includes("gtc") ||
          e.title?.toLowerCase().includes("travel"))
    );

    const medicalEvents = events.filter(
      (e) =>
        e.title?.toLowerCase().includes("medical") ||
        e.title?.toLowerCase().includes("pha") ||
        e.title?.toLowerCase().includes("physical") ||
        e.location?.toLowerCase().includes("mdg") ||
        e.location?.toLowerCase().includes("clinic")
    );

    const dentalEvents = events.filter((e) =>
      e.title?.toLowerCase().includes("dental")
    );

    const dtsEvents = events.filter(
      (e) =>
        e.title?.toLowerCase().includes("dts") ||
        e.title?.toLowerCase().includes("travel")
    );

    const trainingEvents = events.filter(
      (e) =>
        e.title?.toLowerCase().includes("training") ||
        e.title?.toLowerCase().includes("course") ||
        e.title?.toLowerCase().includes("cdc") ||
        e.location?.toLowerCase().includes("training room")
    );

    const overdueTraining = events.filter(
      (e) =>
        (e.title?.toLowerCase().includes("overdue") ||
          e.title?.toLowerCase().includes("outstanding") ||
          e.title?.toLowerCase().includes("past due")) &&
        (e.title?.toLowerCase().includes("training") ||
          e.title?.toLowerCase().includes("cdc") ||
          e.title?.toLowerCase().includes("records"))
    );

    // All critical items
    const criticalEvents = [
      ...epbsDue,
      ...overdueVouchers,
      ...overdueTraining,
    ].filter(
      (event, index, self) => index === self.findIndex((e) => e.id === event.id)
    );

    // Training completion rate (events marked as complete vs total with status)
    const eventsWithStatus = events.filter((e) => e.status);
    const completionRate =
      eventsWithStatus.length > 0
        ? Math.round((eventsByStatus.complete / eventsWithStatus.length) * 100)
        : 0;

    // Personnel readiness (people with no critical events vs total people)
    const peopleWithCriticalEvents = new Set(
      criticalEvents.map((e) => e.person).filter(Boolean)
    );
    const readyPersonnel = totalPeople - peopleWithCriticalEvents.size;
    const readinessRate =
      totalPeople > 0 ? Math.round((readyPersonnel / totalPeople) * 100) : 0;

    // Events in next 7 days
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const upcomingWeekEvents = events.filter((event) => {
      if (event.date) {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      }
      return false;
    }).length;

    // Most active person
    let mostActivePerson = null;
    let maxEvents = 0;
    Object.entries(eventsByPerson).forEach(([person, count]) => {
      if (count > maxEvents) {
        maxEvents = count;
        mostActivePerson = person;
      }
    });

    // Events by date (for timeline)
    const eventsByDate = {};
    events.forEach((event) => {
      if (event.date) {
        eventsByDate[event.date] = (eventsByDate[event.date] || 0) + 1;
      }
    });

    return {
      totalEvents,
      manualEvents,
      importedEvents,
      totalPeople,
      eventsByPerson,
      eventsByStatus,
      eventsByType,
      eventsByLocation,
      upcomingEvents,
      upcomingEventsList,
      eventsWithoutDates,
      uniqueEvents,
      mostActivePerson,
      maxEvents,
      eventsByDate,
      criticalEvents,
      completionRate,
      readyPersonnel,
      readinessRate,
      upcomingWeekEvents,
      epbEvents,
      epbsDue,
      overdueVouchers,
      medicalEvents,
      dentalEvents,
      dtsEvents,
      trainingEvents,
      overdueTraining,
    };
  }, [events, people]);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "primary",
  }) => {
    const colorClasses = {
      primary: "bg-primary-50 text-primary-600",
      green: "bg-green-50 text-green-600",
      yellow: "bg-yellow-50 text-yellow-600",
      red: "bg-red-50 text-red-600",
      purple: "bg-purple-50 text-purple-600",
    };

    return (
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Commander's Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Training readiness and personnel accountability at a glance
        </p>
      </div>

      {/* Critical Categories - Red Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="EPBs Due/Overdue"
          value={analytics.epbsDue.length}
          subtitle={
            analytics.epbsDue.length > 0
              ? "Require immediate action"
              : "No overdue EPBs"
          }
          icon={FileText}
          color={analytics.epbsDue.length > 0 ? "red" : "green"}
        />
        <StatCard
          title="Overdue Vouchers/GTC"
          value={analytics.overdueVouchers.length}
          subtitle={
            analytics.overdueVouchers.length > 0
              ? "Need submission"
              : "All current"
          }
          icon={AlertCircle}
          color={analytics.overdueVouchers.length > 0 ? "red" : "green"}
        />
        <StatCard
          title="Overdue Training"
          value={analytics.overdueTraining.length}
          subtitle={
            analytics.overdueTraining.length > 0
              ? "Past due items"
              : "All current"
          }
          icon={TrendingUp}
          color={analytics.overdueTraining.length > 0 ? "red" : "green"}
        />
      </div>

      {/* Readiness Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EPBs Due */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              EPBs Due/Overdue
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                analytics.epbsDue.length > 0
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {analytics.epbsDue.length}
            </span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.epbsDue.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No overdue EPBs
              </p>
            ) : (
              analytics.epbsDue.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded p-3 hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {event.type === "epb"
                        ? `${event.title} EPB - ${event.status || "Pending"}`
                        : event.title}
                    </span>
                    {event.person && (
                      <span className="text-xs text-gray-600 block mt-1">
                        {event.person}
                        {event.rank && ` (${event.rank})`}
                        {event.assignedTo && ` • Rater: ${event.assignedTo}`}
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    {event.date && (
                      <span className="text-xs text-gray-500 block">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {event.daysInCoordination && (
                      <span className="text-xs text-orange-600 block font-semibold">
                        {event.daysInCoordination} days
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Vouchers */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
              Overdue Vouchers/GTC
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                analytics.overdueVouchers.length > 0
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {analytics.overdueVouchers.length}
            </span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.overdueVouchers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No overdue vouchers
              </p>
            ) : (
              analytics.overdueVouchers.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded p-3 hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {event.title}
                    </span>
                    {event.person && (
                      <span className="text-xs text-gray-600 block mt-1">
                        {event.person}
                      </span>
                    )}
                  </div>
                  {event.date && (
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Medical */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Medical (PHA/Physical)
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
              {analytics.medicalEvents.length}
            </span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.medicalEvents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No medical events
              </p>
            ) : (
              analytics.medicalEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded p-3 hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {event.title}
                    </span>
                    {event.person && (
                      <span className="text-xs text-gray-600 block mt-1">
                        {event.person}
                      </span>
                    )}
                  </div>
                  {event.date && (
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dental */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-teal-600" />
              Dental
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-teal-100 text-teal-800">
              {analytics.dentalEvents.length}
            </span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.dentalEvents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No dental events
              </p>
            ) : (
              analytics.dentalEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded p-3 hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {event.title}
                    </span>
                    {event.person && (
                      <span className="text-xs text-gray-600 block mt-1">
                        {event.person}
                      </span>
                    )}
                  </div>
                  {event.date && (
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Outstanding Training */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-yellow-600" />
              Overdue Training
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                analytics.overdueTraining.length > 0
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {analytics.overdueTraining.length}
            </span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.overdueTraining.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No overdue training
              </p>
            ) : (
              analytics.overdueTraining.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded p-3 hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {event.title}
                    </span>
                    {event.person && (
                      <span className="text-xs text-gray-600 block mt-1">
                        {event.person}
                      </span>
                    )}
                  </div>
                  {event.date && (
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* DTS/Travel */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
              DTS/Travel Events
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-800">
              {analytics.dtsEvents.length}
            </span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.dtsEvents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No DTS/travel events
              </p>
            ) : (
              analytics.dtsEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded p-3 hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {event.title}
                    </span>
                    {event.person && (
                      <span className="text-xs text-gray-600 block mt-1">
                        {event.person}
                      </span>
                    )}
                  </div>
                  {event.date && (
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Healthcare & Administrative Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Medical (PHA/Physical)"
          value={analytics.medicalEvents.length}
          subtitle={`${analytics.totalPeople} total personnel`}
          icon={Shield}
          color="primary"
        />
        <StatCard
          title="Dental"
          value={analytics.dentalEvents.length}
          subtitle="Scheduled appointments"
          icon={CheckCircle}
          color="primary"
        />
        <StatCard
          title="DTS/Travel"
          value={analytics.dtsEvents.length}
          subtitle="Travel events"
          icon={MapPin}
          color="primary"
        />
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/schedule"
            className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Calendar className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Schedule</p>
              <p className="text-sm text-gray-600">See all events</p>
            </div>
          </Link>
          <Link
            to="/schedule"
            className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <AlertCircle className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Add Event</p>
              <p className="text-sm text-gray-600">Create manually</p>
            </div>
          </Link>
          <Link
            to="/recall-roster"
            className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Users className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Recall Roster</p>
              <p className="text-sm text-gray-600">Contact info</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
