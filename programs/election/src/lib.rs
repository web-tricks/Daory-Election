use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod utils;

use instructions::*;

declare_id!("EMh4zLtsitGMJ7wxJdY4xFkDqJHiTor91chN5nmB9JLB");

#[program]
pub mod election {
    use super::*;

    pub fn create_election(ctx: Context<CreateElection>,winners:u8) -> Result<()> {
        instructions::create_election_handler(ctx, winners)
    }

    pub fn candidate_apply(ctx: Context<CandidateApply>,nft_id: u16) -> Result<()> {
        instructions::candidate_apply_handler(ctx,nft_id)
    }

    pub fn give_vote(ctx: Context<GiveVote>) -> Result<()> {
        instructions::give_vote_handler(ctx)
    }
}

#[error_code]
pub enum CustomError {
    #[msg("The signer does not have the authority to create elections")]
    NoCreateAuthority,

    #[msg("The number of winners should be between 1 to 255")]
    WinnerCountNotAllowed,

    #[msg("The supply of the token should be equal to 1")]
    SupplyNotOne,

    #[msg("The election is not in the application stage")]
    ApplicationIsClosed,

    #[msg("The provided account is not initialized")]
    AccountNotInitialized,

    #[msg("The Collection field is not set in the metadata")]
    CollectionNotSet,

    #[msg("The Certified Collection field is not verified")]
    CollectionNotVerified,

    #[msg("The NFT does not belong to the correct collection")]
    WrongCollectionKey,

    #[msg("Cannot find an NFT with the given details")]
    NFTNotFound,

    #[msg("The election is not in the voting stage")]
    VotingIsClosed,

    #[msg("The NFT used for the voting has already voted for the candidate")]
    AlreadyVoted
}