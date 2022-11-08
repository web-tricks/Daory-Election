use anchor_lang::prelude::*;

#[account]
pub struct Identity {
    /// The id of the NFT used for the application (2)
    pub id: u16,
}

impl Identity {
    pub const LEN: usize = 8 + 2;

    pub fn new(id: u16) -> Self {
        Self { id }
    }
}