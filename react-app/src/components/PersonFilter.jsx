import React from 'react'
import { useSchedule } from '../context/ScheduleContext'
import { Filter, X } from 'lucide-react'

const PersonFilter = () => {
  const { people, selectedPerson, setSelectedPerson } = useSchedule()
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        <Filter className="h-5 w-5 text-gray-400 mr-2" />
        <label className="text-sm font-medium text-gray-700 mr-2">Filter by Person:</label>
      </div>
      
      <div className="relative">
        <select
          value={selectedPerson || ''}
          onChange={(e) => setSelectedPerson(e.target.value || null)}
          className="input-field pr-10 min-w-[200px]"
        >
          <option value="">All People</option>
          {people.map(person => (
            <option key={person} value={person}>
              {person}
            </option>
          ))}
        </select>
        
        {selectedPerson && (
          <button
            onClick={() => setSelectedPerson(null)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Clear filter"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default PersonFilter







