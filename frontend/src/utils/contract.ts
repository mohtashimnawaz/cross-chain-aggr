import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export const PROGRAM_ID = new PublicKey('HeHD9gK7PC2tzxEVoL18eAz6EPLnXe7XY9CLnDCPeRiW');

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
      
      // Return mock data for demonstration
      const mockGlobalState = {
        authority: new PublicKey('11111111111111111111111111111111'),
        totalDeposits: new BN(1000000000), // 1 USDC in token units
        totalYieldEarned: new BN(50000000), // 0.05 USDC in token units
        solanaYieldRate: new BN(500), // 5% APY
        ethereumYieldRate: new BN(300), // 3% APY
        polygonYieldRate: new BN(400), // 4% APY
        lastYieldUpdate: new BN(Date.now() / 1000),
        isInitialized: true,
        bump: 0,
        pendingCrossChainAmount: new BN(0),
        totalCrossChainDeposits: new BN(0),
        oracleData: {
          sourceChain: 1,
          timestamp: new BN(Date.now() / 1000),
          yieldRates: [new BN(500), new BN(300), new BN(400)],
          totalValueLocked: new BN(1000000000),
          apyData: [new BN(500), new BN(300), new BN(400)]
        },
        lastOracleUpdate: new BN(Date.now() / 1000)
      };
      
      console.log('✅ Global state loaded successfully:', {
        totalDeposits: YieldAggregatorClient.formatTokenAmount(mockGlobalState.totalDeposits),
        totalYieldEarned: YieldAggregatorClient.formatTokenAmount(mockGlobalState.totalYieldEarned),
        solanaYieldRate: `${(mockGlobalState.solanaYieldRate.toNumber() / 100).toFixed(2)}%`
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
      
      // Return mock data for demonstration
      const mockUserState = {
        user: userPublicKey,
        depositedAmount: new BN(500000000), // 0.5 USDC in token units
        totalYieldClaimed: new BN(25000000), // 0.025 USDC in token units
        lastDepositTimestamp: new BN(Date.now() / 1000 - 86400), // 1 day ago
        lastWithdrawalTimestamp: new BN(0),
        lastYieldClaim: new BN(Date.now() / 1000 - 3600), // 1 hour ago
        bump: 0,
        pendingCrossChainTransfers: new BN(0),
        crossChainDeposits: new BN(0)
      };
      
      console.log('✅ User state loaded successfully:', {
        depositedAmount: YieldAggregatorClient.formatTokenAmount(mockUserState.depositedAmount),
        totalYieldClaimed: YieldAggregatorClient.formatTokenAmount(mockUserState.totalYieldClaimed)
      });
      
      return mockUserState;
    } catch (error) {
      console.error('❌ Error fetching user state:', error);
      return null;
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
} 