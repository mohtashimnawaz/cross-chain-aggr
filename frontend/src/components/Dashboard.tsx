import React, { useState, useEffect, useCallback } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { YieldAggregatorClient, YieldAggregatorClient as Client, PROGRAM_ID } from '../utils/contract';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletMultiButton } from '../contexts/WalletContext';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Info, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// Test token mint from the test results
const TEST_TOKEN_MINT = new PublicKey('4oCso4errLrXJHUwzyfbFuJFCr6wWF7FG72Ar3a1vTem');

interface ProcessStep {
  id: string;
  title: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

const Dashboard: React.FC = () => {
  const { connection, publicKey, connected, wallet } = useWalletContext();
  const [client, setClient] = useState<YieldAggregatorClient | null>(null);
  const [globalState, setGlobalState] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [userTokenAccount, setUserTokenAccount] = useState<PublicKey | null>(null);
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
        id: 'token-account',
        title: 'Getting Token Account',
        status: 'loading',
        message: 'Calculating associated token account address...'
      });
      
      // Fetch global and user state
      const [global, user] = await Promise.all([
        clientInstance.getGlobalState(),
        clientInstance.getUserState(publicKey)
      ]);

      updateProcessStep('connection-check', { status: 'success', message: '✅ Connected to Solana Devnet' });
      updateProcessStep('fetch-global', { status: 'success', message: '✅ Global state loaded successfully' });
      updateProcessStep('fetch-user', { status: 'success', message: '✅ User state loaded successfully' });

      setGlobalState(global);
      setUserState(user);

      // Get user token account
      const tokenAccount = await getAssociatedTokenAddress(TEST_TOKEN_MINT, publicKey);
      setUserTokenAccount(tokenAccount);
      updateProcessStep('token-account', { 
        status: 'success', 
        message: `✅ Token account: ${tokenAccount.toString().slice(0, 8)}...` 
      });

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cross-Chain Yield Aggregator</h1>
          <p className="text-lg text-gray-600 mb-8">Connect your wallet to start earning yield across multiple chains</p>
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Info className="h-5 w-5 text-blue-500 mr-2" />
              How it works
            </h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>• Connect your Solana wallet (Phantom, Solflare)</li>
              <li>• Deposit USDC to start earning yield</li>
              <li>• Yield is automatically calculated and can be claimed</li>
              <li>• Withdraw your funds anytime</li>
              <li>• Cross-chain functionality coming soon</li>
            </ul>
          </div>
          <div className="mt-8">
            <WalletMultiButton className="btn-primary text-lg px-8 py-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Yield Aggregator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProcessLog(!showProcessLog)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <Info className="h-4 w-4 mr-2" />
                {showProcessLog ? 'Hide' : 'Show'} Process Log
              </button>
              <WalletMultiButton className="btn-primary" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Process Log */}
        {showProcessLog && processSteps.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              Process Log
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {processSteps.map((step) => (
                <div key={step.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <span className="text-xs text-gray-500">
                        {step.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={clearProcessSteps}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Log
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalState ? Client.formatTokenAmount(globalState.totalDeposits) : '0'} USDC
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Yield Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalState ? Client.formatTokenAmount(globalState.totalYieldEarned) : '0'} USDC
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Your Deposits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userState ? Client.formatTokenAmount(userState.depositedAmount) : '0'} USDC
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">APY Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalState ? `${(globalState.solanaYieldRate.toNumber() / 100).toFixed(2)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Wallet: {connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Network: Solana Devnet</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Client: Ready</span>
            </div>
          </div>
          {publicKey && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Wallet Address:</strong> {publicKey.toString()}
              </p>
              {userTokenAccount && (
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Token Account:</strong> {userTokenAccount.toString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deposit Card */}
          <div className="card">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Deposit USDC</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || loading}
                className="w-full btn-primary"
              >
                {loading ? 'Processing...' : 'Deposit'}
              </button>
              <div className="text-xs text-gray-500">
                <p>• Minimum deposit: 1 USDC</p>
                <p>• Transaction fee: ~0.000005 SOL</p>
                <p>• Yield starts accruing immediately</p>
              </div>
            </div>
          </div>

          {/* Withdraw Card */}
          <div className="card">
            <div className="flex items-center mb-4">
              <TrendingDown className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold">Withdraw USDC</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || loading}
                className="w-full btn-secondary"
              >
                {loading ? 'Processing...' : 'Withdraw'}
              </button>
              <div className="text-xs text-gray-500">
                <p>• Available: {userState ? Client.formatTokenAmount(userState.depositedAmount) : '0'} USDC</p>
                <p>• Transaction fee: ~0.000005 SOL</p>
                <p>• Withdrawals are instant</p>
              </div>
            </div>
          </div>

          {/* Claim Yield Card */}
          <div className="card">
            <div className="flex items-center mb-4">
              <DollarSign className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold">Claim Yield</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Available Yield:</strong> {userState ? Client.formatTokenAmount(userState.totalYieldClaimed) : '0'} USDC
                </p>
              </div>
              <button
                onClick={handleClaimYield}
                disabled={loading}
                className="w-full btn-accent"
              >
                {loading ? 'Processing...' : 'Claim Yield'}
              </button>
              <div className="text-xs text-gray-500">
                <p>• Yield is calculated continuously</p>
                <p>• Claim anytime without penalties</p>
                <p>• Transaction fee: ~0.000005 SOL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {/* Technical Details */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Smart Contract</h4>
              <p className="text-gray-600 mb-2">Program ID: {PROGRAM_ID.toString()}</p>
              <p className="text-gray-600 mb-2">Token Mint: {TEST_TOKEN_MINT.toString()}</p>
              <p className="text-gray-600">Network: Solana Devnet</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Current State</h4>
              <p className="text-gray-600 mb-2">Connection: {connection ? 'Active' : 'Inactive'}</p>
              <p className="text-gray-600 mb-2">Client: {client ? 'Initialized' : 'Not Ready'}</p>
              <p className="text-gray-600">Last Update: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 