import React, { createContext, useContext, useState, useEffect } from "react";

const ScheduleContext = createContext();

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};

export const ScheduleProvider = ({ children }) => {
  // Initialize state from localStorage
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("uta-events");
    return saved ? JSON.parse(saved) : [];
  });
  const [people, setPeople] = useState(() => {
    const saved = localStorage.getItem("uta-people");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [recallRosterData, setRecallRosterData] = useState(() => {
    const saved = localStorage.getItem("uta-recall-roster");
    return saved ? JSON.parse(saved) : null;
  });

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("uta-events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("uta-people", JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    if (recallRosterData) {
      localStorage.setItem(
        "uta-recall-roster",
        JSON.stringify(recallRosterData)
      );
    } else {
      localStorage.removeItem("uta-recall-roster");
    }
  }, [recallRosterData]);

  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      isManual: true,
      type: "scheduler", // Manual events use scheduler format
    };
    setEvents([...events, newEvent]);
  };

  const removeEvent = (eventId) => {
    setEvents(events.filter((e) => e.id !== eventId));
  };

  const updateEvent = (eventId, updates) => {
    setEvents(events.map((e) => (e.id === eventId ? { ...e, ...updates } : e)));
  };

  const importScheduleData = (data) => {
    const newEvents = data.map((item) => ({
      ...item,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      isManual: false,
    }));
    setEvents([...events, ...newEvents]);

    // Extract unique people from the data
    const uniquePeople = [
      ...new Set(data.map((item) => item.person).filter(Boolean)),
    ];
    const newPeople = uniquePeople.filter((p) => !people.includes(p));
    if (newPeople.length > 0) {
      setPeople([...people, ...newPeople]);
    }
  };

  const clearAllData = () => {
    setEvents([]);
    setPeople([]);
    setSelectedPerson(null);
    setRecallRosterData(null);
    localStorage.removeItem("uta-events");
    localStorage.removeItem("uta-people");
    localStorage.removeItem("uta-recall-roster");
  };

  const value = {
    events,
    people,
    selectedPerson,
    recallRosterData,
    setSelectedPerson,
    setRecallRosterData,
    addEvent,
    removeEvent,
    updateEvent,
    importScheduleData,
    clearAllData,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
