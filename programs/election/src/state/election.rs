use anchor_lang::prelude::*;

#[account]
pub struct Election {
    /// The number of the candidates applied for the election (2)
    pub candidates: u16,
    /// The number of winners to be chosen (1)
    pub winners_count: u8,
    /// The ID of the winners (4 + 2 * winners_count)
    pub winners_id: Vec<u16>,
    /// The votes of the winners (4+ 2 * winners_count)
    pub winners_votes: Vec<u16>,
    /// The unix timestamp of when the account was created (8)
    pub created_ts: i64,
    /// The unix timestamp of when the voting started (8)
    pub voting_ts: i64,
    /// The unix timestamp of when the election ended (8)
    pub ended_ts: i64,
    /// The public key of the verified collection key (32)
    pub verified_key: Pubkey
}

impl Election {
    pub fn len(winners_count: u8) -> usize {
        8 + 2 + 1 + (8 + winners_count as usize * 4) + 8 + 8 + 8 + 32
    }

    pub fn new(winners_count: u8, verified_key: Pubkey) -> Self {
        let clock = Clock::get().unwrap();
        let created_ts = clock.unix_timestamp;
        let voting_ts = created_ts + 604800_i64;
        let ended_ts = voting_ts + 604800_i64;

        Self { 
            candidates: 0, 
            winners_count, 
            winners_id: Vec::new(),
            winners_votes: Vec::new(), 
            created_ts,
            voting_ts,
            ended_ts,
            verified_key
        }
    }

    pub fn increase_candidate(&mut self) {
        self.candidates += 1;
    }

    pub fn record_vote(&mut self,id: u16,votes: u16) {
        if !self.winners_id.contains(&id) {
            if self.winners_id.len() < self.winners_count as usize {
                self.winners_id.push(id);
                self.winners_votes.push(votes);            
            } else {
                let current_last_leader_votes = self.winners_votes.last().unwrap();
                let last_spot = (self.winners_count - 1) as usize;

                if votes > *current_last_leader_votes {
                    self.winners_id[last_spot] = id;
                    self.winners_votes[last_spot] = votes;
                } else {
                    return;
                }
            }
        } else {
            let index = self.winners_id.iter().position(|&r| r == id).unwrap();
            self.winners_votes[index] += 1;
        }
        
        //sorting votes in the descending order if winners' votes are changed
        let mut j = self.winners_id.iter().position(|&r| r == id).unwrap();

        while j > 0 && self.winners_votes[j] > self.winners_votes[j-1] {

            let vote_holder = self.winners_votes[j-1];
            let id_holder = self.winners_id[j-1];

            self.winners_votes[j-1] = self.winners_votes[j];
            self.winners_votes[j] = vote_holder;

            self.winners_id[j-1] = self.winners_id[j];
            self.winners_id[j] = id_holder;

            j -= 1;
        }
    }
}
