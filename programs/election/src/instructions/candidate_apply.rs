use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount,Mint};

use crate::state::{Election,Candidate,Identity};
use crate::CustomError;
use crate::utils;

#[derive(Accounts)]
#[instruction(nft_id:u16)]
pub struct CandidateApply<'info> {

    #[account(
        init,
        payer=signer,
        space= Candidate::LEN,
        seeds=[
            b"candidate",
            nft_id.to_le_bytes().as_ref(),
            election.key().as_ref()
        ],
        bump
    )]
    pub candidate: Account<'info,Candidate>,

    #[account(
        init,
        payer=signer,
        space= Identity::LEN,
        seeds=[
            b"candidate",
            signer.key().as_ref(),
            election.key().as_ref()
        ],
        bump
    )]
    pub identity: Account<'info,Identity>,

    #[account(mut)]
    pub election: Account<'info,Election>,

    #[account(
        associated_token::authority = signer, 
        associated_token::mint = mint, 
        constraint = token.amount == 1 @ CustomError::SupplyNotOne
    )]
    pub token: Account<'info,TokenAccount>,

    #[account(mint::decimals = 0)]
    pub mint: Account<'info, Mint>,
    
    /// CHECK: The account is customly verified in the handler function
    pub metadata: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info,System>
}

pub fn candidate_apply_handler(ctx: Context<CandidateApply>, nft_id: u16) -> Result<()> {
    let election = &mut ctx.accounts.election;
    let candidate = &mut ctx.accounts.candidate;
    let identity = &mut ctx.accounts.identity;
    let signer = ctx.accounts.signer.key;
    let mint_key = &ctx.accounts.mint.key();
    let metadata = &ctx.accounts.metadata;

    let clock = Clock::get()?;
    let current_unix = clock.unix_timestamp;

    require_gte!(current_unix, election.created_ts, CustomError::ApplicationIsClosed);
    require_gt!(election.voting_ts, current_unix , CustomError::ApplicationIsClosed);

    let nft_num = utils::validate_metadata_account(
        mint_key,
        metadata,
        &election.verified_key
    )?;

    // Asserts whether the nft ID provided by the user matches with the metadata
    assert_eq!(nft_id,nft_num);
    
    election.increase_candidate();

    **candidate = Candidate::new(
        nft_id, 
        *signer, 
        *mint_key,
        election.key()
    );

    **identity = Identity::new(nft_id);

    Ok(())
}