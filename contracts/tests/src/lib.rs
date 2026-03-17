#[cfg(test)]
mod detask {
    use std::ops::Div;
    use std::str::FromStr;
    use std::{ops::Mul, rc::Rc};

    use anchor_client::{
        solana_sdk::{
            commitment_config::CommitmentConfig,
            native_token::LAMPORTS_PER_SOL,
            pubkey::Pubkey,
            signature::{read_keypair_file, Keypair},
            signer::Signer,
            system_instruction, system_program,
        },
        Client, Cluster, Program,
    };
    use anchor_spl::{associated_token::get_associated_token_address, mint};
    use detask::{AUTHORITY_SEED, CONFIG_ACCOUNT_SEED, JOB_ACCOUNT_SEED, MAX_FEE_BASIS_POINTS};

    // Helper struct to hold common test context
    struct TestContext {
        program_id: Pubkey,
        payer: Rc<Keypair>,
        program: Program<Rc<Keypair>>,
    }

    // Setup function to initialize the test context
    fn setup() -> TestContext {
        let program_id_str = "BDJWKRy4VwD2N884DC8tfCYt8iZT2Du6nAmj5cXxgjwU";
        let anchor_wallet = std::env::var("ANCHOR_WALLET").unwrap();
        let payer = Rc::new(read_keypair_file(&anchor_wallet).unwrap());

        let client = Client::new_with_options(
            Cluster::Localnet,
            payer.clone(),
            CommitmentConfig::confirmed(),
        );
        let program_id = Pubkey::from_str(program_id_str).unwrap();
        let program = client.program(program_id).unwrap();

        TestContext {
            program_id,
            payer,
            program,
        }
    }

