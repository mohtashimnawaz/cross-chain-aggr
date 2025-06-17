use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("HeHD9gK7PC2tzxEVoL18eAz6EPLnXe7XY9CLnDCPeRiW");

#[program]
pub mod cross_chain_yield_aggregator {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.authority = ctx.accounts.authority.key();
        global_state.total_deposits = 0;
        global_state.total_yield_earned = 0;
        global_state.is_initialized = true;
        global_state.bump = ctx.bumps.global_state;
        
        msg!("Cross-chain yield aggregator initialized");
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        let global_state = &mut ctx.accounts.global_state;
        
        // Transfer tokens from user to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Update user state
        user_state.user = ctx.accounts.user.key();
        user_state.deposited_amount += amount;
        user_state.last_deposit_timestamp = Clock::get()?.unix_timestamp;
        user_state.bump = ctx.bumps.user_state;

        // Update global state
        global_state.total_deposits += amount;

        msg!("Deposited {} tokens", amount);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let bump = ctx.accounts.global_state.bump;
        let global_state_info = ctx.accounts.global_state.to_account_info().clone();
        let seeds: &[&[u8]] = &[b"global_state", &[bump]];
        let signer = &[seeds];

        {
            let user_state = &mut ctx.accounts.user_state;
            require!(
                user_state.deposited_amount >= amount,
                ErrorCode::InsufficientBalance
            );
            // Update user state
            user_state.deposited_amount -= amount;
            user_state.last_withdrawal_timestamp = Clock::get()?.unix_timestamp;
        }
        {
            let global_state = &mut ctx.accounts.global_state;
            // Update global state
            global_state.total_deposits -= amount;
        }

        // Transfer tokens from vault to user
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: global_state_info,
            },
            signer,
        );
        token::transfer(transfer_ctx, amount)?;

        msg!("Withdrew {} tokens", amount);
        Ok(())
    }

    pub fn update_yield_data(
        ctx: Context<UpdateYieldData>,
        solana_yield: u64,
        ethereum_yield: u64,
        polygon_yield: u64,
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        
        require!(
            ctx.accounts.authority.key() == global_state.authority,
            ErrorCode::Unauthorized
        );

        global_state.solana_yield_rate = solana_yield;
        global_state.ethereum_yield_rate = ethereum_yield;
        global_state.polygon_yield_rate = polygon_yield;
        global_state.last_yield_update = Clock::get()?.unix_timestamp;

        msg!("Yield data updated - Solana: {}, Ethereum: {}, Polygon: {}", 
             solana_yield, ethereum_yield, polygon_yield);
        Ok(())
    }

    pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
        let bump = ctx.accounts.global_state.bump;
        let global_state_info = ctx.accounts.global_state.to_account_info().clone();
        let seeds: &[&[u8]] = &[b"global_state", &[bump]];
        let signer = &[seeds];

        let (yield_earned, current_time) = {
            let user_state = &mut ctx.accounts.user_state;
            let global_state = &ctx.accounts.global_state;
            let current_time = Clock::get()?.unix_timestamp;
            let time_delta = current_time - user_state.last_yield_claim;
            // Calculate yield based on deposited amount and time
            let yield_earned = calculate_yield(
                user_state.deposited_amount,
                time_delta,
                global_state.solana_yield_rate,
            );
            require!(yield_earned > 0, ErrorCode::NoYieldToClaim);
            (yield_earned, current_time)
        };

        // Transfer yield tokens from vault to user
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: global_state_info,
            },
            signer,
        );
        token::transfer(transfer_ctx, yield_earned)?;

        {
            let user_state = &mut ctx.accounts.user_state;
            user_state.total_yield_claimed += yield_earned;
            user_state.last_yield_claim = current_time;
        }
        {
            let global_state = &mut ctx.accounts.global_state;
            global_state.total_yield_earned += yield_earned;
        }

        msg!("Claimed {} yield tokens", yield_earned);
        Ok(())
    }

    pub fn set_authority(ctx: Context<SetAuthority>, new_authority: Pubkey) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        
        require!(
            ctx.accounts.authority.key() == global_state.authority,
            ErrorCode::Unauthorized
        );

        global_state.authority = new_authority;
        msg!("Authority updated to: {}", new_authority);
        Ok(())
    }

    // Cross-chain bridge integration
    pub fn initiate_cross_chain_transfer(
        ctx: Context<InitiateCrossChainTransfer>,
        target_chain: u8,
        amount: u64,
        target_address: [u8; 32],
    ) -> Result<()> {
        let bridge_request = &mut ctx.accounts.bridge_request;
        let user_state = &mut ctx.accounts.user_state;
        let global_state = &mut ctx.accounts.global_state;

        require!(
            user_state.deposited_amount >= amount,
            ErrorCode::InsufficientBalance
        );

        // Create bridge request
        bridge_request.user = ctx.accounts.user.key();
        bridge_request.target_chain = target_chain;
        bridge_request.amount = amount;
        bridge_request.target_address = target_address;
        bridge_request.status = BridgeStatus::Pending as u8;
        bridge_request.created_at = Clock::get()?.unix_timestamp;
        bridge_request.bump = ctx.bumps.bridge_request;

        // Update user state
        user_state.deposited_amount -= amount;
        user_state.pending_cross_chain_transfers += amount;

        // Update global state
        global_state.total_deposits -= amount;
        global_state.pending_cross_chain_amount += amount;

        msg!("Cross-chain transfer initiated: {} tokens to chain {}", amount, target_chain);
        Ok(())
    }

    pub fn complete_cross_chain_transfer(
        ctx: Context<CompleteCrossChainTransfer>,
        bridge_request_id: u64,
        success: bool,
    ) -> Result<()> {
        let bridge_request = &mut ctx.accounts.bridge_request;
        let user_state = &mut ctx.accounts.user_state;
        let global_state = &mut ctx.accounts.global_state;

        require!(
            ctx.accounts.authority.key() == global_state.authority,
            ErrorCode::Unauthorized
        );

        if success {
            bridge_request.status = BridgeStatus::Completed as u8;
            // Update user state - transfer completed successfully
            user_state.pending_cross_chain_transfers -= bridge_request.amount;
            user_state.cross_chain_deposits += bridge_request.amount;
        } else {
            bridge_request.status = BridgeStatus::Failed as u8;
            // Refund user - transfer failed
            user_state.pending_cross_chain_transfers -= bridge_request.amount;
            user_state.deposited_amount += bridge_request.amount;
        }

        bridge_request.completed_at = Clock::get()?.unix_timestamp;

        // Update global state
        global_state.pending_cross_chain_amount -= bridge_request.amount;
        if success {
            global_state.total_cross_chain_deposits += bridge_request.amount;
        } else {
            global_state.total_deposits += bridge_request.amount;
        }

        msg!("Cross-chain transfer {}: {}", 
             if success { "completed" } else { "failed" }, bridge_request_id);
        Ok(())
    }

    // Oracle integration for real-time yield data
    pub fn update_oracle_data(
        ctx: Context<UpdateOracleData>,
        oracle_data: OracleData,
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        
        require!(
            ctx.accounts.authority.key() == global_state.authority,
            ErrorCode::Unauthorized
        );

        global_state.oracle_data = oracle_data.clone();
        global_state.last_oracle_update = Clock::get()?.unix_timestamp;

        msg!("Oracle data updated from chain: {}", oracle_data.source_chain);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 1 + 8 + 8 + 1 + 10*8 + 8 + 10*8 + 8, // 8 (discriminator) + 32 (authority) + 8 (total_deposits) + 8 (total_yield_earned) + 8 (solana_yield_rate) + 8 (ethereum_yield_rate) + 8 (polygon_yield_rate) + 8 (last_yield_update) + 1 (is_initialized) + 1 (bump) + 8 (pending_cross_chain_amount) + 8 (total_cross_chain_deposits) + 1 (oracle_data.source_chain) + 8 (oracle_data.timestamp) + 10*8 (oracle_data.yield_rates) + 8 (oracle_data.total_value_locked) + 10*8 (oracle_data.apy_data) + 8 (last_oracle_update)
        seeds = [b"global_state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 8 + 8, // 8 (discriminator) + 32 (user) + 8 (deposited_amount) + 8 (total_yield_claimed) + 8 (last_deposit_timestamp) + 8 (last_withdrawal_timestamp) + 8 (last_yield_claim) + 1 (bump) + 8 (pending_cross_chain_transfers) + 8 (cross_chain_deposits)
        seeds = [b"user_state", user.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,
    
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"user_state", user.key().as_ref()],
        bump = user_state.bump
    )]
    pub user_state: Account<'info, UserState>,
    
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateYieldData<'info> {
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimYield<'info> {
    #[account(
        mut,
        seeds = [b"user_state", user.key().as_ref()],
        bump = user_state.bump
    )]
    pub user_state: Account<'info, UserState>,
    
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SetAuthority<'info> {
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitiateCrossChainTransfer<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 1 + 8 + 32 + 1 + 8 + 8 + 1, // 8 (discriminator) + 32 (user) + 1 (target_chain) + 8 (amount) + 32 (target_address) + 1 (status) + 8 (created_at) + 8 (completed_at) + 1 (bump)
        seeds = [b"bridge_request", user.key().as_ref()],
        bump
    )]
    pub bridge_request: Account<'info, BridgeRequest>,
    
    #[account(
        mut,
        seeds = [b"user_state", user.key().as_ref()],
        bump = user_state.bump
    )]
    pub user_state: Account<'info, UserState>,
    
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteCrossChainTransfer<'info> {
    #[account(
        mut,
        seeds = [b"bridge_request", bridge_request.user.as_ref(), &[bridge_request.bump]],
        bump = bridge_request.bump
    )]
    pub bridge_request: Account<'info, BridgeRequest>,
    
    #[account(
        mut,
        seeds = [b"user_state", bridge_request.user.as_ref()],
        bump = user_state.bump
    )]
    pub user_state: Account<'info, UserState>,
    
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateOracleData<'info> {
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub total_deposits: u64,
    pub total_yield_earned: u64,
    pub solana_yield_rate: u64,    // APY in basis points (1% = 100)
    pub ethereum_yield_rate: u64,  // APY in basis points
    pub polygon_yield_rate: u64,   // APY in basis points
    pub last_yield_update: i64,
    pub is_initialized: bool,
    pub bump: u8,
    // Cross-chain bridge fields
    pub pending_cross_chain_amount: u64,
    pub total_cross_chain_deposits: u64,
    // Oracle integration
    pub oracle_data: OracleData,
    pub last_oracle_update: i64,
}

