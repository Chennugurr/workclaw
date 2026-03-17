use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    mint,
    token::{Mint, Token, TokenAccount},
    token_interface::TokenInterface,
};

declare_id!("BDJWKRy4VwD2N884DC8tfCYt8iZT2Du6nAmj5cXxgjwU");

pub const MAX_FEE_BASIS_POINTS: u64 = 10_000; // 100%
pub const CONFIG_ACCOUNT_SEED: &[u8] = b"config";
pub const AUTHORITY_SEED: &[u8] = b"authority";
pub const JOB_ACCOUNT_SEED: &[u8] = b"job";

#[program]
pub mod detask {
    use anchor_spl::token;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, developer: Pubkey, bps: u16) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.owner = ctx.accounts.owner.key();
        config.pending_owner = Pubkey::default();
        config.authority = ctx.accounts.authority.key();
        config.authority_bump = ctx.bumps.authority;
        config.developer = developer;
        config.fee = Fee { bps };
        config.jobs = 0;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, job_id: u64, amount: u64) -> Result<()> {
        let config = &mut ctx.accounts.config;
        let job = &mut ctx.accounts.job;

        require!(job.id == 0, ErrorCode::JobExists);
        require!(amount > 0, ErrorCode::InvalidValue);
        require!(
            ctx.accounts.asset.key() == mint::USDC,
            ErrorCode::InvalidAsset
        );

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.client_token_account.to_account_info(),
                    to: ctx.accounts.program_token_account.to_account_info(),
                    authority: ctx.accounts.client.to_account_info(),
                },
            ),
            amount,
        )?;

        job.id = job_id;
        job.client = ctx.accounts.client.key();
        job.provider = ctx.accounts.provider.key();
        job.asset = ctx.accounts.asset.key();
        job.amount = amount;

        config.jobs += 1;

        emit!(DepositEvent {
            client: job.client,
            provider: job.provider,
            job_id: job.id,
            amount,
        });

        Ok(())
    }

    pub fn release_by_client(ctx: Context<ReleaseByClient>, job_id: u64) -> Result<()> {
        let config = &mut ctx.accounts.config;
        let job = &mut ctx.accounts.job;

        require!(job.id == job_id, ErrorCode::JobNotFound);
        require!(
            job.client == ctx.accounts.client.key(),
            ErrorCode::Unauthorized
        );
        require!(!job.released, ErrorCode::JobReleased);

        job.released = true;

        let amount = job.amount;
        let fee = config.fee;
        let fee_amount = (amount as u128)
            .checked_mul(fee.bps as u128)
            .ok_or(ErrorCode::InvalidFeeCalculation)?
            .checked_div(MAX_FEE_BASIS_POINTS as u128)
            .ok_or(ErrorCode::InvalidFeeCalculation)? as u64;

        let final_release = amount
            .checked_sub(fee_amount)
            .ok_or(ErrorCode::InvalidFeeCalculation)?;

        let signer: &[&[&[u8]]] = &[&[AUTHORITY_SEED, &[config.authority_bump]]];

        // Transfer fee to developer
        if fee_amount > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    token::Transfer {
                        from: ctx.accounts.program_token_account.to_account_info(),
                        to: ctx.accounts.developer_token_account.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                    signer,
                ),
                fee_amount,
            )?;
        }

        // Transfer remaining to provider
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.program_token_account.to_account_info(),
                    to: ctx.accounts.provider_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                signer,
            ),
            final_release,
        )?;

        emit!(ReleaseEvent {
            client: job.client,
            provider: job.provider,
            recipient: job.provider,
            job_id: job.id,
            amount: final_release,
        });

        Ok(())
    }

    pub fn release_by_provider(ctx: Context<ReleaseByProvider>, job_id: u64) -> Result<()> {
        let config = &mut ctx.accounts.config;
        let job = &mut ctx.accounts.job;

        require!(job.id == job_id, ErrorCode::JobNotFound);
        require!(
            job.provider == ctx.accounts.provider.key(),
            ErrorCode::Unauthorized
        );
        require!(!job.released, ErrorCode::JobReleased);

        job.released = true;

        let amount = job.amount;

        let signer: &[&[&[u8]]] = &[&[AUTHORITY_SEED, &[config.authority_bump]]];

        // Transfer full amount to client with no fee
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.program_token_account.to_account_info(),
                    to: ctx.accounts.client_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        emit!(ReleaseEvent {
            client: job.client,
            provider: job.provider,
            recipient: job.client,
            job_id: job.id,
            amount,
        });

        Ok(())
    }

    pub fn release_by_admin(
        ctx: Context<ReleaseByAdmin>,
        job_id: u64,
        client_split: u64,
        provider_split: u64,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        let job = &mut ctx.accounts.job;

        require!(job.id == job_id, ErrorCode::JobNotFound);
        require!(
            ctx.accounts.admin.key() == config.owner,
            ErrorCode::Unauthorized
        );
        require!(!job.released, ErrorCode::JobReleased);

        job.released = true;

        let amount = job.amount;
        let fee = config.fee;
        let fee_amount = (amount as u128)
            .checked_mul(fee.bps as u128)
            .ok_or(ErrorCode::InvalidFeeCalculation)?
            .checked_div(MAX_FEE_BASIS_POINTS as u128)
            .ok_or(ErrorCode::InvalidFeeCalculation)? as u64;

        let remaining = amount
            .checked_sub(fee_amount)
            .ok_or(ErrorCode::InvalidFeeCalculation)?;

        let total_split = client_split + provider_split;
        require!(total_split == remaining, ErrorCode::InvalidSplit);

        let signer: &[&[&[u8]]] = &[&[AUTHORITY_SEED, &[config.authority_bump]]];

        if fee_amount > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    token::Transfer {
                        from: ctx.accounts.program_token_account.to_account_info(),
                        to: ctx.accounts.developer_token_account.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                    signer,
                ),
                fee_amount,
            )?;
        }

        if client_split > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    token::Transfer {
                        from: ctx.accounts.program_token_account.to_account_info(),
                        to: ctx.accounts.client_token_account.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                    signer,
                ),
                client_split,
            )?;
        }

        if provider_split > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    token::Transfer {
                        from: ctx.accounts.program_token_account.to_account_info(),
                        to: ctx.accounts.provider_token_account.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                    signer,
                ),
                provider_split,
            )?;
        }

        emit!(ReleaseEvent {
            client: job.client,
            provider: job.provider,
            recipient: job.client,
            job_id: job.id,
            amount: client_split,
        });
        emit!(ReleaseEvent {
            client: job.client,
            provider: job.provider,
            recipient: job.provider,
            job_id: job.id,
            amount: provider_split,
        });

        Ok(())
    }

    pub fn request_new_owner(ctx: Context<RequestNewOwner>, new_owner: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;

        require!(
            ctx.accounts.admin.key() == config.owner,
            ErrorCode::Unauthorized
        );
        require!(new_owner != Pubkey::default(), ErrorCode::InvalidAddress);

        config.pending_owner = new_owner;

        emit!(PendingOwnerEvent {
            old_owner: config.owner,
            new_owner,
        });

        Ok(())
    }

    pub fn cancel_new_owner(ctx: Context<CancelNewOwner>) -> Result<()> {
        let config = &mut ctx.accounts.config;

        require!(
            ctx.accounts.admin.key() == config.owner,
            ErrorCode::Unauthorized
        );

        config.pending_owner = Pubkey::default();

        emit!(PendingOwnerEvent {
            old_owner: config.owner,
            new_owner: Pubkey::default(),
        });

        Ok(())
    }

    pub fn change_owner(ctx: Context<ChangeOwner>) -> Result<()> {
        let config = &mut ctx.accounts.config;

        require!(
            config.pending_owner != Pubkey::default(),
            ErrorCode::InvalidAddress
        );
        require!(
            config.pending_owner == ctx.accounts.new_owner.key(),
            ErrorCode::Unauthorized
        );

        let old_owner = config.owner;
        config.owner = ctx.accounts.new_owner.key();
        config.pending_owner = Pubkey::default();

        emit!(ChangeOwnerEvent {
            old_owner,
            new_owner: ctx.accounts.new_owner.key(),
        });

        Ok(())
    }

    pub fn set_fee(ctx: Context<SetFee>, bps: u16) -> Result<()> {
        let config = &mut ctx.accounts.config;

        require!(
            ctx.accounts.admin.key() == config.owner,
            ErrorCode::Unauthorized
        );
        require!(bps != config.fee.bps, ErrorCode::NoFeeChange);

        let old_fee = config.fee;
        config.fee = Fee { bps };

        emit!(ChangeFeeEvent {
            old_fee,
            new_fee: config.fee,
        });

        Ok(())
    }
}

