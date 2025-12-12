// Sample data for testing the application
export const sampleScheduleData = [
  {
    person: 'John Doe',
    rank: 'SSgt',
    title: 'Annual Evaluation',
    evaluationReason: 'Annual',
    evaluationCreatedDate: '2024-01-15',
    reviewPeriodStartDate: '2023-10-01',
    evaluationCloseoutDate: '2024-01-15',
    reviewPeriodEndDate: '2024-03-31',
    status: 'Complete',
    coordinationStatus: 'Complete',
    daysInCoordination: '30',
    assignedTo: 'MSgt Brown',
    date: '2024-01-15'
  },
  {
    person: 'Jane Smith',
    rank: 'TSgt',
    title: 'Annual Evaluation',
    evaluationReason: 'Annual',
    evaluationCreatedDate: '2024-01-15',
    reviewPeriodStartDate: '2023-10-01',
    evaluationCloseoutDate: '2024-01-15',
    reviewPeriodEndDate: '2024-03-31',
    status: 'Complete',
    coordinationStatus: 'Complete',
    daysInCoordination: '28',
    assignedTo: 'MSgt Davis',
    date: '2024-01-15'
  }
]

export const sampleRecallRosterData = [
  {
    name: 'Col Johnson',
    rank: 'Col',
    position: 'Commander',
    supervisor: null,
    phone: '555-0100',
    email: 'col.johnson@mail.mil'
  },
  {
    name: 'Lt Col Smith',
    rank: 'Lt Col',
    position: 'Deputy Commander',
    supervisor: 'Col Johnson',
    phone: '555-0101',
    email: 'ltcol.smith@mail.mil'
  },
  {
    name: 'Maj Brown',
    rank: 'Maj',
    position: 'Flight Commander',
    supervisor: 'Lt Col Smith',
    phone: '555-0102',
    email: 'maj.brown@mail.mil'
  }
]







