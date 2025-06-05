import React, { useState } from 'react'
import { ArrowLeft, Box, Code } from 'lucide-react'

const NetworkSelector = ({ selectedNetwork, onNetworkChange, onBack }) => {
  const [tempSelected, setTempSelected] = useState(selectedNetwork)

  const networks = [
    {
      id: 'mainnet',
      name: 'Mainnet',
      icon: <Box className="w-6 h-6 text-blue-400" />,
      selected: tempSelected === 'mainnet'
    },
    {
      id: 'testnet',
      name: 'Testnet',
      icon: <Box className="w-6 h-6 text-gray-400" />,
      selected: tempSelected === 'testnet'
    },
    {
      id: 'devnet',
      name: 'Devnet',
      icon: <Code className="w-6 h-6 text-gray-400" />,
      selected: tempSelected === 'devnet'
    }
  ]

  const handleSave = () => {
    onNetworkChange(tempSelected)
    onBack()
  }

  return (
    <div className="h-full bg-[#2a2a2a] text-white">
      {/* Header */}
      <div className="flex items-center p-6 border-b border-gray-700">
        <button onClick={onBack} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 py-8">
        <h1 className="text-4xl font-light text-white mb-2">Network</h1>
        <p className="text-gray-400 text-lg">Switch between different network.</p>
      </div>

      {/* Network Options */}
      <div className="px-6 space-y-4">
        {networks.map((network) => (
          <button
            key={network.id}
            onClick={() => setTempSelected(network.id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
              network.selected 
                ? 'bg-blue-600 border border-blue-500' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                network.selected ? 'bg-blue-500' : 'bg-gray-600'
              }`}>
                {network.icon}
              </div>
              <span className="text-xl font-medium text-white">{network.name}</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              network.selected 
                ? 'border-white bg-white' 
                : 'border-gray-400'
            }`}>
              {network.selected && (
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Save Button */}
      <div className="absolute bottom-8 left-6 right-6">
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 rounded-xl text-lg transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default NetworkSelector