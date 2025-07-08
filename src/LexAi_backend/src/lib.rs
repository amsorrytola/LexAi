use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk::{caller as msg_caller, api::time}; // ✅ this works in ic-cdk 0.18+
use ic_cdk_macros::{query, update};
use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use candid::export_service;
use ic_llm::{ChatMessage, Model};


//---------------------------------------State Management---------------------------------------
/// State for each user
#[derive(Clone, CandidType, Serialize, Deserialize)]
struct User {
    principal: Principal,
    username: Option<String>,
    created_at: u64,
}

/// State for each session
#[derive(Clone, CandidType, Serialize, Deserialize)]
struct Session {
    principal: Principal,
    session_id: u64,
    project_name: Option<String>,
    messages: Vec<ChatMessage>,
    created_at: u64,
    system_prompt: Option<String>, 
}


//---------------------------------------Global State---------------------------------------
// Global users map using thread_local + RefCell
thread_local! {
    /// Thread-local storage for users
    static USERS: RefCell<HashMap<Principal, User>> = RefCell::new(HashMap::new());
    /// Thread-local storage for sessions
    static SESSIONS: RefCell<HashMap<Principal, Vec<Session>>> = RefCell::new(HashMap::new());
}

//---------------------------------------Public API---------------------------------------

//----------Authentication and User Management----------
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


//----------Session Management----------
/// Create new chat session
#[update]
fn start_new_session(project_name: Option<String>) -> u64 {
    let principal = msg_caller();
    let now = time();
    let session_id = now; // or generate a better UUID-like ID

    let session = Session {
        session_id,
        project_name,
        messages: vec![],
        created_at: now,
    };

    SESSIONS.with(|s| {
        let mut all = s.borrow_mut();
        all.entry(principal).or_default().push(session);
    });

    session_id
}

/// Add a message and get AI reply
#[update]
async fn chat_in_session(session_id: u64, input: String) -> String {
    let principal = msg_caller();
    let now = time();

    let mut response_text = String::new();

    // 1. Store user message
    SESSIONS.with(|s| {
        let mut map = s.borrow_mut();
        if let Some(sessions) = map.get_mut(&principal) {
            if let Some(session) = sessions.iter_mut().find(|s| s.session_id == session_id) {
                session.messages.push(ChatMessage::user(input.clone()));
            }
        }
    });

    // 2. Load messages
    let mut messages = SESSIONS.with(|s| {
        s.borrow().get(&principal)
            .and_then(|sessions| sessions.iter().find(|s| s.session_id == session_id))
            .map(|s| s.messages.clone())
            .unwrap_or_default()
    });

    // ✅ 3. Add system prompt if available
    SESSIONS.with(|s| {
        if let Some(sessions) = s.borrow().get(&principal) {
            if let Some(session) = sessions.iter().find(|s| s.session_id == session_id) {
                if let Some(system_prompt) = &session.system_prompt {
                    messages.insert(0, ChatMessage::system(system_prompt.clone()));
                }
            }
        }
    });

    // 4. Send to LLM
    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(messages.clone())
        .send()
        .await;

    // 5. Store assistant reply
    if let Some(reply) = response.message.content {
        response_text = reply.clone();

        SESSIONS.with(|s| {
            if let Some(sessions) = s.borrow_mut().get_mut(&principal) {
                if let Some(session) = sessions.iter_mut().find(|s| s.session_id == session_id) {
                    session.messages.push(ChatMessage::assistant(reply));
                }
            }
        });
    }

    response_text
}

/// Get all sessions for the caller
#[query]
fn list_sessions() -> Vec<(u64, Option<String>, u64)> {
    let principal = msg_caller();
    SESSIONS.with(|s| {
        s.borrow()
            .get(&principal)
            .unwrap_or(&vec![])
            .iter()
            .map(|session| (session.session_id, session.project_name.clone(), session.created_at))
            .collect()
    })
}

/// Get all messages in a session
#[query]
fn get_session_messages(session_id: u64) -> Vec<ChatMessage> {
    let principal = msg_caller();
    SESSIONS.with(|s| {
        s.borrow()
            .get(&principal)
            .and_then(|sessions| {
                sessions.iter().find(|s| s.session_id == session_id)
            })
            .map(|session| session.messages.clone())
            .unwrap_or_default()
    })
}


//---------------------------------------DID Generation---------------------------------------
#[cfg(test)]
#[test]
fn generate_did() {
    use candid::export_service;
    export_service!();
    std::fs::write("LexAi_backend.did", __export_service()).unwrap();
}


