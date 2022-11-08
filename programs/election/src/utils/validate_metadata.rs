use anchor_lang::prelude::*;
use mpl_token_metadata::ID;
use mpl_token_metadata::state::{Metadata,TokenMetadataAccount};

use crate::CustomError;

pub fn validate_metadata_account(
    mint: &Pubkey, 
    metadata: &AccountInfo, 
    verified_key: &Pubkey
) -> Result<u16> {
    
    // Verified whether the metadata account is initialized
    require_eq!(metadata.data_is_empty(), false, CustomError::AccountNotInitialized);

    let metadata_seed = [
        b"metadata",
        ID.as_ref(),
        mint.as_ref()
    ];

    let (metadata_pda,_) = Pubkey::find_program_address(
        &metadata_seed, 
        &ID
    );

    // Assert whether the metadata key provided is equal to the one calculated using the provided mint    
    assert_eq!(*metadata.key,metadata_pda);

    let metadata_account = Metadata::from_account_info(metadata)?;
    
    if let Some (collection_details) = metadata_account.collection {
        // Verifies the certified collection details
        require_eq!(collection_details.verified, true, CustomError::CollectionNotVerified);
        require_keys_eq!(collection_details.key, *verified_key, CustomError::WrongCollectionKey);
    } else {
        return Err(CustomError::CollectionNotSet.into());
    }

    // Extracts the ID of the NFT from its name in the metadata
    let nft_name = metadata_account.data.name;
    let nft_name_trun = nft_name.replace("\x00","");

    let num: u16;

    match nft_name_trun {
        x if x.contains("Aurorian #") => num = x[10..x.len()].parse::<u16>().unwrap(),
        x if x.contains("Helios ") => num = x[7..x.len()].parse::<u16>().unwrap() + 9991,
        x if x.contains("Aurorian FTX #") => num = x[14..15].parse::<u16>().unwrap() + 10000,
        x if x.contains("TSM 2016 Aurorian") => num = 10003,
        x if x.contains("TSM FTX 2021 Aurorian") => num = 10004,
        x if x.contains("TSM FTX Skeleton") => num = 10005,
        x if x.contains("TSM FTX Aurorian") => num = 10006,
        x if x.contains("Amy") => num = 10007,
        x if x.contains("King Tristan") => num = 10008,
        _ => {
            return Err(CustomError::NFTNotFound.into())
        }
    }

    Ok(num)
}