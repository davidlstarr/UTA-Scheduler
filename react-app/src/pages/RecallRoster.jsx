import React, { useState, useEffect, useRef } from 'react'
import { useSchedule } from '../context/ScheduleContext'
import { Upload, X, Users, Download, RefreshCw } from 'lucide-react'
import * as XLSX from 'xlsx'
import mermaid from 'mermaid'

const RecallRoster = () => {
  const { recallRosterData, setRecallRosterData } = useSchedule()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [mermaidCode, setMermaidCode] = useState('')
  const mermaidRef = useRef(null)
  
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    })
  }, [])
  
  useEffect(() => {
    if (recallRosterData) {
      const code = generateMermaidDiagram(recallRosterData)
      setMermaidCode(code)
    }
  }, [recallRosterData])
  
  useEffect(() => {
    if (mermaidCode && mermaidRef.current) {
      mermaidRef.current.innerHTML = mermaidCode
      mermaid.contentLoaded()
    }
  }, [mermaidCode])
  
  const generateMermaidDiagram = (data) => {
    // Build organizational hierarchy from data
    // Assuming data has fields like: name, rank, supervisor, position, phone, email
    
    let diagram = 'graph TD\n'
    const nodeMap = new Map()
    let nodeId = 0
    
    // Create nodes for each person
    data.forEach(person => {
      const id = `N${nodeId++}`
      const label = `${person.rank || ''} ${person.name || 'Unknown'}<br/>${person.position || ''}`
      nodeMap.set(person.name, id)
      diagram += `    ${id}["${label}"]\n`
    })
    
    // Create relationships based on supervisor field
    data.forEach(person => {
      if (person.supervisor && person.name) {
        const childId = nodeMap.get(person.name)
        const parentId = nodeMap.get(person.supervisor)
        if (childId && parentId) {
          diagram += `    ${parentId} --> ${childId}\n`
        }
      }
    })
    
    // Add styling
    diagram += '\n    classDef default fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff\n'
    
    return diagram
  }
  
  const handleExportDiagram = () => {
    // Create a downloadable version of the diagram
    const blob = new Blob([mermaidCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'recall-roster-diagram.mmd'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recall Roster</h1>
          <p className="mt-2 text-gray-600">
            Upload and visualize your organization's recall roster
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {recallRosterData && (
            <>
              <button
                onClick={handleExportDiagram}
                className="btn-secondary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Diagram
              </button>
              <button
                onClick={() => {
                  mermaid.contentLoaded()
                }}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Roster
          </button>
        </div>
      </div>
      
      {/* Content */}
      {!recallRosterData ? (
        <div className="card text-center py-16">
          <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Recall Roster Data</h3>
          <p className="text-gray-600 mb-6">
            Upload a spreadsheet containing your recall roster to generate an organizational diagram
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center mx-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Roster
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <p className="text-sm font-medium text-gray-600">Total Personnel</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{recallRosterData.length}</p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-600">Unique Ranks</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {new Set(recallRosterData.map(p => p.rank).filter(Boolean)).size}
              </p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-600">Positions</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {new Set(recallRosterData.map(p => p.position).filter(Boolean)).size}
              </p>
            </div>
          </div>
          
          {/* Mermaid Diagram */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Chart</h2>
            <div className="bg-gray-50 rounded-lg p-6 overflow-x-auto">
              <div ref={mermaidRef} className="mermaid flex justify-center"></div>
            </div>
          </div>
          
          {/* Roster Table */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Roster Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recallRosterData.map((person, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {person.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {person.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {person.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {person.supervisor || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {person.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {person.email || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {/* Upload Modal */}
      {showUploadModal && (
        <RecallRosterUpload onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  )
}

const RecallRosterUpload = ({ onClose }) => {
  const { setRecallRosterData } = useSchedule()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      parseFile(selectedFile)
    }
  }
  
  const parseFile = (file) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        
        if (jsonData.length === 0) {
          setError('The file appears to be empty')
          return
        }
        
        // Transform data to match our roster structure
        const transformedData = jsonData.map(row => ({
          name: row['Name'] || row['name'] || '',
          rank: row['Rank'] || row['rank'] || '',
          position: row['Position'] || row['position'] || row['Title'] || '',
          supervisor: row['Supervisor'] || row['supervisor'] || row['Reports To'] || '',
          phone: row['Phone'] || row['phone'] || row['Phone Number'] || '',
          email: row['Email'] || row['email'] || row['Email Address'] || '',
        }))
        
        setPreview(transformedData.slice(0, 5))
      } catch (err) {
        setError('Error parsing file. Please ensure it\'s a valid Excel or CSV file.')
        console.error(err)
      }
    }
    
    reader.onerror = () => {
      setError('Error reading file')
    }
    
    reader.readAsArrayBuffer(file)
  }
  
  const handleImport = () => {
    if (!preview) return
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        
        const transformedData = jsonData.map(row => ({
          name: row['Name'] || row['name'] || '',
          rank: row['Rank'] || row['rank'] || '',
          position: row['Position'] || row['position'] || row['Title'] || '',
          supervisor: row['Supervisor'] || row['supervisor'] || row['Reports To'] || '',
          phone: row['Phone'] || row['phone'] || row['Phone Number'] || '',
          email: row['Email'] || row['email'] || row['Email Address'] || '',
        }))
        
        setRecallRosterData(transformedData)
        onClose()
      } catch (err) {
        setError('Error importing data')
        console.error(err)
      }
    }
    
    reader.readAsArrayBuffer(file)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Upload className="h-6 w-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Upload Recall Roster</h2>
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
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-600">
                  Excel (.xlsx, .xls) or CSV files with columns: Name, Rank, Position, Supervisor, Phone, Email
                </p>
              </div>
            </label>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {/* Preview */}
          {preview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Preview (First 5 rows)</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.rank}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.position}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.supervisor}</td>
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
            Import Roster
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecallRoster







