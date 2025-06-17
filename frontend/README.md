# Cross-Chain Yield Aggregator Frontend

A modern React + Tailwind CSS frontend for the Cross-Chain Yield Aggregator smart contract. This application provides a beautiful and intuitive interface for users to deposit, withdraw, and claim yield across multiple blockchain networks.

## Features

- 🔗 **Wallet Connection**: Seamless integration with Phantom and Solflare wallets
- 💰 **Deposit/Withdraw**: Easy-to-use interface for managing deposits and withdrawals
- 📈 **Yield Tracking**: Real-time display of yield rates and earned amounts
- 🎨 **Modern UI**: Beautiful, responsive design built with Tailwind CSS
- ⚡ **Real-time Updates**: Live data updates from the Solana blockchain
- 🔒 **Secure**: Built with best practices for Web3 security

## Tech Stack

- **React 19** - Modern React with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **Solana Web3.js** - Solana blockchain integration
- **Anchor Framework** - Smart contract interaction
- **Wallet Adapter** - Multi-wallet support
- **Lucide React** - Beautiful icons

## Prerequisites

- Node.js 16+ and npm/yarn
- Solana CLI tools
- A Solana wallet (Phantom, Solflare, etc.)
- The Cross-Chain Yield Aggregator smart contract deployed

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

## Usage

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the top-right corner
2. Select your preferred wallet (Phantom, Solflare, etc.)
3. Approve the connection in your wallet

### Depositing Funds

1. Ensure you have USDC tokens in your wallet
2. Enter the amount you want to deposit in the "Deposit" card
3. Click "Deposit" and approve the transaction in your wallet
4. Wait for confirmation and see your updated balance

### Withdrawing Funds

1. Enter the amount you want to withdraw in the "Withdraw" card
2. Click "Withdraw" and approve the transaction in your wallet
3. Wait for confirmation and receive your tokens

### Claiming Yield

1. Check the "Available Yield" amount in the "Claim Yield" card
2. Click "Claim Yield" and approve the transaction in your wallet
3. Receive your earned yield tokens

## Smart Contract Integration

The frontend integrates with the Cross-Chain Yield Aggregator smart contract deployed at:
```
Program ID: HeHD9gK7PC2tzxEVoL18eAz6EPLnXe7XY9CLnDCPeRiW
```

### Key Features

- **Global State**: Tracks total deposits, yield earned, and yield rates
- **User State**: Manages individual user deposits and yield claims
- **Cross-Chain Bridge**: Supports transfers between different blockchain networks
- **Oracle Integration**: Real-time yield rate updates from external sources

## Development

### Project Structure

```
src/
├── components/          # React components
│   └── Dashboard.tsx   # Main dashboard component
├── contexts/           # React contexts
│   └── WalletContext.tsx # Wallet connection context
├── utils/              # Utility functions
│   └── contract.ts     # Smart contract integration
├── idl/                # Anchor IDL files
│   └── cross_chain_yield_aggregator.ts
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

### Available Scripts

- `npm start` - Start development server
- `npm run dev` - Alias for start
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Check for build errors
- `npm run deploy` - Build and prepare for deployment

### Environment Configuration

The application is configured to use Solana Devnet by default. To change networks:

1. Update the `network` variable in `src/App.tsx`
2. Update the `endpoint` to use your preferred RPC endpoint

## Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your preferred hosting service:
   - Vercel
   - Netlify
   - AWS S3
   - GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Check the smart contract documentation
- Review the Anchor framework documentation
- Open an issue in the repository

## Security

- Always verify transaction details before signing
- Never share your private keys
- Use hardware wallets for large amounts
- Keep your wallet software updated