// Accounts
#[account]
#[derive(InitSpace, Copy)]
pub struct ConfigAccount {
    pub owner: Pubkey,
    pub pending_owner: Pubkey,
    pub authority: Pubkey,
    pub authority_bump: u8,
    pub developer: Pubkey,
    pub fee: Fee,
    pub jobs: u64,
    pub bump: u8,
}

#[derive(
    AnchorDeserialize, AnchorSerialize, InitSpace, Clone, Copy, Debug, Default, PartialEq, Eq,
)]
pub struct Fee {
    /// Fee in basis points (1/100th of a percent). Range: 0-10,000 (0-100%)
    pub bps: u16,
}

#[account]
#[derive(InitSpace, Copy)]
pub struct JobAccount {
    pub id: u64,
    pub client: Pubkey,
    pub provider: Pubkey,
    pub asset: Pubkey,
    pub amount: u64,
    pub released: bool,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid value")]
    InvalidValue,
    #[msg("Job ID already exists")]
    JobExists,
    #[msg("Job does not exist")]
    JobNotFound,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Job already released")]
    JobReleased,
    #[msg("Amount too high")]
    AmountTooHigh,
    #[msg("Amount too low")]
    AmountTooLow,
    #[msg("Invalid fee calculation")]
    InvalidFeeCalculation,
    #[msg("Invalid address")]
    InvalidAddress,
    #[msg("No change in fee")]
    NoFeeChange,
    #[msg("Invalid split")]
    InvalidSplit,
    #[msg("Invalid asset")]
    InvalidAsset,
}

