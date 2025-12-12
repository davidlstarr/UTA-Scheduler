import React from 'react'
import { Trash2, User, Calendar, Award, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { useSchedule } from '../context/ScheduleContext'

const EventCard = ({ event }) => {
  const { removeEvent } = useSchedule()
  
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase().replace(' ', '') || ''
    if (statusLower === 'complete') return 'bg-green-100 text-green-800 border-green-200'
    if (statusLower === 'inprogress') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (statusLower === 'pending') return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }
  
  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase().replace(' ', '') || ''
    if (statusLower === 'complete') return <CheckCircle className="h-4 w-4" />
    if (statusLower === 'inprogress') return <Clock className="h-4 w-4" />
    if (statusLower === 'pending') return <AlertCircle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      removeEvent(event.id)
    }
  }
  
  return (
    <div className="card hover:shadow-xl transition-shadow relative group">
      {/* Manual Event Badge */}
      {event.isManual && (
        <div className="absolute top-4 right-4">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            Manual
          </span>
        </div>
      )}
      
      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 pr-16">
          {event.title || event.evaluationReason || 'Untitled Event'}
        </h3>
        
        {/* Person Info */}
        {event.person && (
          <div className="flex items-center text-sm text-gray-700">
            <User className="h-4 w-4 mr-2 text-primary-600" />
            <span className="font-medium">{event.person}</span>
            {event.rank && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                {event.rank}
              </span>
            )}
          </div>
        )}
        
        {/* Status */}
        {event.status && (
          <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(event.status)}`}>
            {getStatusIcon(event.status)}
            <span className="ml-2 text-xs font-medium">{event.status}</span>
          </div>
        )}
        
        {/* Additional Info */}
        <div className="space-y-2 text-sm text-gray-600">
          {event.assignedTo && (
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-gray-400" />
              <span>Assigned to: {event.assignedTo}</span>
            </div>
          )}
          
          {event.daysInCoordination && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>{event.daysInCoordination} days in coordination</span>
            </div>
          )}
          
          {event.reviewPeriodStartDate && event.reviewPeriodEndDate && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-xs">
                {new Date(event.reviewPeriodStartDate).toLocaleDateString()} - {new Date(event.reviewPeriodEndDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {event.description && (
            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
          )}
        </div>
      </div>
      
      {/* Delete Button - Only for manual events */}
      {event.isManual && (
        <button
          onClick={handleDelete}
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded-lg"
          title="Delete event"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default EventCard

