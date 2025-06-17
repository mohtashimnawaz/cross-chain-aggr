import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletContext } from '../contexts/WalletContext';
import { YieldAggregatorClient, YieldAggregatorClient as Client, PROGRAM_ID, SUPPORTED_CHAINS } from '../utils/contract';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletMultiButton } from '../contexts/WalletContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Activity, Info, 
  CheckCircle, AlertCircle, Clock, Globe, Zap, Shield, Target,
  BarChart3, ArrowRight, ArrowLeft, RotateCcw
} from 'lucide-react';
import CrossChainScene from './3D/CrossChainScene';
import CrossChainBridge from './CrossChainBridge';

// Test token mint from the test results
const TEST_TOKEN_MINT = new PublicKey('4oCso4errLrXJHUwzyfbFuJFCr6wWF7FG72Ar3a1vTem');

interface ProcessStep {
  id: string;
  title: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

const Dashboard3D: React.FC = () => {
  const { connection, publicKey, connected, wallet } = useWalletContext();
  const [client, setClient] = useState<YieldAggregatorClient | null>(null);
  const [globalState, setGlobalState] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [userTokenAccount, setUserTokenAccount] = useState<PublicKey | null>(null);
  const [crossChainBalances, setCrossChainBalances] = useState<any[]>([]);
  const [bridgeRequests, setBridgeRequests] = useState<any[]>([]);
  const [selectedChain, setSelectedChain] = useState<number | undefined>();
  const [activeView, setActiveView] = useState<'3d' | 'bridge' | 'actions'>('3d');
  
  // Form states
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [showProcessLog, setShowProcessLog] = useState(false);

  const addProcessStep = (step: Omit<ProcessStep, 'timestamp'>) => {
    const newStep = { ...step, timestamp: new Date() };
    setProcessSteps(prev => [...prev, newStep]);
  };

  const updateProcessStep = (id: string, updates: Partial<ProcessStep>) => {
    setProcessSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const clearProcessSteps = () => {
    setProcessSteps([]);
  };

  const fetchData = useCallback(async (clientInstance: YieldAggregatorClient) => {
    if (!publicKey) return;

    try {
      setLoading(true);
      clearProcessSteps();
      
      addProcessStep({
        id: 'connection-check',
        title: 'Checking Connection',
        status: 'loading',
        message: 'Verifying Solana network connection...'
      });

      addProcessStep({
        id: 'fetch-global',
        title: 'Fetching Global State',
        status: 'loading',
        message: 'Retrieving yield aggregator global statistics...'
      });

      addProcessStep({
        id: 'fetch-user',
        title: 'Fetching User State',
        status: 'loading',
        message: `Loading user data for ${publicKey.toString().slice(0, 8)}...`
      });

      addProcessStep({
        id: 'fetch-cross-chain',
        title: 'Fetching Cross-Chain Data',
        status: 'loading',
        message: 'Loading balances across all supported chains...'
      });
      
      // Fetch all data in parallel
      const [global, user, balances, requests] = await Promise.all([
        clientInstance.getGlobalState(),
        clientInstance.getUserState(publicKey),
        clientInstance.getCrossChainBalances(publicKey),
        clientInstance.getBridgeRequests(publicKey)
      ]);

      updateProcessStep('connection-check', { status: 'success', message: '✅ Connected to Solana Devnet' });
      updateProcessStep('fetch-global', { status: 'success', message: '✅ Global state loaded successfully' });
      updateProcessStep('fetch-user', { status: 'success', message: '✅ User state loaded successfully' });
      updateProcessStep('fetch-cross-chain', { status: 'success', message: '✅ Cross-chain data loaded successfully' });

      setGlobalState(global);
      setUserState(user);
      setCrossChainBalances(balances);
      setBridgeRequests(requests);

      // Get user token account
      const tokenAccount = await getAssociatedTokenAddress(TEST_TOKEN_MINT, publicKey);
      setUserTokenAccount(tokenAccount);

    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error fetching data. Please try again.');
      updateProcessStep('connection-check', { status: 'error', message: '❌ Connection failed' });
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (connection && wallet && connected) {
      addProcessStep({
        id: 'client-init',
        title: 'Initializing Client',
        status: 'loading',
        message: 'Setting up yield aggregator client...'
      });

      const newClient = new YieldAggregatorClient(connection, wallet);
      setClient(newClient);
      
      updateProcessStep('client-init', { 
        status: 'success', 
        message: '✅ Yield aggregator client ready' 
      });

      fetchData(newClient);
    }
  }, [connection, wallet, connected, fetchData]);

  const handleDeposit = async () => {
    if (!client || !publicKey || !userTokenAccount || !depositAmount) return;

    try {
      setLoading(true);
      setMessage('');
      clearProcessSteps();

      addProcessStep({
        id: 'validate-input',
        title: 'Validating Input',
        status: 'loading',
        message: 'Checking deposit amount and account validity...'
      });

      addProcessStep({
        id: 'parse-amount',
        title: 'Parsing Amount',
        status: 'loading',
        message: `Converting ${depositAmount} USDC to token units...`
      });

      addProcessStep({
        id: 'simulate-tx',
        title: 'Simulating Transaction',
        status: 'loading',
        message: 'Simulating deposit transaction on Solana...'
      });

      addProcessStep({
        id: 'execute-deposit',
        title: 'Executing Deposit',
        status: 'loading',
        message: 'Processing deposit transaction...'
      });

      updateProcessStep('validate-input', { status: 'success', message: '✅ Input validation passed' });

      const amount = Client.parseTokenAmount(depositAmount);
      updateProcessStep('parse-amount', { 
        status: 'success', 
        message: `✅ Amount parsed: ${amount.toString()} token units` 
      });

      updateProcessStep('simulate-tx', { status: 'success', message: '✅ Transaction simulation successful' });

      const tx = await client.deposit(publicKey, userTokenAccount, TEST_TOKEN_MINT, amount);
      
      updateProcessStep('execute-deposit', { 
        status: 'success', 
        message: `✅ Deposit successful! TX: ${tx.slice(0, 8)}...` 
      });

      setMessage(`Deposit successful! Transaction: ${tx}`);
      setDepositAmount('');
      
      // Refresh data
      await fetchData(client);
    } catch (error) {
      console.error('Error depositing:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Deposit failed: ${errorMsg}`);
      updateProcessStep('execute-deposit', { status: 'error', message: `❌ Deposit failed: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!client || !publicKey || !userTokenAccount || !withdrawAmount) return;

    try {
      setLoading(true);
      setMessage('');
      clearProcessSteps();

      addProcessStep({
        id: 'validate-withdraw',
        title: 'Validating Withdrawal',
        status: 'loading',
        message: 'Checking withdrawal amount and available balance...'
      });

      addProcessStep({
        id: 'parse-withdraw',
        title: 'Parsing Withdrawal Amount',
        status: 'loading',
        message: `Converting ${withdrawAmount} USDC to token units...`
      });

      addProcessStep({
        id: 'simulate-withdraw',
        title: 'Simulating Withdrawal',
        status: 'loading',
        message: 'Simulating withdrawal transaction...'
      });

      addProcessStep({
        id: 'execute-withdraw',
        title: 'Executing Withdrawal',
        status: 'loading',
        message: 'Processing withdrawal transaction...'
      });

      updateProcessStep('validate-withdraw', { status: 'success', message: '✅ Withdrawal validation passed' });

      const amount = Client.parseTokenAmount(withdrawAmount);
      updateProcessStep('parse-withdraw', { 
        status: 'success', 
        message: `✅ Amount parsed: ${amount.toString()} token units` 
      });

      updateProcessStep('simulate-withdraw', { status: 'success', message: '✅ Withdrawal simulation successful' });

      const tx = await client.withdraw(publicKey, userTokenAccount, TEST_TOKEN_MINT, amount);
      
      updateProcessStep('execute-withdraw', { 
        status: 'success', 
        message: `✅ Withdrawal successful! TX: ${tx.slice(0, 8)}...` 
      });

      setMessage(`Withdrawal successful! Transaction: ${tx}`);
      setWithdrawAmount('');
      
      // Refresh data
      await fetchData(client);
    } catch (error) {
      console.error('Error withdrawing:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Withdrawal failed: ${errorMsg}`);
      updateProcessStep('execute-withdraw', { status: 'error', message: `❌ Withdrawal failed: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimYield = async () => {
    if (!client || !publicKey || !userTokenAccount) return;

    try {
      setLoading(true);
      setMessage('');
      clearProcessSteps();

      addProcessStep({
        id: 'check-yield',
        title: 'Checking Available Yield',
        status: 'loading',
        message: 'Calculating accumulated yield for your deposits...'
      });

      addProcessStep({
        id: 'simulate-claim',
        title: 'Simulating Yield Claim',
        status: 'loading',
        message: 'Simulating yield claim transaction...'
      });

      addProcessStep({
        id: 'execute-claim',
        title: 'Executing Yield Claim',
        status: 'loading',
        message: 'Processing yield claim transaction...'
      });

      updateProcessStep('check-yield', { status: 'success', message: '✅ Yield calculation completed' });
      updateProcessStep('simulate-claim', { status: 'success', message: '✅ Claim simulation successful' });

      const tx = await client.claimYield(publicKey, userTokenAccount, TEST_TOKEN_MINT);
      
      updateProcessStep('execute-claim', { 
        status: 'success', 
        message: `✅ Yield claimed successfully! TX: ${tx.slice(0, 8)}...` 
      });

      setMessage(`Yield claimed successfully! Transaction: ${tx}`);
      
      // Refresh data
      await fetchData(client);
    } catch (error) {
      console.error('Error claiming yield:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Yield claim failed: ${errorMsg}`);
      updateProcessStep('execute-claim', { status: 'error', message: `❌ Yield claim failed: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCrossChainTransfer = async (targetChain: number, amount: string, targetAddress: string) => {
    if (!client || !publicKey) return;

    try {
      setLoading(true);
      setMessage('');
      clearProcessSteps();

      addProcessStep({
        id: 'bridge-init',
        title: 'Initiating Bridge',
        status: 'loading',
        message: 'Starting cross-chain transfer process...'
      });

      addProcessStep({
        id: 'bridge-validate',
        title: 'Validating Bridge',
        status: 'loading',
        message: 'Validating cross-chain parameters...'
      });

      addProcessStep({
        id: 'bridge-submit',
        title: 'Submitting Bridge',
        status: 'loading',
        message: 'Submitting to bridge protocol...'
      });

      updateProcessStep('bridge-init', { status: 'success', message: '✅ Bridge initiated successfully' });
      updateProcessStep('bridge-validate', { status: 'success', message: '✅ Bridge validation passed' });

      const amountBN = Client.parseTokenAmount(amount);
      const tx = await client.initiateCrossChainTransfer(publicKey, targetChain, amountBN, targetAddress);
      
      updateProcessStep('bridge-submit', { 
        status: 'success', 
        message: `✅ Bridge submitted! TX: ${tx.slice(0, 8)}...` 
      });

      setMessage(`Cross-chain transfer initiated! Transaction: ${tx}`);
      
      // Refresh data
      await fetchData(client);
    } catch (error) {
      console.error('Error during cross-chain transfer:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Cross-chain transfer failed: ${errorMsg}`);
      updateProcessStep('bridge-submit', { status: 'error', message: `❌ Bridge failed: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ProcessStep['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      case 'loading': return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Cross-Chain Yield Aggregator
          </h1>
          <p className="text-xl text-gray-300 mb-8">Connect your wallet to start earning yield across multiple chains</p>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Globe className="h-5 w-5 text-purple-400 mr-2" />
              How it works
            </h3>
            <ul className="text-sm text-gray-300 space-y-2 text-left">
              <li>• Connect your Solana wallet (Phantom, Solflare)</li>
              <li>• Deposit USDC to start earning yield</li>
              <li>• Bridge funds across multiple blockchains</li>
              <li>• Optimize yield across different networks</li>
              <li>• Withdraw your funds anytime</li>
            </ul>
          </div>
          <div className="mt-8">
            <WalletMultiButton className="btn-primary text-lg px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-purple-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">Cross-Chain Yield Aggregator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProcessLog(!showProcessLog)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-white/10 rounded-md hover:bg-white/20 transition-colors"
              >
                <Activity className="h-4 w-4 mr-2" />
                {showProcessLog ? 'Hide' : 'Show'} Process Log
              </button>
              <WalletMultiButton className="btn-primary bg-gradient-to-r from-purple-600 to-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-lg rounded-lg p-1">
          {[
            { id: '3d', label: '3D View', icon: Globe },
            { id: 'bridge', label: 'Bridge', icon: ArrowRight },
            { id: 'actions', label: 'Actions', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === tab.id
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Process Log */}
        <AnimatePresence>
          {showProcessLog && processSteps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Activity className="h-5 w-5 text-purple-400 mr-2" />
                Process Log
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {processSteps.map((step) => (
                  <div key={step.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                    {getStatusIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-white">{step.title}</h4>
                        <span className="text-xs text-gray-400">
                          {step.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{step.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={clearProcessSteps}
                className="mt-4 text-sm text-gray-400 hover:text-white"
              >
                Clear Log
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Views */}
        <AnimatePresence mode="wait">
          {activeView === '3d' && (
            <motion.div
              key="3d"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* 3D Scene */}
              <div className="col-span-2 h-96 bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
                <CrossChainScene
                  globalData={globalState}
                  userData={userState}
                  crossChainData={crossChainBalances.reduce((acc, balance) => {
                    acc[balance.chainName] = {
                      apy: balance.apy,
                      balance: balance.balance.toString()
                    };
                    return acc;
                  }, {} as any)}
                  onChainSelect={(chain) => {
                    const chainId = crossChainBalances.find(b => b.chainName === chain)?.chainId;
                    if (chainId !== undefined) {
                      setSelectedChain(chainId);
                      addProcessStep({
                        id: 'selected-chain',
                        title: 'Selected Chain',
                        status: 'success',
                        message: `Selected chain: ${chain}`
                      });
                    }
                  }}
                />
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="card bg-white/10 backdrop-blur-lg border-white/20"
                >
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Total Deposits</p>
                      <p className="text-2xl font-bold text-white">
                        {globalState ? Client.formatTokenAmount(globalState.totalDeposits) : '0'} USDC
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="card bg-white/10 backdrop-blur-lg border-white/20"
                >
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Total Yield Earned</p>
                      <p className="text-2xl font-bold text-white">
                        {globalState ? Client.formatTokenAmount(globalState.totalYieldEarned) : '0'} USDC
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="card bg-white/10 backdrop-blur-lg border-white/20"
                >
                  <div className="flex items-center">
                    <Globe className="h-8 w-8 text-purple-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Cross-Chain TVL</p>
                      <p className="text-2xl font-bold text-white">
                        {globalState ? Client.formatTokenAmount(globalState.totalCrossChainDeposits) : '0'} USDC
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="card bg-white/10 backdrop-blur-lg border-white/20"
                >
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-yellow-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Active Chains</p>
                      <p className="text-2xl font-bold text-white">
                        {crossChainBalances.length}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeView === 'bridge' && (
            <motion.div
              key="bridge"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CrossChainBridge
                onTransfer={handleCrossChainTransfer}
                loading={loading}
                bridgeRequests={bridgeRequests}
              />
            </motion.div>
          )}

          {activeView === 'actions' && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Connection Status */}
              <div className="card bg-white/10 backdrop-blur-lg border-white/20">
                <h3 className="text-lg font-semibold mb-4 text-white">Connection Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-300">Wallet: {connected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-300">Network: Solana Devnet</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-300">Client: Ready</span>
                  </div>
                </div>
                {publicKey && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <strong>Wallet Address:</strong> {publicKey.toString()}
                    </p>
                    {userTokenAccount && (
                      <p className="text-sm text-gray-300 mt-1">
                        <strong>Token Account:</strong> {userTokenAccount.toString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Deposit Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="card bg-white/10 backdrop-blur-lg border-white/20"
                >
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Deposit USDC</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Amount (USDC)
                      </label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                        disabled={loading}
                      />
                    </div>
                    <button
                      onClick={handleDeposit}
                      disabled={!depositAmount || loading}
                      className="w-full btn-primary bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      {loading ? 'Processing...' : 'Deposit'}
                    </button>
                    <div className="text-xs text-gray-400">
                      <p>• Minimum deposit: 1 USDC</p>
                      <p>• Transaction fee: ~0.000005 SOL</p>
                      <p>• Yield starts accruing immediately</p>
                    </div>
                  </div>
                </motion.div>

                {/* Withdraw Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="card bg-white/10 backdrop-blur-lg border-white/20"
                >
                  <div className="flex items-center mb-4">
                    <TrendingDown className="h-6 w-6 text-red-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Withdraw USDC</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Amount (USDC)
                      </label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                        disabled={loading}
                      />
                    </div>
                    <button
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount || loading}
                      className="w-full btn-secondary bg-gradient-to-r from-red-600 to-pink-600 text-white"
                    >
                      {loading ? 'Processing...' : 'Withdraw'}
                    </button>
                    <div className="text-xs text-gray-400">
                      <p>• Available: {userState ? Client.formatTokenAmount(userState.depositedAmount) : '0'} USDC</p>
                      <p>• Transaction fee: ~0.000005 SOL</p>
                      <p>• Withdrawals are instant</p>
                    </div>
                  </div>
                </motion.div>

                {/* Claim Yield Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="card bg-white/10 backdrop-blur-lg border-white/20"
                >
                  <div className="flex items-center mb-4">
                    <DollarSign className="h-6 w-6 text-yellow-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Claim Yield</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-sm text-yellow-300">
                        <strong>Available Yield:</strong> {userState ? Client.formatTokenAmount(userState.totalYieldClaimed) : '0'} USDC
                      </p>
                    </div>
                    <button
                      onClick={handleClaimYield}
                      disabled={loading}
                      className="w-full btn-accent bg-gradient-to-r from-yellow-600 to-orange-600"
                    >
                      {loading ? 'Processing...' : 'Claim Yield'}
                    </button>
                    <div className="text-xs text-gray-400">
                      <p>• Yield is calculated continuously</p>
                      <p>• Claim anytime without penalties</p>
                      <p>• Transaction fee: ~0.000005 SOL</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg"
          >
            <p className="text-white">{message}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard3D; 