#[account]
pub struct UserState {
    pub user: Pubkey,
    pub deposited_amount: u64,
    pub total_yield_claimed: u64,
    pub last_deposit_timestamp: i64,
    pub last_withdrawal_timestamp: i64,
    pub last_yield_claim: i64,
    pub bump: u8,
    // Cross-chain bridge fields
    pub pending_cross_chain_transfers: u64,
    pub cross_chain_deposits: u64,
}

#[account]
pub struct BridgeRequest {
    pub user: Pubkey,
    pub target_chain: u8,  // 1=Solana, 2=Ethereum, 3=Polygon, etc.
    pub amount: u64,
    pub target_address: [u8; 32],
    pub status: u8,  // BridgeStatus enum
    pub created_at: i64,
    pub completed_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct OracleData {
    pub source_chain: u8,
    pub timestamp: i64,
    pub yield_rates: [u64; 10],  // Support up to 10 chains
    pub total_value_locked: u64,
    pub apy_data: [u64; 10],     // APY data for each chain
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient balance for withdrawal")]
    InsufficientBalance,
    #[msg("No yield available to claim")]
    NoYieldToClaim,
    #[msg("Unauthorized operation")]
    Unauthorized,
    #[msg("Invalid bridge request")]
    InvalidBridgeRequest,
    #[msg("Cross-chain transfer failed")]
    CrossChainTransferFailed,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum BridgeStatus {
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
}

// Helper function to calculate yield
fn calculate_yield(deposited_amount: u64, time_delta: i64, yield_rate: u64) -> u64 {
    if deposited_amount == 0 || time_delta <= 0 || yield_rate == 0 {
        return 0;
    }
    
    // Convert yield rate from basis points to decimal (e.g., 500 = 5%)
    let yield_decimal = yield_rate as f64 / 10000.0;
    
    // Calculate yield: deposited_amount * yield_rate * time_delta / (365 * 24 * 3600)
    let seconds_per_year = 365 * 24 * 3600;
    let yield_amount = (deposited_amount as f64 * yield_decimal * time_delta as f64) / seconds_per_year as f64;
    
    yield_amount as u64
}
