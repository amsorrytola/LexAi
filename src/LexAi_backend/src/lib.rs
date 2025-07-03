
mod api;
mod logic;
mod state;
mod types;

use ic_cdk_macros::*;

// 👇 EXPORT the functions from api.rs
pub use api::{
    submit_question,
    get_all_questions,
    answer_question,
};

#[init]
fn init() {}

#[post_upgrade]
fn post_upgrade() {}

#[cfg(test)]
mod tests {
    use super::*;
    use candid::export_service;

    #[test]
    fn generate_did() {
        export_service!();
        std::fs::write("LexAi_backend.did", __export_service()).unwrap();
    }
}
