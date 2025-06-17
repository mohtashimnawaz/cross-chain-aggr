import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { SUPPORTED_CHAINS, YieldAggregatorClient } from '../utils/contract';

interface CrossChainBridgeProps {
  onTransfer: (targetChain: number, amount: string, targetAddress: string) => Promise<void>;
  loading: boolean;
  bridgeRequests: any[];
}

const CrossChainBridge: React.FC<CrossChainBridgeProps> = ({
  onTransfer,
  loading,
  bridgeRequests
}) => {
  const [targetChain, setTargetChain] = useState<number>(SUPPORTED_CHAINS.ETHEREUM.id);
  const [amount, setAmount] = useState('');
  const [targetAddress, setTargetAddress] = useState('');

  const handleTransfer = async () => {
    if (!amount || !targetAddress) return;
    await onTransfer(targetChain, amount, targetAddress);
    setAmount('');
    setTargetAddress('');
  };

  const getChainInfo = (chainId: number) => {
    return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return <Clock className="h-4 w-4 text-yellow-500" />;
      case 1: return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 2: return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 3: return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Processing';
      case 2: return 'Completed';
      case 3: return 'Failed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Bridge Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200"
      >
        <div className="flex items-center mb-4">
          <Globe className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Cross-Chain Bridge</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Chain Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Chain
            </label>
            <select
              value={targetChain}
              onChange={(e) => setTargetChain(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.values(SUPPORTED_CHAINS).map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.icon} {chain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>

          {/* Target Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Address
            </label>
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>
        </div>

        {/* Transfer Button */}
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTransfer}
            disabled={!amount || !targetAddress || loading}
            className="w-full btn-primary bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Bridge...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Globe className="h-4 w-4 mr-2" />
                Bridge to {getChainInfo(targetChain)?.name}
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            )}
          </motion.button>
        </div>

        {/* Bridge Info */}
        <div className="mt-4 p-3 bg-purple-100 rounded-lg">
          <div className="text-sm text-purple-800">
            <p><strong>Estimated Time:</strong> 2-5 minutes</p>
            <p><strong>Bridge Fee:</strong> ~0.001 {getChainInfo(targetChain)?.symbol}</p>
            <p><strong>Security:</strong> Multi-sig bridge with 24h delay</p>
          </div>
        </div>
      </motion.div>

      {/* Bridge Requests */}
      {bridgeRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h4 className="text-lg font-semibold mb-4">Recent Bridge Requests</h4>
          <div className="space-y-3">
            {bridgeRequests.map((request, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <p className="font-medium text-sm">
                      {YieldAggregatorClient.formatTokenAmount(request.amount)} USDC
                    </p>
                    <p className="text-xs text-gray-600">
                      To {getChainInfo(request.targetChain)?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{getStatusText(request.status)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.createdAt * 1000).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Supported Chains Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h4 className="text-lg font-semibold mb-4">Supported Networks</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.values(SUPPORTED_CHAINS).map((chain) => (
            <motion.div
              key={chain.id}
              whileHover={{ scale: 1.05 }}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                targetChain === chain.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setTargetChain(chain.id)}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{chain.icon}</div>
                <p className="font-medium text-sm">{chain.name}</p>
                <p className="text-xs text-gray-600">{chain.symbol}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CrossChainBridge; 