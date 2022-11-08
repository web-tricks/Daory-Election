use std::str::FromStr;
use anchor_lang::prelude::*;

use crate::state::Election;
use crate::CustomError;

#[derive(Accounts)]
#[instruction(winners:u8)]
pub struct CreateElection<'info> {
    #[account(
        init,
        payer=signer,
        space= Election::len(winners)
    )]
    pub election: Account<'info,Election>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub verified_key: UncheckedAccount<'info>,

    pub system_program: Program<'info,System>
}

pub fn create_election_handler(ctx: Context<CreateElection>,winners:u8) -> Result<()> {
    let council_key = Pubkey::from_str("3DvJWcHhtdhNLWMeBCh2Rma5chxyDWxoMmVvBFLihMZe").unwrap();
    let signer = *ctx.accounts.signer.key;

    require_keys_eq!(council_key, signer, CustomError::NoCreateAuthority);

    require!(winners > 0, CustomError::WinnerCountNotAllowed);

    let election = &mut ctx.accounts.election;
    let verified_key = *ctx.accounts.verified_key.key;

    **election = Election::new(winners,verified_key);

    Ok(())
}