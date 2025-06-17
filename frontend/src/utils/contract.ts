import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export const PROGRAM_ID = new PublicKey('HeHD9gK7PC2tzxEVoL18eAz6EPLnXe7XY9CLnDCPeRiW');

// Chain configuration
export const SUPPORTED_CHAINS = {
  SOLANA: { id: 1, name: 'Solana', symbol: 'SOL', color: '#9945FF', icon: '🔸' },
  ETHEREUM: { id: 2, name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: '🔷' },
  POLYGON: { id: 3, name: 'Polygon', symbol: 'MATIC', color: '#8247E5', icon: '🔶' },
  BSC: { id: 4, name: 'BNB Chain', symbol: 'BNB', color: '#F3BA2F', icon: '🟡' },
  ARBITRUM: { id: 5, name: 'Arbitrum', symbol: 'ARB', color: '#28A0F0', icon: '🔵' },
  OPTIMISM: { id: 6, name: 'Optimism', symbol: 'OP', color: '#FF0420', icon: '🔴' },
  AVALANCHE: { id: 7, name: 'Avalanche', symbol: 'AVAX', color: '#E84142', icon: '🟠' },
  FANTOM: { id: 8, name: 'Fantom', symbol: 'FTM', color: '#1969FF', icon: '🟣' },
} as const;

export interface GlobalState {
  authority: PublicKey;
  totalDeposits: BN;
  totalYieldEarned: BN;
  solanaYieldRate: BN;
  ethereumYieldRate: BN;
  polygonYieldRate: BN;
  lastYieldUpdate: BN;
  isInitialized: boolean;
  bump: number;
  pendingCrossChainAmount: BN;
  totalCrossChainDeposits: BN;
  oracleData: OracleData;
  lastOracleUpdate: BN;
}

export interface UserState {
  user: PublicKey;
  depositedAmount: BN;
  totalYieldClaimed: BN;
  lastDepositTimestamp: BN;
  lastWithdrawalTimestamp: BN;
  lastYieldClaim: BN;
  bump: number;
  pendingCrossChainTransfers: BN;
  crossChainDeposits: BN;
}

export interface OracleData {
  sourceChain: number;
  timestamp: BN;
  yieldRates: BN[];
  totalValueLocked: BN;
  apyData: BN[];
}

export interface BridgeRequest {
  user: PublicKey;
  targetChain: number;
  amount: BN;
  targetAddress: number[];
  status: number;
  createdAt: BN;
  completedAt: BN;
  bump: number;
}

export interface CrossChainBalance {
  chainId: number;
  chainName: string;
  balance: BN;
  yieldRate: BN;
  apy: number;
  color: string;
  icon: string;
}

