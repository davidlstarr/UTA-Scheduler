import React from 'react'

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="card text-center py-12">
      {Icon && <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}

export default EmptyState







