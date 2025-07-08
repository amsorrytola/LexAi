use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk::{caller as msg_caller, api::time}; // ✅ this works in ic-cdk 0.18+
use ic_cdk_macros::{query, update};
use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use candid::export_service;


// State for each user
#[derive(Clone, CandidType, Serialize, Deserialize)]
struct User {
    principal: Principal,
    username: Option<String>,
    created_at: u64,
}

// Global users map using thread_local + RefCell
thread_local! {
    static USERS: RefCell<HashMap<Principal, User>> = RefCell::new(HashMap::new());
}

/// Registers or returns an existing user
#[update]
fn get_or_register_user() -> User {
    let caller_principal = msg_caller();
    let now = time();

    USERS.with(|cell| {
        let mut users = cell.borrow_mut();

        if let Some(user) = users.get(&caller_principal) {
            return user.clone();
        }

        let new_user = User {
            principal: caller_principal,
            username: None,
            created_at: now,
        };
        users.insert(caller_principal, new_user.clone());
        new_user
    })
}


/// Return caller's username or "Anonymous" plus created timestamp
#[query]
fn get_my_user() -> Option<(String, u64)> {
    let caller_principal = msg_caller();
    USERS.with(|cell| {
        cell.borrow().get(&caller_principal).map(|u| {
            (
                u.username.clone().unwrap_or_else(|| "Anonymous".to_string()),
                u.created_at,
            )
        })
    })
}

#[cfg(test)]
#[test]
fn generate_did() {
    use candid::export_service;
    export_service!();
    std::fs::write("LexAi_backend.did", __export_service()).unwrap();
}


