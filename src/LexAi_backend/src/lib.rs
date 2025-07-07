// lib.rs

use candid::Principal;

#[ic_cdk::query]
fn whoami() -> Principal {
    ic_cdk::caller()
}


#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::write;
    use candid::export_service;

    #[test]
    fn generate_did() {
        export_service!();
        write("LexAi_backend.did", __export_service()).expect("Failed to write .did file");
    }
}
