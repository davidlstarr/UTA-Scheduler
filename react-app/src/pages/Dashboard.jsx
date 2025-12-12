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

    // Events without dates
    const eventsWithoutDates = events.filter((e) => !e.date).length;

    // Count unique event titles
    const uniqueEvents = new Set(events.map((e) => e.title)).size;

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your UTA scheduling analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={analytics.totalEvents}
          subtitle={`${analytics.uniqueEvents} unique event types`}
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Total People"
          value={analytics.totalPeople}
          subtitle={
            analytics.mostActivePerson
              ? `Most active: ${analytics.mostActivePerson}`
              : "No data yet"
          }
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Upcoming Events"
          value={analytics.upcomingEvents}
          subtitle="Scheduled for future dates"
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Events Missing Dates"
          value={analytics.eventsWithoutDates}
          subtitle={
            analytics.eventsWithoutDates > 0
              ? "Need scheduling"
              : "All scheduled"
          }
          icon={analytics.eventsWithoutDates > 0 ? AlertTriangle : CheckCircle}
          color={analytics.eventsWithoutDates > 0 ? "red" : "green"}
        />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events by Type */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            Events by Type
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                <span className="text-sm font-medium text-gray-700">
                  Scheduler
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {analytics.eventsByType.scheduler}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
                <span className="text-sm font-medium text-gray-700">EPB</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {analytics.eventsByType.epb}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-sm font-medium text-gray-700">
                  Manual
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {analytics.eventsByType.manual}
              </span>
            </div>
            {analytics.eventsByType.other > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Other
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {analytics.eventsByType.other}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Top Personnel */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-600" />
            Personnel by Events
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.eventsByPerson)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([person, count]) => (
                <div key={person} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {person}
                  </span>
                  <div className="flex items-center ml-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${(count / analytics.maxEvents) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-6 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            {Object.keys(analytics.eventsByPerson).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No event data available
              </p>
            )}
          </div>
        </div>

        {/* Top Locations */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary-600" />
            Top Locations
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.eventsByLocation)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([location, count]) => (
                <div
                  key={location}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {location}
                  </span>
                  <span className="text-sm font-bold text-gray-900 ml-2">
                    {count}
                  </span>
                </div>
              ))}
            {Object.keys(analytics.eventsByLocation).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No location data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      {analytics.upcomingEventsList.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Upcoming Events
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Person
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.upcomingEventsList.map((event, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {event.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {event.person || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {event.time || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {event.location || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