export class YieldAggregatorClient {
  private connection: Connection;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    console.log('🔧 YieldAggregatorClient initialized with connection:', connection.rpcEndpoint);
  }

  async getGlobalState(): Promise<GlobalState | null> {
    try {
      console.log('📊 Fetching global state from smart contract...');
      
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data for demonstration with cross-chain support
      const mockGlobalState = {
        authority: new PublicKey('11111111111111111111111111111111'),
        totalDeposits: new BN(5000000000), // 5 USDC in token units
        totalYieldEarned: new BN(250000000), // 0.25 USDC in token units
        solanaYieldRate: new BN(500), // 5% APY
        ethereumYieldRate: new BN(300), // 3% APY
        polygonYieldRate: new BN(400), // 4% APY
        lastYieldUpdate: new BN(Date.now() / 1000),
        isInitialized: true,
        bump: 0,
        pendingCrossChainAmount: new BN(1000000000), // 1 USDC pending
        totalCrossChainDeposits: new BN(2000000000), // 2 USDC cross-chain
        oracleData: {
          sourceChain: 1,
          timestamp: new BN(Date.now() / 1000),
          yieldRates: [
            new BN(500), // Solana
            new BN(300), // Ethereum
            new BN(400), // Polygon
            new BN(350), // BSC
            new BN(450), // Arbitrum
            new BN(380), // Optimism
            new BN(420), // Avalanche
            new BN(320), // Fantom
          ],
          totalValueLocked: new BN(10000000000), // 10 USDC TVL
          apyData: [
            new BN(500), new BN(300), new BN(400), new BN(350),
            new BN(450), new BN(380), new BN(420), new BN(320)
          ]
        },
        lastOracleUpdate: new BN(Date.now() / 1000)
      };
      
      console.log('✅ Global state loaded successfully:', {
        totalDeposits: YieldAggregatorClient.formatTokenAmount(mockGlobalState.totalDeposits),
        totalYieldEarned: YieldAggregatorClient.formatTokenAmount(mockGlobalState.totalYieldEarned),
        crossChainDeposits: YieldAggregatorClient.formatTokenAmount(mockGlobalState.totalCrossChainDeposits)
      });
      
      return mockGlobalState;
    } catch (error) {
      console.error('❌ Error fetching global state:', error);
      return null;
    }
  }

  async getUserState(userPublicKey: PublicKey): Promise<UserState | null> {
    try {
      console.log('👤 Fetching user state for:', userPublicKey.toString().slice(0, 8) + '...');
      
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return mock data for demonstration with cross-chain support
      const mockUserState = {
        user: userPublicKey,
        depositedAmount: new BN(1500000000), // 1.5 USDC in token units
        totalYieldClaimed: new BN(75000000), // 0.075 USDC in token units
        lastDepositTimestamp: new BN(Date.now() / 1000 - 86400), // 1 day ago
        lastWithdrawalTimestamp: new BN(0),
        lastYieldClaim: new BN(Date.now() / 1000 - 3600), // 1 hour ago
        bump: 0,
        pendingCrossChainTransfers: new BN(500000000), // 0.5 USDC pending
        crossChainDeposits: new BN(800000000) // 0.8 USDC cross-chain
      };
      
      console.log('✅ User state loaded successfully:', {
        depositedAmount: YieldAggregatorClient.formatTokenAmount(mockUserState.depositedAmount),
        totalYieldClaimed: YieldAggregatorClient.formatTokenAmount(mockUserState.totalYieldClaimed),
        crossChainDeposits: YieldAggregatorClient.formatTokenAmount(mockUserState.crossChainDeposits)
      });
      
      return mockUserState;
    } catch (error) {
      console.error('❌ Error fetching user state:', error);
      return null;
    }
  }

  async getCrossChainBalances(userPublicKey: PublicKey): Promise<CrossChainBalance[]> {
    try {
      console.log('🌐 Fetching cross-chain balances...');
      
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Return mock cross-chain balance data
      const mockBalances: CrossChainBalance[] = [
        {
          chainId: SUPPORTED_CHAINS.SOLANA.id,
          chainName: SUPPORTED_CHAINS.SOLANA.name,
          balance: new BN(800000000), // 0.8 USDC
          yieldRate: new BN(500), // 5% APY
          apy: 5.0,
          color: SUPPORTED_CHAINS.SOLANA.color,
          icon: SUPPORTED_CHAINS.SOLANA.icon
        },
        {
          chainId: SUPPORTED_CHAINS.ETHEREUM.id,
          chainName: SUPPORTED_CHAINS.ETHEREUM.name,
          balance: new BN(400000000), // 0.4 USDC
          yieldRate: new BN(300), // 3% APY
          apy: 3.0,
          color: SUPPORTED_CHAINS.ETHEREUM.color,
          icon: SUPPORTED_CHAINS.ETHEREUM.icon
        },
        {
          chainId: SUPPORTED_CHAINS.POLYGON.id,
          chainName: SUPPORTED_CHAINS.POLYGON.name,
          balance: new BN(300000000), // 0.3 USDC
          yieldRate: new BN(400), // 4% APY
          apy: 4.0,
          color: SUPPORTED_CHAINS.POLYGON.color,
          icon: SUPPORTED_CHAINS.POLYGON.icon
        },
        {
          chainId: SUPPORTED_CHAINS.BSC.id,
          chainName: SUPPORTED_CHAINS.BSC.name,
          balance: new BN(200000000), // 0.2 USDC
          yieldRate: new BN(350), // 3.5% APY
          apy: 3.5,
          color: SUPPORTED_CHAINS.BSC.color,
          icon: SUPPORTED_CHAINS.BSC.icon
        },
        {
          chainId: SUPPORTED_CHAINS.ARBITRUM.id,
          chainName: SUPPORTED_CHAINS.ARBITRUM.name,
          balance: new BN(150000000), // 0.15 USDC
          yieldRate: new BN(450), // 4.5% APY
          apy: 4.5,
          color: SUPPORTED_CHAINS.ARBITRUM.color,
          icon: SUPPORTED_CHAINS.ARBITRUM.icon
        }
      ];
      
      console.log('✅ Cross-chain balances loaded successfully');
      return mockBalances;
    } catch (error) {
      console.error('❌ Error fetching cross-chain balances:', error);
      return [];
    }
  }

  async getVaultTokenAccount(mint: PublicKey): Promise<PublicKey> {
    console.log('🏦 Calculating vault token account for mint:', mint.toString().slice(0, 8) + '...');
    
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), mint.toBuffer()],
      PROGRAM_ID
    );
    
    console.log('✅ Vault token account calculated:', vaultPda.toString().slice(0, 8) + '...');
    return vaultPda;
  }

  async deposit(
    userPublicKey: PublicKey,
    userTokenAccount: PublicKey,
    mint: PublicKey,
    amount: BN
  ): Promise<string> {
    try {
      console.log('💰 Processing deposit transaction...');
      console.log('   User:', userPublicKey.toString().slice(0, 8) + '...');
      console.log('   Token Account:', userTokenAccount.toString().slice(0, 8) + '...');
      console.log('   Amount:', YieldAggregatorClient.formatTokenAmount(amount), 'USDC');
      
      // Simulate transaction processing steps
      console.log('   🔍 Validating transaction parameters...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('   📝 Creating transaction instruction...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('   🔐 Signing transaction with wallet...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('   🌐 Broadcasting transaction to network...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock transaction signature
      const mockTxSignature = `mock_deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Deposit transaction successful!');
      console.log('   Transaction ID:', mockTxSignature);
      console.log('   Amount deposited:', YieldAggregatorClient.formatTokenAmount(amount), 'USDC');
      
      return mockTxSignature;
    } catch (error) {
      console.error('❌ Error during deposit:', error);
      throw error;
    }
  }

  async withdraw(
    userPublicKey: PublicKey,
    userTokenAccount: PublicKey,
    mint: PublicKey,
    amount: BN
  ): Promise<string> {
    try {
      console.log('💸 Processing withdrawal transaction...');
      console.log('   User:', userPublicKey.toString().slice(0, 8) + '...');
      console.log('   Token Account:', userTokenAccount.toString().slice(0, 8) + '...');
      console.log('   Amount:', YieldAggregatorClient.formatTokenAmount(amount), 'USDC');
      
      // Simulate transaction processing steps
      console.log('   🔍 Checking available balance...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('   📝 Creating withdrawal instruction...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('   🔐 Signing transaction with wallet...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('   🌐 Broadcasting transaction to network...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock transaction signature
      const mockTxSignature = `mock_withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Withdrawal transaction successful!');
      console.log('   Transaction ID:', mockTxSignature);
      console.log('   Amount withdrawn:', YieldAggregatorClient.formatTokenAmount(amount), 'USDC');
      
      return mockTxSignature;
    } catch (error) {
      console.error('❌ Error during withdrawal:', error);
      throw error;
    }
  }

  async claimYield(
    userPublicKey: PublicKey,
    userTokenAccount: PublicKey,
    mint: PublicKey
  ): Promise<string> {
    try {
      console.log('🎯 Processing yield claim transaction...');
      console.log('   User:', userPublicKey.toString().slice(0, 8) + '...');
      console.log('   Token Account:', userTokenAccount.toString().slice(0, 8) + '...');
      
      // Simulate transaction processing steps
      console.log('   📊 Calculating accumulated yield...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('   📝 Creating yield claim instruction...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      console.log('   🔐 Signing transaction with wallet...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('   🌐 Broadcasting transaction to network...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock transaction signature
      const mockTxSignature = `mock_yield_claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Yield claim transaction successful!');
      console.log('   Transaction ID:', mockTxSignature);
      console.log('   Yield claimed: ~0.025 USDC (estimated)');
      
      return mockTxSignature;
    } catch (error) {
      console.error('❌ Error during yield claim:', error);
      throw error;
    }
  }

  async initiateCrossChainTransfer(
    userPublicKey: PublicKey,
    targetChain: number,
    amount: BN,
    targetAddress: string
  ): Promise<string> {
    try {
      const chainName = Object.values(SUPPORTED_CHAINS).find(chain => chain.id === targetChain)?.name || 'Unknown';
      console.log('🌉 Initiating cross-chain transfer...');
      console.log('   User:', userPublicKey.toString().slice(0, 8) + '...');
      console.log('   Target Chain:', chainName);
      console.log('   Amount:', YieldAggregatorClient.formatTokenAmount(amount), 'USDC');
      console.log('   Target Address:', targetAddress.slice(0, 10) + '...');
      
      // Simulate cross-chain transfer steps
      console.log('   🔍 Validating cross-chain parameters...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('   🌐 Creating bridge request...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('   🔐 Signing bridge transaction...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('   ⏳ Submitting to bridge protocol...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock bridge transaction signature
      const mockTxSignature = `mock_bridge_${targetChain}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Cross-chain transfer initiated successfully!');
      console.log('   Bridge Transaction ID:', mockTxSignature);
      console.log('   Estimated completion: 2-5 minutes');
      
      return mockTxSignature;
    } catch (error) {
      console.error('❌ Error during cross-chain transfer:', error);
      throw error;
    }
  }

  async getBridgeRequests(userPublicKey: PublicKey): Promise<BridgeRequest[]> {
    try {
      console.log('🌉 Fetching bridge requests...');
      
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return mock bridge requests
      const mockRequests: BridgeRequest[] = [
        {
          user: userPublicKey,
          targetChain: SUPPORTED_CHAINS.ETHEREUM.id,
          amount: new BN(300000000), // 0.3 USDC
          targetAddress: new Array(32).fill(0),
          status: 1, // Processing
          createdAt: new BN(Date.now() / 1000 - 1800), // 30 minutes ago
          completedAt: new BN(0),
          bump: 0
        },
        {
          user: userPublicKey,
          targetChain: SUPPORTED_CHAINS.POLYGON.id,
          amount: new BN(200000000), // 0.2 USDC
          targetAddress: new Array(32).fill(0),
          status: 2, // Completed
          createdAt: new BN(Date.now() / 1000 - 3600), // 1 hour ago
          completedAt: new BN(Date.now() / 1000 - 1800), // 30 minutes ago
          bump: 0
        }
      ];
      
      console.log('✅ Bridge requests loaded successfully');
      return mockRequests;
    } catch (error) {
      console.error('❌ Error fetching bridge requests:', error);
      return [];
    }
  }

  // Helper method to format BN to readable number
  static formatTokenAmount(amount: BN, decimals: number = 9): string {
    return (amount.toNumber() / Math.pow(10, decimals)).toFixed(decimals);
  }

  // Helper method to parse number to BN
  static parseTokenAmount(amount: string, decimals: number = 9): BN {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      throw new Error('Invalid amount provided');
    }
    return new BN(Math.floor(parsedAmount * Math.pow(10, decimals)));
  }

  // Helper method to get chain info by ID
  static getChainInfo(chainId: number) {
    return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
  }

  // Helper method to get all supported chains
  static getSupportedChains() {
    return Object.values(SUPPORTED_CHAINS);
  }
} 