// Context Structs
#[derive(Accounts)]
pub struct Initialize<'info> {
    /// The program's configuration account
    #[account(
        init,
        payer = owner,
        space = 8 + ConfigAccount::INIT_SPACE,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump
    )]
    pub config: Account<'info, ConfigAccount>,

    /// CHECK: Unchecked account used only to derive PDA, validated solely by its seed.
    #[account(
        seeds = [AUTHORITY_SEED],
        bump,
        constraint = authority.key() == Pubkey::find_program_address(&[AUTHORITY_SEED], __program_id).0
    )]
    pub authority: UncheckedAccount<'info>,

    /// The account that will pay for the initialization and become the owner
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The system program
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct Deposit<'info> {
    /// The program's configuration account
    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ConfigAccount>,

    /// The client who is creating and funding the job
    #[account(mut)]
    pub client: Signer<'info>,

    /// The job account to be created
    #[account(
        init_if_needed,
        payer = client,
        space = 8 + JobAccount::INIT_SPACE,
        seeds = [JOB_ACCOUNT_SEED, job_id.to_le_bytes().as_ref()],
        bump
    )]
    pub job: Account<'info, JobAccount>,

    /// CHECK: The provider account is only used to store its public key and does not require further checks.
    pub provider: UncheckedAccount<'info>,

    /// The USDC token mint
    #[account(address = mint::USDC)]
    pub asset: Account<'info, Mint>,

    /// The client's USDC token account
    #[account(
        mut,
        associated_token::mint = asset,
        associated_token::authority = client,
    )]
    pub client_token_account: Account<'info, TokenAccount>,

    /// The program's USDC token account
    #[account(
        init_if_needed,
        payer = client,
        associated_token::mint = asset,
        associated_token::authority = authority,
        associated_token::token_program = token_program
    )]
    pub program_token_account: Account<'info, TokenAccount>,

    /// CHECK: The authority is a PDA derived from the seed and bump, already validated.
    #[account(constraint = authority.key() == config.authority)]
    pub authority: UncheckedAccount<'info>,

    /// The token program
    pub token_program: Program<'info, Token>,

    /// The associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// The system program
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct ReleaseByClient<'info> {
    /// The program's configuration account
    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump = config.bump,
        has_one = developer
    )]
    pub config: Account<'info, ConfigAccount>,

    /// The client releasing the funds
    #[account(mut)]
    pub client: Signer<'info>,

    /// The job account
    #[account(
        mut,
        seeds = [JOB_ACCOUNT_SEED, job_id.to_le_bytes().as_ref()],
        bump,
        constraint = !job.released,
        has_one = client,
        has_one = provider
    )]
    pub job: Account<'info, JobAccount>,

    /// CHECK: The provider account does not require further checks.
    pub provider: UncheckedAccount<'info>,

    /// CHECK: The developer account does not require further checks.
    pub developer: UncheckedAccount<'info>,

    /// The USDC token mint
    #[account(address = mint::USDC)]
    pub asset: Account<'info, Mint>,

    /// The provider's token account
    #[account(
        init_if_needed,
        payer = client,
        associated_token::mint = asset,
        associated_token::authority = provider,
        associated_token::token_program = token_program
    )]
    pub provider_token_account: Account<'info, TokenAccount>,

    /// The developer's token account for fees
    #[account(
        init_if_needed,
        payer = client,
        associated_token::mint = asset,
        associated_token::authority = developer,
        associated_token::token_program = token_program
    )]
    pub developer_token_account: Account<'info, TokenAccount>,

    /// The program's token account
    #[account(
        mut,
        associated_token::mint = asset,
        associated_token::authority = authority
    )]
    pub program_token_account: Account<'info, TokenAccount>,

    /// CHECK: The authority is a PDA derived from the seed and bump, already validated.
    #[account(constraint = authority.key() == config.authority)]
    pub authority: UncheckedAccount<'info>,

    /// The token program
    pub token_program: Program<'info, Token>,

    /// The associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// The system program
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct ReleaseByProvider<'info> {
    /// The program's configuration account
    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ConfigAccount>,

    /// The provider initiating the refund
    #[account(mut)]
    pub provider: Signer<'info>,

    /// The job account
    #[account(
        mut,
        seeds = [JOB_ACCOUNT_SEED, job_id.to_le_bytes().as_ref()],
        bump,
        constraint = !job.released,
        has_one = client,
        has_one = provider,
    )]
    pub job: Account<'info, JobAccount>,

    /// CHECK: The client account does not require further checks.
    pub client: UncheckedAccount<'info>,

    /// The USDC token mint
    #[account(address = mint::USDC)]
    pub asset: Account<'info, Mint>,

    /// The client's token account to receive refund
    #[account(
        mut,
        associated_token::mint = asset,
        associated_token::authority = client,
    )]
    pub client_token_account: Account<'info, TokenAccount>,

    /// The program's token account
    #[account(
        mut,
        associated_token::mint = asset,
        associated_token::authority = authority
    )]
    pub program_token_account: Account<'info, TokenAccount>,

    /// CHECK: The authority is a PDA derived from the seed and bump, already validated.
    #[account(constraint = authority.key() == config.authority)]
    pub authority: UncheckedAccount<'info>,

    /// The token program interface
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
#[instruction(job_id: u64, client_split: u64, provider_split: u64)]
pub struct ReleaseByAdmin<'info> {
    /// The program's configuration account
    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump = config.bump,
        constraint = config.owner == admin.key(),
    )]
    pub config: Account<'info, ConfigAccount>,

    /// The admin (owner) releasing the funds
    #[account(mut)]
    pub admin: Signer<'info>,

    /// The job account being released
    #[account(
        mut,
        seeds = [JOB_ACCOUNT_SEED, job_id.to_le_bytes().as_ref()],
        bump,
        constraint = !job.released
    )]
    pub job: Account<'info, JobAccount>,

    /// CHECK: The client account does not require further checks.
    pub client: UncheckedAccount<'info>,

    /// CHECK: The provider account does not require further checks.
    pub provider: UncheckedAccount<'info>,

    /// CHECK: The developer account does not require further checks.
    pub developer: UncheckedAccount<'info>,

    /// The USDC token mint
    #[account(address = mint::USDC)]
    pub asset: Account<'info, Mint>,

    /// The client's token account
    #[account(
        mut,
        associated_token::mint = asset,
        associated_token::authority = client,
    )]
    pub client_token_account: Account<'info, TokenAccount>,

    /// The provider's token account
    #[account(
        mut,
        associated_token::mint = asset,
        associated_token::authority = provider,
    )]
    pub provider_token_account: Account<'info, TokenAccount>,

    /// The developer's token account for fees
    #[account(
        mut,
        associated_token::mint = asset,
        associated_token::authority = developer,
    )]
    pub developer_token_account: Account<'info, TokenAccount>,

    /// The program's token account
    #[account(
        mut,
        associated_token::mint = asset,
        associated_token::authority = authority,
    )]
    pub program_token_account: Account<'info, TokenAccount>,

    /// CHECK: The authority is a PDA derived from the seed and bump, already validated.
    #[account(constraint = authority.key() == config.authority)]
    pub authority: UncheckedAccount<'info>,

    /// The token program interface
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
#[instruction(new_owner: Pubkey)]
pub struct RequestNewOwner<'info> {
    /// The program's configuration account
    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump = config.bump,
        constraint = new_owner != Pubkey::default(),
        constraint = new_owner != config.owner
    )]
    pub config: Account<'info, ConfigAccount>,

    /// The current owner requesting ownership transfer
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelNewOwner<'info> {
    /// The program's configuration account
    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump = config.bump,
        constraint = config.pending_owner != Pubkey::default()
    )]
    pub config: Account<'info, ConfigAccount>,

    /// The current owner canceling the ownership transfer
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct ChangeOwner<'info> {
    /// The program's configuration account
    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump = config.bump,
        constraint = config.pending_owner == new_owner.key(),
        constraint = config.pending_owner != Pubkey::default()
    )]
    pub config: Account<'info, ConfigAccount>,

    /// The new owner of the program
    #[account(mut)]
    pub new_owner: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(bps: u16)]
pub struct SetFee<'info> {
    /// The program's configuration account
    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump = config.bump,
        constraint = config.owner == admin.key(),
        constraint = config.fee.bps != bps
    )]
    pub config: Account<'info, ConfigAccount>,

    /// The admin setting the new fee
    #[account(mut)]
    pub admin: Signer<'info>,
}

// Events
#[event]
pub struct DepositEvent {
    pub client: Pubkey,
    pub provider: Pubkey,
    pub job_id: u64,
    pub amount: u64,
}

#[event]
pub struct ReleaseEvent {
    pub client: Pubkey,
    pub provider: Pubkey,
    pub recipient: Pubkey,
    pub job_id: u64,
    pub amount: u64,
}

#[event]
pub struct PendingOwnerEvent {
    pub old_owner: Pubkey,
    pub new_owner: Pubkey,
}

#[event]
pub struct ChangeOwnerEvent {
    pub old_owner: Pubkey,
    pub new_owner: Pubkey,
}

#[event]
pub struct ChangeFeeEvent {
    pub old_fee: Fee,
    pub new_fee: Fee,
}