    // Helper functions to get accounts for each instruction
    fn get_config_pda(program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[CONFIG_ACCOUNT_SEED], program_id)
    }

    fn get_authority_pda(program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[AUTHORITY_SEED], program_id)
    }

    fn get_job_pda(program_id: &Pubkey, job_id: u64) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[JOB_ACCOUNT_SEED, job_id.to_le_bytes().as_ref()],
            program_id,
        )
    }

    fn get_initialize_accounts(ctx: &TestContext) -> detask::accounts::Initialize {
        detask::accounts::Initialize {
            config: get_config_pda(&ctx.program_id).0,
            authority: get_authority_pda(&ctx.program_id).0,
            owner: ctx.payer.pubkey(),
            system_program: system_program::ID,
        }
    }

    fn get_deposit_accounts(
        ctx: &TestContext,
        job_id: u64,
        provider: &Pubkey,
    ) -> detask::accounts::Deposit {
        detask::accounts::Deposit {
            config: get_config_pda(&ctx.program_id).0,
            client: ctx.payer.pubkey(),
            job: get_job_pda(&ctx.program_id, job_id).0,
            provider: *provider,
            asset: mint::USDC,
            client_token_account: get_associated_token_address(&ctx.payer.pubkey(), &mint::USDC),
            program_token_account: get_associated_token_address(
                &get_authority_pda(&ctx.program_id).0,
                &mint::USDC,
            ),
            authority: get_authority_pda(&ctx.program_id).0,
            token_program: anchor_spl::token::ID,
            associated_token_program: anchor_spl::associated_token::ID,
            system_program: system_program::ID,
        }
    }

    fn get_release_by_client_accounts(
        ctx: &TestContext,
        job_id: u64,
        provider: &Pubkey,
    ) -> detask::accounts::ReleaseByClient {
        detask::accounts::ReleaseByClient {
            config: get_config_pda(&ctx.program_id).0,
            client: ctx.payer.pubkey(),
            job: get_job_pda(&ctx.program_id, job_id).0,
            provider: *provider,
            developer: ctx.payer.pubkey(),
            asset: mint::USDC,
            provider_token_account: get_associated_token_address(provider, &mint::USDC),
            developer_token_account: get_associated_token_address(&ctx.payer.pubkey(), &mint::USDC),
            program_token_account: get_associated_token_address(
                &get_authority_pda(&ctx.program_id).0,
                &mint::USDC,
            ),
            authority: get_authority_pda(&ctx.program_id).0,
            token_program: anchor_spl::token::ID,
            associated_token_program: anchor_spl::associated_token::ID,
            system_program: system_program::ID,
        }
    }

    fn get_release_by_provider_accounts(
        ctx: &TestContext,
        job_id: u64,
        client: &Pubkey,
        provider: &Pubkey,
    ) -> detask::accounts::ReleaseByProvider {
        detask::accounts::ReleaseByProvider {
            config: get_config_pda(&ctx.program_id).0,
            provider: *provider,
            job: get_job_pda(&ctx.program_id, job_id).0,
            client: *client,
            asset: mint::USDC,
            client_token_account: get_associated_token_address(client, &mint::USDC),
            program_token_account: get_associated_token_address(
                &get_authority_pda(&ctx.program_id).0,
                &mint::USDC,
            ),
            authority: get_authority_pda(&ctx.program_id).0,
            token_program: anchor_spl::token::ID,
        }
    }

    fn get_release_by_admin_accounts(
        ctx: &TestContext,
        job_id: u64,
        client: &Pubkey,
        provider: &Pubkey,
    ) -> detask::accounts::ReleaseByAdmin {
        detask::accounts::ReleaseByAdmin {
            config: get_config_pda(&ctx.program_id).0,
            admin: ctx.payer.pubkey(),
            job: get_job_pda(&ctx.program_id, job_id).0,
            client: *client,
            provider: *provider,
            developer: ctx.payer.pubkey(),
            asset: mint::USDC,
            client_token_account: get_associated_token_address(client, &mint::USDC),
            provider_token_account: get_associated_token_address(provider, &mint::USDC),
            developer_token_account: get_associated_token_address(&ctx.payer.pubkey(), &mint::USDC),
            program_token_account: get_associated_token_address(
                &get_authority_pda(&ctx.program_id).0,
                &mint::USDC,
            ),
            authority: get_authority_pda(&ctx.program_id).0,
            token_program: anchor_spl::token::ID,
        }
    }

    fn get_request_new_owner_accounts(
        ctx: &TestContext,
        admin: &Pubkey,
    ) -> detask::accounts::RequestNewOwner {
        detask::accounts::RequestNewOwner {
            config: get_config_pda(&ctx.program_id).0,
            admin: *admin,
        }
    }

    fn get_cancel_new_owner_accounts(ctx: &TestContext) -> detask::accounts::CancelNewOwner {
        detask::accounts::CancelNewOwner {
            config: get_config_pda(&ctx.program_id).0,
            admin: ctx.payer.pubkey(),
        }
    }

    fn get_change_owner_accounts(
        ctx: &TestContext,
        new_owner: &Pubkey,
    ) -> detask::accounts::ChangeOwner {
        detask::accounts::ChangeOwner {
            config: get_config_pda(&ctx.program_id).0,
            new_owner: *new_owner,
        }
    }

    fn get_change_default_fee_accounts(ctx: &TestContext) -> detask::accounts::SetFee {
        detask::accounts::SetFee {
            config: get_config_pda(&ctx.program_id).0,
            admin: ctx.payer.pubkey(),
        }
    }

    // Test functions
    #[test]
    fn test_01_initialize() {
        let ctx = setup();
        let tx = ctx
            .program
            .request()
            .accounts(get_initialize_accounts(&ctx))
            .args(detask::instruction::Initialize {
                developer: ctx.payer.pubkey(),
                bps: 100, // 1%
            })
            .send()
            .expect("Initialization failed");

        println!("Initialization transaction signature: {}", tx);
    }

    #[test]
    fn test_02_deposit() {
        let ctx = setup();
        let job_id = 1;
        let amount = 10_000_000_000;

        let tx = ctx
            .program
            .request()
            .accounts(get_deposit_accounts(&ctx, job_id, &ctx.payer.pubkey()))
            .args(detask::instruction::Deposit { job_id, amount })
            .send()
            .expect("Deposit SPL failed");

        println!("Deposit SPL transaction signature: {}", tx);
    }

    #[test]
    fn test_03_release_by_client() {
        let ctx = setup();
        let job_id = 1;

        let tx = ctx
            .program
            .request()
            .accounts(get_release_by_client_accounts(
                &ctx,
                job_id,
                &ctx.payer.pubkey(),
            ))
            .args(detask::instruction::ReleaseByClient { job_id })
            .send()
            .expect("Release by client failed");

        println!("Release by client transaction signature: {}", tx);
    }

    #[test]
    fn test_04_release_by_provider() {
        let ctx = setup();
        let job_id = 2;
        let amount = 10_000_000_000;

        ctx.program
            .request()
            .accounts(get_deposit_accounts(&ctx, job_id, &ctx.payer.pubkey()))
            .args(detask::instruction::Deposit { job_id, amount })
            .send()
            .expect("Deposit SPL failed");

        let tx = ctx
            .program
            .request()
            .accounts(get_release_by_provider_accounts(
                &ctx,
                job_id,
                &ctx.payer.pubkey(),
                &ctx.payer.pubkey(),
            ))
            .args(detask::instruction::ReleaseByProvider { job_id })
            .send()
            .expect("Release by provider failed");

        println!("Release by provider transaction signature: {}", tx);
    }

    #[test]
    fn test_05_release_by_admin() {
        let ctx = setup();
        let job_id = 3;
        let amount = 10_000_000_000;
        let fee = amount.mul(100u64).div(MAX_FEE_BASIS_POINTS);
        let remaining = amount - fee;
        let client_split = remaining / 2;
        let provider_split = remaining / 2;

        ctx.program
            .request()
            .accounts(get_deposit_accounts(&ctx, job_id, &ctx.payer.pubkey()))
            .args(detask::instruction::Deposit { job_id, amount })
            .send()
            .expect("Deposit SPL failed");

        let tx = ctx
            .program
            .request()
            .accounts(get_release_by_admin_accounts(
                &ctx,
                job_id,
                &ctx.payer.pubkey(),
                &ctx.payer.pubkey(),
            ))
            .args(detask::instruction::ReleaseByAdmin {
                job_id,
                client_split,
                provider_split,
            })
            .send()
            .expect("Release by admin failed");

        println!("Release by admin transaction signature: {}", tx);
    }

    #[test]
    fn test_06_request_new_owner() {
        let ctx = setup();
        let new_owner = Pubkey::new_unique();

        let tx = ctx
            .program
            .request()
            .accounts(get_request_new_owner_accounts(&ctx, &ctx.payer.pubkey()))
            .args(detask::instruction::RequestNewOwner { new_owner })
            .send()
            .expect("Request new owner failed");

        println!("Request new owner transaction signature: {}", tx);
    }

    #[test]
    fn test_07_cancel_new_owner() {
        let ctx = setup();
        let tx = ctx
            .program
            .request()
            .accounts(get_cancel_new_owner_accounts(&ctx))
            .args(detask::instruction::CancelNewOwner {})
            .send()
            .expect("Cancel new owner failed");

        println!("Cancel new owner transaction signature: {}", tx);
    }

    #[test]
    fn test_08_change_owner() {
        let ctx = setup();
        let new_owner = Rc::new(Keypair::new());

        ctx.program
            .request()
            .accounts(get_request_new_owner_accounts(&ctx, &ctx.payer.pubkey()))
            .args(detask::instruction::RequestNewOwner {
                new_owner: new_owner.pubkey(),
            })
            .send()
            .expect("Request new owner failed");

        let tx = ctx
            .program
            .request()
            .instruction(system_instruction::transfer(
                &ctx.payer.pubkey(),
                &new_owner.pubkey(),
                LAMPORTS_PER_SOL,
            ))
            .accounts(get_change_owner_accounts(&ctx, &new_owner.pubkey()))
            .args(detask::instruction::ChangeOwner {})
            .signer(new_owner.clone())
            .send()
            .expect("Change owner failed");

        println!("Change owner transaction signature: {}", tx);

        ctx.program
            .request()
            .accounts(get_request_new_owner_accounts(&ctx, &new_owner.pubkey()))
            .args(detask::instruction::RequestNewOwner {
                new_owner: ctx.payer.pubkey(),
            })
            .signer(new_owner)
            .send()
            .expect("Request new owner failed");

        ctx.program
            .request()
            .accounts(get_change_owner_accounts(&ctx, &ctx.payer.pubkey()))
            .args(detask::instruction::ChangeOwner {})
            .send()
            .expect("Change owner failed");
    }

    #[test]
    fn test_09_set_fee() {
        let ctx = setup();
        let bps = 200; // 2%

        let tx = ctx
            .program
            .request()
            .accounts(get_change_default_fee_accounts(&ctx))
            .args(detask::instruction::SetFee { bps })
            .send()
            .expect("Set fee failed");

        println!("Set fee transaction signature: {}", tx);
    }
}
