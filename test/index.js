const {Connection,PublicKey,Keypair} = require("@solana/web3.js");
const {Program} = require("@project-serum/anchor");
const anchor = require("@project-serum/anchor");
const idl = require('../target/idl/election.json');
const secret = require('../trial.json');
const secret2 = require('../trial2.json');

const altSecret = require("../../../.config/solana/id.json");
const altSecret2 = require('../key2.json');
const altSecret3 = require('../trial3.json');
const altSecret4 = require('../trial4.json');
const altSecret5 = require('../trial5.json');
const { expect } = require("chai");

//Wallet
const keyPair = Keypair.fromSecretKey(Uint8Array.from(altSecret));
const wallet = new anchor.Wallet(keyPair);

const keyPair2 = Keypair.fromSecretKey(Uint8Array.from(altSecret2));
const wallet2 = new anchor.Wallet(keyPair2);

const keyPair3 = Keypair.fromSecretKey(Uint8Array.from(altSecret3));
const wallet3 = new anchor.Wallet(keyPair3);

const keyPair4 = Keypair.fromSecretKey(Uint8Array.from(altSecret4));
const wallet4 = new anchor.Wallet(keyPair4);

const keyPair5 = Keypair.fromSecretKey(Uint8Array.from(altSecret5));
const wallet5 = new anchor.Wallet(keyPair5);

//KeyPair
const programPair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(secret));
const programPair2 = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(secret2));


//Provider
const connection = new Connection("https://api.devnet.solana.com");
const provider = new anchor.AnchorProvider(connection,wallet,{});
anchor.setProvider(connection)

//Program
const programId = new PublicKey(idl.metadata.address);
const program = new Program(idl,programId,provider);

