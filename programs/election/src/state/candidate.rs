use anchor_lang::prelude::*;
use crate::CustomError;

#[account]
pub struct Candidate {
    /// The public key of the associated election (32)
    pub election: Pubkey,
    /// The number of votes candidate received (2)
    pub votes: u16,
    /// The public key of the candidate's account (32)
    pub pubkey: Pubkey,
    /// The public key of the NFT used for validation (32)
    pub nft: Pubkey,
    /// The ID of the NFT in the collection used as candidate's ID (2)
    pub id: u16,
    /// The record of the voters who voted for this candidate (4 + 1252)
    pub voters: Vec<u8>
}

impl Candidate {
    pub const LEN: usize = 8 + 32 + 2 + 32 + 32 + 2 + 4 + 1252;

    pub fn new(id: u16, pubkey: Pubkey, nft: Pubkey, election: Pubkey) -> Self {
        let votes = 0;
        let mut voters = Vec::new();

        for _i in 0..1252 {
            voters.push(0);
        }

        Self { election, votes, pubkey, nft, id, voters }
    }

    pub fn increase_vote(&mut self) {
        self.votes += 1;
    }

    pub fn record_voter(&mut self, nft_index: usize, nft_pos: usize) -> Result<()> {
        let current_votes = self.voters[nft_index];
        let mut current_votes_string = format!("{:08b}",current_votes);

        require_eq!(
            &current_votes_string[nft_pos .. nft_pos + 1],
            "0",
            CustomError::AlreadyVoted
        );

        current_votes_string.replace_range(nft_pos .. nft_pos+1, "1");

        self.voters[nft_index] = u8::from_str_radix(&current_votes_string, 2).unwrap();

        Ok(())
    }
}