use anchor_lang::prelude::*;

use crate::state::{Election,Candidate};
use crate::utils;
use crate::CustomError;

#[derive(Accounts)]
pub struct GiveVote<'info> {

    #[account(mut)]
    pub election: Account<'info, Election>,

    #[account(
        mut,
        seeds = [
            b"candidate",
            candidate.id.to_le_bytes().as_ref(),
            election.key().as_ref()
        ],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(mut)]
    pub signer: Signer<'info>,
}

pub fn give_vote_handler(ctx: Context<GiveVote>) -> Result<()> {
    let signer = ctx.accounts.signer.key;
    let election = &mut ctx.accounts.election;
    let candidate = &mut ctx.accounts.candidate;

    let clock = Clock::get()?;
    let current_unix = clock.unix_timestamp;

    require_gte!(current_unix, election.voting_ts, CustomError::VotingIsClosed);
    require_gt!(election.ended_ts, current_unix, CustomError::VotingIsClosed);

    let remaining_accounts = &mut ctx.remaining_accounts.iter();

    for _i in 0 .. remaining_accounts.len() / 2 {
        
        let token_account = next_account_info(remaining_accounts)?;
        let mint = utils::validate_token_account(token_account, signer)?;
        let metadata = next_account_info(remaining_accounts)?;

        let nft_num = utils::validate_metadata_account(
            &mint, 
            metadata, 
            &election.verified_key
        )?;

        let nft_index: usize = (nft_num / 8).try_into().unwrap();
        let nft_pos: usize = (nft_num % 8).try_into().unwrap();

        candidate.increase_vote();
        candidate.record_voter(nft_index, nft_pos)?;
        election.record_vote(candidate.id, candidate.votes);
    }

    Ok(())
}