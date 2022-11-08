use anchor_lang::prelude::*;
use anchor_spl::token::ID as SPL_ID;
use anchor_spl::token::spl_token::state::Account;
use mpl_token_metadata::utils::{assert_owned_by,assert_initialized};

use crate::CustomError;

pub fn validate_token_account(
    token_accountinfo: &AccountInfo,
    signer: &Pubkey,
) -> Result<Pubkey> {

    // Asserts whether the token account is owned by the SPL Token Program
    assert_owned_by(token_accountinfo, &SPL_ID)?;

    // Asserts whether the token account is initialized
    let token_account: Account = assert_initialized(token_accountinfo)?;

    // Asserts whether the signer has the authority of the token account
    assert_eq!(token_account.owner, *signer);

    // Verifies whether the supply of the token account is exactly 1
    require_eq!(token_account.amount, 1, CustomError::SupplyNotOne);

    let mint = token_account.mint;

    Ok(mint)
}