describe("election", () => {  
  it("Creates Election!", async () => {
    // Add your test here.
    try {
      const tx = await program.methods.createElection(2).accounts({
        election: programPair.publicKey,
        verifiedKey: new PublicKey("5gUCsuo1yjGbzN99rczpgR86HGkSjMyymDoerFgJidRt")
      }).signers([programPair]).rpc();
      console.log("Your transaction signature", tx);
    } catch(e) {
      console.log(e)
    }
    

    const account = await program.account.election.fetch(programPair.publicKey);
    console.log(account);    
  });

  it("applies as candidate", async () => {
    const id = 2356;

    const [identityPDA,_bump1] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("candidate"),
      wallet.publicKey.toBytes(),
      programPair.publicKey.toBytes()
    ],
      programId
    );

    const [candidatePDA,_bump2] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("candidate"),
      new anchor.BN(id).toArrayLike(Array,"le",2),
      programPair.publicKey.toBytes()
    ],
      programId
    );

    const token = new PublicKey("432MSsQrewpVFBKyRuBSC3esSUkcsjg259PmV6Hkpatf");
    const mint = new PublicKey("C7h4hWauEXXteLueZFRC29xSPqn9X5g4FV7JvviCHH5p");
    const metadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    const [metadata,_bump3] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode('metadata'),
      metadataProgram.toBytes(),
      mint.toBytes()
    ],
      metadataProgram
    )

    try {
      const tx = await program.methods.candidateApply(id).accounts({
        candidate: candidatePDA,
        identity: identityPDA,
        election: programPair.publicKey,
        token,
        mint,
        metadata
      }).rpc()

      console.log("tx: ",tx);

    } catch(e) {
      console.log(e)
    }


    const electionData = await program.account.election.fetch(programPair.publicKey);
    const candidateData = await program.account.candidate.fetch(candidatePDA);
    const identity = await program.account.identity.fetch(identityPDA);

    expect(candidateData.election.toBase58()).to.equal(programPair.publicKey.toBase58());
    expect(candidateData.nft.toBase58()).to.equal(mint.toBase58());
    expect(candidateData.id).to.equal(id);
    expect(identity.id).to.equal(id);
    expect(electionData.candidates).to.equal(1);

    console.log(candidateData);
  });

  it("applies as candidate 2", async () => {
    const provider2 = new anchor.AnchorProvider(connection,wallet2,{});
    const program2 = new Program(idl,programId,provider2);

    const id = 10007;

    const [identityPDA,_bump1] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("candidate"),
      wallet2.publicKey.toBytes(),
      programPair.publicKey.toBytes()
    ],
      programId
    );

    const [candidatePDA,_bump2] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("candidate"),
      new anchor.BN(id).toArrayLike(Array,"le",2),
      programPair.publicKey.toBytes()
    ],
      programId
    );

    const token = new PublicKey("9tji65AsWx7JV172eBUXBhQ6PWSUNpR2MZd4dYar2T8H");
    const mint = new PublicKey("GDFo6J9d6aEdCNqkUcnp5SPoErRNeaYdbLvKweGuwuW");
    const metadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    const [metadata,_bump3] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode('metadata'),
      metadataProgram.toBytes(),
      mint.toBytes()
    ],
      metadataProgram
    )

    try {
      const tx = await program2.methods.candidateApply(id).accounts({
        candidate: candidatePDA,
        identity: identityPDA,
        election: programPair.publicKey,
        token,
        mint,
        metadata
      }).rpc()

      console.log("tx: ",tx);
    } catch(e) {
      console.log(e)
    }


    const electionData = await program2.account.election.fetch(programPair.publicKey);
    const candidateData = await program2.account.candidate.fetch(candidatePDA);
    const identity = await program2.account.identity.fetch(identityPDA);

    expect(candidateData.election.toBase58()).to.equal(programPair.publicKey.toBase58());
    expect(candidateData.nft.toBase58()).to.equal(mint.toBase58());
    expect(candidateData.id).to.equal(id);
    expect(identity.id).to.equal(id);
    expect(electionData.candidates).to.equal(2);

    console.log(candidateData);
  });

  it("applies as candidate 3", async () => {
    const provider3 = new anchor.AnchorProvider(connection,wallet3,{});
    const program3 = new Program(idl,programId,provider3);

    const id = 5919;

    const [identityPDA,_bump1] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("candidate"),
      wallet3.publicKey.toBytes(),
      programPair.publicKey.toBytes()
    ],
      programId);

    const [candidatePDA,_bump2] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("candidate"),
      new anchor.BN(id).toArrayLike(Array,"le",2),
      programPair.publicKey.toBytes()
    ],
      programId);

    const token = new PublicKey("F1TWQoHogTm8fwbZbm5hGAwMqPZ9S1KQnUwUfFTePqWh");
    const mint = new PublicKey("8or9YA6basK5QBkBSkQsQdCp3c5mPHyNqebimtrGzmT3");
    const metadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    const [metadata,_bump3] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode('metadata'),
      metadataProgram.toBytes(),
      mint.toBytes()
    ],
      metadataProgram
    )

    try {
      const tx = await program3.methods.candidateApply(id).accounts({
        candidate: candidatePDA,
        identity: identityPDA,
        election: programPair.publicKey,
        token,
        mint,
        metadata
      }).rpc()

      console.log("tx: ",tx);

      } catch(e) {
        console.log(e)
      }


    const electionData = await program3.account.election.fetch(programPair.publicKey);
    const candidateData = await program3.account.candidate.fetch(candidatePDA);
    const identity = await program3.account.identity.fetch(identityPDA);

    expect(candidateData.election.toBase58()).to.equal(programPair.publicKey.toBase58());
    expect(candidateData.nft.toBase58()).to.equal(mint.toBase58());
    expect(candidateData.id).to.equal(id);
    expect(identity.id).to.equal(id);
    expect(electionData.candidates).to.equal(3);

    console.log(candidateData);
  });

  it("applies as candidate 4", async () => {
    const provider4 = new anchor.AnchorProvider(connection,wallet4,{});
    const program4 = new Program(idl,programId,provider4);

    const id = 10001;

    const [identityPDA,_bump1] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("candidate"),
      wallet4.publicKey.toBytes(),
      programPair.publicKey.toBytes()
    ],
      programId);

    const [candidatePDA,_bump2] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("candidate"),
      new anchor.BN(id).toArrayLike(Array,"le",2),
      programPair.publicKey.toBytes()
    ],
      programId);

    const token = new PublicKey("4hgp5gEYtaBWpSQ57f51oe8EEgq6L4GVqWZUgNiTqYHE");
    const mint = new PublicKey("2PVyno1USHdVojtP34stWXhWYhEPyVoGqtiFcupfWVN2");
    const metadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    const [metadata,_bump3] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode('metadata'),
      metadataProgram.toBytes(),
      mint.toBytes()
    ],
      metadataProgram
    )

    try {
      const tx = await program4.methods.candidateApply(id).accounts({
        candidate: candidatePDA,
        identity: identityPDA,
        election: programPair.publicKey,
        token,
        mint,
        metadata
      }).rpc()

      console.log("tx: ",tx);
    } catch(e) {
      console.log(e)
    }


    const electionData = await program4.account.election.fetch(programPair.publicKey);
    const candidateData = await program4.account.candidate.fetch(candidatePDA);
    const identity = await program4.account.identity.fetch(identityPDA);

    expect(candidateData.election.toBase58()).to.equal(programPair.publicKey.toBase58());
    expect(candidateData.nft.toBase58()).to.equal(mint.toBase58());
    expect(candidateData.id).to.equal(id);
    expect(identity.id).to.equal(id);
    expect(electionData.candidates).to.equal(4);

    console.log(candidateData);
  });

  it("applies as candidate 5", async () => {
    const provider5 = new anchor.AnchorProvider(connection,wallet5,{});
    const program5 = new Program(idl,programId,provider5);

    const id = 10005;

    const [identityPDA,_bump1] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("candidate"),
      wallet5.publicKey.toBytes(),
      programPair.publicKey.toBytes()
    ],
      programId);

    const [candidatePDA,_bump2] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("candidate"),
      new anchor.BN(id).toArrayLike(Array,"le",2),
      programPair.publicKey.toBytes()
    ],
      programId);

    const token = new PublicKey("D6m1nfeiV5A1yBJrvAVNF6D9ncM4pc7MriAbs9yCLGv8");
    const mint = new PublicKey("BfkPemfYNmCJ8oW7SEXembHoWMvb5YDPugs86YMfPNSt");
    const metadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    const [metadata,_bump3] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode('metadata'),
      metadataProgram.toBytes(),
      mint.toBytes()
    ],
      metadataProgram
    )

    try {
      const tx = await program5.methods.candidateApply(id).accounts({
        candidate: candidatePDA,
        identity: identityPDA,
        election: programPair.publicKey,
        token,
        mint,
        metadata
      }).rpc()

      } catch(e) {
        console.log(e)
      }


    const electionData = await program5.account.election.fetch(programPair.publicKey);
    const candidateData = await program5.account.candidate.fetch(candidatePDA);
    const identity = await program5.account.identity.fetch(identityPDA);

    expect(candidateData.election.toBase58()).to.equal(programPair.publicKey.toBase58());
    expect(candidateData.nft.toBase58()).to.equal(mint.toBase58());
    expect(candidateData.id).to.equal(id);
    expect(identity.id).to.equal(id);
    expect(electionData.candidates).to.equal(5);

    console.log(candidateData);
  });

  it("gives votes", async() => {

      const getCandidateKey = async(id,election) => {
        const [candidatePDA,_bump2] = await PublicKey.findProgramAddress([
          anchor.utils.bytes.utf8.encode("candidate"),
          new anchor.BN(id).toArrayLike(Array,"le",2),
          election.publicKey.toBytes()
        ],
        programId);

        return candidatePDA;
      }

      const getAllAddress = async(mintAddress,tokenAddress) => {
        const metadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

        const mintAddressG = new PublicKey(mintAddress);
        const tokenAddressG = new PublicKey(tokenAddress);
    
        let [metaAddress,_] =  await PublicKey.findProgramAddress([
          anchor.utils.bytes.utf8.encode('metadata'),
          metadataProgram.toBytes(),
          mintAddressG.toBytes()
        ],
          metadataProgram
        );
        return [tokenAddressG,metaAddress];
      }

      const [tokenAddress1,metaAddress1] = await getAllAddress('FwPU3vZ6nxZrs71himdrd36bx7Wm6AnPwLEXt3NeDJmk','82tUbnzCWNMK7Dx2mGrzMcJWKnhCYBLU7iHdmCPv4MVA');
      const [tokenAddress2,metaAddress2] = await getAllAddress('5y9iJ3yoB3QuACBXSS12Xmfud1ejJ71YCE59H2m8EFXb','5PCJ9KQvw33EgCSDkHK6WQfXUYfpxq4HwTAYxbcSpwdw');
      const [tokenAddress3,metaAddress3] = await getAllAddress('BDCMnDe1wpfATbzRdK229mJYepiRGmvgQHUrjoyv7Pee','HNkrS9cM5YxSoFTnhEbWzNgrHUtPS4LhHHju24YfZvHo');
      const [tokenAddress4,metaAddress4] = await getAllAddress('J3Wp5eJqhydwubk9TE73rVxGTwnHXxYuWcw6XVABxeif','JDGvRbVVRQtyLxxzVKvwhUDwYHkdGREyXgqKX8iyA9MK');
      const [tokenAddress5,metaAddress5] = await getAllAddress('GQ9epLNxhceBn21ux7P6EvVe48WHy8Qk3uAoJDtervvW','9AhmWNLZa1aykPBAGYCW82dNaJysTP6AtUbdDX7LF1T3');
      const [tokenAddress6,metaAddress6] = await getAllAddress('7U52bCQ4Vy3y6uxw2FQZBJ2CwhvkL4eaA1A7C2L5GkWW','EdcjWzupjvZwgiddTZCvwaLVjk6FuBMsxkU4GBPEakMy');
      const [tokenAddress7,metaAddress7] = await getAllAddress('C7h4hWauEXXteLueZFRC29xSPqn9X5g4FV7JvviCHH5p','432MSsQrewpVFBKyRuBSC3esSUkcsjg259PmV6Hkpatf');
      const [tokenAddress8,metaAddress8] = await getAllAddress('FFNZirT2y4RRVFvy9eu9kTwCpHrwB1nGkywLT2YwnuRr','HD12s22JR2W3oWUuJuweiYf1e7YeGWcCCeMr2LBdV53V');
            
      const candidate1 = await getCandidateKey(2356,programPair)
      const candidate2 = await getCandidateKey(10007,programPair)
      const candidate3 = await getCandidateKey(5919,programPair)
      const candidate4 = await getCandidateKey(10001,programPair)
      const candidate5 = await getCandidateKey(10005,programPair)

      try {
        const tx = await program.methods.giveVote()
        .accounts({
          election: programPair.publicKey,
          candidate: candidate1
        })
        .remainingAccounts([
          {pubkey: tokenAddress1, isWritable: false, isSigner: false},
          {pubkey: metaAddress1, isWritable: false, isSigner: false},
          {pubkey: tokenAddress2, isWritable: false, isSigner: false},
          {pubkey: metaAddress2, isWritable: false, isSigner: false},
          {pubkey: tokenAddress3, isWritable: false, isSigner: false},
          {pubkey: metaAddress3, isWritable: false, isSigner: false},
          {pubkey: tokenAddress4, isWritable: false, isSigner: false},
          {pubkey: metaAddress4, isWritable: false, isSigner: false},
          {pubkey: tokenAddress5, isWritable: false, isSigner: false},
          {pubkey: metaAddress5, isWritable: false, isSigner: false},
          {pubkey: tokenAddress6, isWritable: false, isSigner: false},
          {pubkey: metaAddress6, isWritable: false, isSigner: false},
          {pubkey: tokenAddress7, isWritable: false, isSigner: false},
          {pubkey: metaAddress7, isWritable: false, isSigner: false},
          {pubkey: tokenAddress8, isWritable: false, isSigner: false},
          {pubkey: metaAddress8, isWritable: false, isSigner: false},
        ]).rpc()

        console.log("tx: ",tx);
      } catch(e) {
        console.log(e)
      }

      const candidateData = await program.account.candidate.fetch(candidate1);
      const electionData = await program.account.election.fetch(programPair.publicKey);

      expect(candidateData.votes).to.equal(8);
      expect(electionData.winnersId[0]).to.equal(2356);
      expect(electionData.winnersVotes[0]).to.equal(8);

      console.log(candidateData);
  });
});