use ic_cdk::{
    api::{canister_self, msg_caller, time},
    stable::{stable_size, stable_grow, stable_read, stable_write},
    management_canister::{http_request, HttpRequestArgs, HttpRequestResult, HttpMethod, HttpHeader, TransformContext, TransformFunc, TransformArgs},
};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    StableBTreeMap, Memory, Storable, storable::Bound,
};
use candid::{CandidType, Principal, Encode, Decode};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use sha2::{Sha256, Digest};
use hex;
use serde_json::json;
use std::borrow::Cow;

// Custom memory type for stable storage
struct CanisterMemory;

impl Memory for CanisterMemory {
    fn size(&self) -> u64 {
        stable_size()
    }

    fn grow(&self, pages: u64) -> i64 {
        match stable_grow(pages) {
            Ok(prev_size) => prev_size as i64,
            Err(_) => -1,
        }
    }

    fn read(&self, offset: u64, buf: &mut [u8]) {
        stable_read(offset, buf)
    }

    fn write(&self, offset: u64, buf: &[u8]) {
        stable_write(offset, buf)
    }
}

// Memory Manager for stable storage
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<CanisterMemory>> = RefCell::new(
        MemoryManager::init(CanisterMemory)
    );
}

// Newtypes for Storable implementations
#[derive(Ord, PartialOrd, Eq, PartialEq, Clone)]
struct KeyString(String);
impl Storable for KeyString {
    const BOUND: Bound = Bound::Bounded { max_size: 100, is_fixed_size: false };
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Borrowed(self.0.as_bytes())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        KeyString(String::from_utf8(bytes.to_vec()).unwrap())
    }
}

#[derive(Ord, PartialOrd, Eq, PartialEq, Clone)]
struct KeyPrincipal(Principal);
impl Storable for KeyPrincipal {
    const BOUND: Bound = Bound::Bounded { max_size: 29, is_fixed_size: false };
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Borrowed(self.0.as_slice())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        KeyPrincipal(Principal::from_slice(&bytes))
    }
}

struct ValueString(String);
impl Storable for ValueString {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Borrowed(self.0.as_bytes())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        ValueString(String::from_utf8(bytes.to_vec()).unwrap())
    }
}

// Data Structures
#[derive(Clone, CandidType, Deserialize, Serialize)]
struct User {
    principal: Principal,
    username: Option<String>,
    email: Option<String>,
    created_at: u64,
}

impl Storable for User {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(&bytes, Self).unwrap()
    }
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
struct Session {
    session_id: String,
    principal: Principal,
    title: Option<String>,
    created_at: u64,
    messages: Vec<ChatMessage>,
}

impl Storable for Session {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(&bytes, Self).unwrap()
    }
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
struct LegalTemplate {
    id: String,
    name: String,
    template_text: String,
}

impl Storable for LegalTemplate {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(&bytes, Self).unwrap()
    }
}

// Stable Storage Maps
thread_local! {
    static USERS: RefCell<StableBTreeMap<KeyPrincipal, User, VirtualMemory<CanisterMemory>>> = RefCell::new({
        let memory = MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(0)));
        StableBTreeMap::init(memory)
    });

    static SESSIONS: RefCell<StableBTreeMap<KeyString, Session, VirtualMemory<CanisterMemory>>> = RefCell::new({
        let memory = MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(1)));
        StableBTreeMap::init(memory)
    });

    static TEMPLATES: RefCell<StableBTreeMap<KeyString, LegalTemplate, VirtualMemory<CanisterMemory>>> = RefCell::new({
        let memory = MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(2)));
        StableBTreeMap::init(memory)
    });

    static DOCUMENTS: RefCell<StableBTreeMap<KeyString, ValueString, VirtualMemory<CanisterMemory>>> = RefCell::new({
        let memory = MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(3)));
        StableBTreeMap::init(memory)
    });
}

// User Management Functions
#[ic_cdk::update]
fn get_or_register_user() -> User {
    let principal = msg_caller();
    let now = time();

    USERS.with(|users| {
        let mut map = users.borrow_mut();
        let key = KeyPrincipal(principal);
        if let Some(user) = map.get(&key).map(|u| u.clone()) {
            user
        } else {
            let new_user = User {
                principal,
                username: None,
                email: None,
                created_at: now,
            };
            map.insert(key, new_user.clone());
            new_user
        }
    })
}

#[ic_cdk::update]
fn update_profile(username: Option<String>, email: Option<String>) {
    let principal = msg_caller();
    USERS.with(|users| {
        let mut map = users.borrow_mut();
        let key = KeyPrincipal(principal);
        if let Some(user) = map.get(&key).map(|u| u.clone()) {
            let mut updated_user = user;
            if let Some(un) = username {
                updated_user.username = Some(un);
            }
            if let Some(em) = email {
                updated_user.email = Some(em);
            }
            map.insert(key, updated_user);
        }
    })
}

// Session Management Functions
#[ic_cdk::update]
fn start_session(title: Option<String>) -> String {
    let principal = msg_caller();
    let now = time();
    let mut hasher = Sha256::new();
    hasher.update(principal.as_slice());
    hasher.update(now.to_be_bytes());
    let hash = hex::encode(hasher.finalize());
    let session_id = format!("session_{}", hash);

    let session = Session {
        session_id: session_id.clone(),
        principal,
        title,
        created_at: now,
        messages: vec![],
    };

    SESSIONS.with(|sessions| {
        let mut map = sessions.borrow_mut();
        map.insert(KeyString(session_id.clone()), session);
    });

    session_id
}

#[ic_cdk::update]
async fn chat_in_session(session_id: String, input: String) -> String {
    let principal = msg_caller();
    let session_opt = SESSIONS.with(|sessions| {
        let map = sessions.borrow();
        map.get(&KeyString(session_id.clone())).map(|s| s.clone())
    });

    if let Some(session) = session_opt {
        if session.principal != principal {
            return "Unauthorized".to_string();
        }
        // Build prompt from session messages
        let mut prompt = String::new();
        for msg in &session.messages {
            prompt.push_str(&format!("{}: {}\n", msg.role, msg.content));
        }
        prompt.push_str(&format!("User: {}\n", input));
        // Call Gemini API
        let reply = query_gemini_api(&prompt).await;
        // Append user and assistant messages
        let user_msg = ChatMessage {
            role: "user".to_string(),
            content: input,
        };
        let assistant_msg = ChatMessage {
            role: "assistant".to_string(),
            content: reply.clone(),
        };
        let mut updated_session = session;
        updated_session.messages.push(user_msg);
        updated_session.messages.push(assistant_msg);
        // Update session in storage
        SESSIONS.with(|sessions| {
            let mut map = sessions.borrow_mut();
            map.insert(KeyString(session_id), updated_session);
        });
        reply
    } else {
        "Session not found".to_string()
    }
}

#[ic_cdk::query]
fn list_sessions() -> Vec<(String, Option<String>, u64)> {
    let principal = msg_caller();
    SESSIONS.with(|sessions| {
        let map = sessions.borrow();
        map.iter()
            .filter(|(_, s)| s.principal == principal)
            .map(|(id, s)| (id.0.clone(), s.title.clone(), s.created_at))
            .collect()
    })
}

#[ic_cdk::query]
fn get_session_messages(session_id: String) -> Vec<ChatMessage> {
    let principal = msg_caller();
    SESSIONS.with(|sessions| {
        let map = sessions.borrow();
        if let Some(session) = map.get(&KeyString(session_id)) {
            if session.principal == principal {
                session.messages.clone()
            } else {
                vec![]
            }
        } else {
            vec![]
        }
    })
}

// Legal Template Management Functions
#[ic_cdk::update]
fn add_template(id: String, name: String, template_text: String) {
    let id_clone = id.clone(); // clone first
    TEMPLATES.with(|templates| {
        templates
            .borrow_mut()
            .insert(KeyString(id), LegalTemplate {
                id: id_clone,
                name,
                template_text,
            });
    });
}


// Document Generation Functions
#[ic_cdk::update]
async fn generate_document(template_id: String, fields: Vec<(String, String)>) -> String {
    let template_opt = TEMPLATES.with(|templates| {
        let map = templates.borrow();
        map.get(&KeyString(template_id.clone())).map(|t| t.clone())
    });

    if let Some(template) = template_opt {
        let mut prompt = template.template_text;
        for (key, value) in fields {
            let placeholder = format!("{{{}}}", key);
            prompt = prompt.replace(&placeholder, &value);
        }
        // Call Gemini API with the prompt
        let document_text = query_gemini_api(&prompt).await;
        // Generate unique document ID
        let principal = msg_caller();
        let now = time();
        let mut hasher = Sha256::new();
        hasher.update(principal.as_slice());
        hasher.update(now.to_be_bytes());
        hasher.update(template_id.as_bytes());
        let hash = hex::encode(hasher.finalize());
        let document_id = format!("doc_{}", hash);
        // Store document
        DOCUMENTS.with(|documents| {
            let mut map = documents.borrow_mut();
            map.insert(KeyString(document_id.clone()), ValueString(document_text));
        });
        document_id
    } else {
        "Template not found".to_string()
    }
}

#[ic_cdk::query]
fn get_document(document_id: String) -> Option<String> {
    DOCUMENTS.with(|documents| {
        let map = documents.borrow();
        map.get(&KeyString(document_id)).map(|v| v.0.clone())
    })
}

// Gemini API Integration
async fn query_gemini_api(prompt: &str) -> String {
    let api_key = "AIzaSyCCvHKeDsSX4kp0F1Fm-mLa6xwLxIiE8YU"; // Replace with actual API key
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
        api_key
    );

    let headers = vec![HttpHeader {
        name: "Content-Type".to_string(),
        value: "application/json".to_string(),
    }];

    let json_body = json!({
        "contents": [
            {
                "parts": [{ "text": prompt }]
            }
        ]
    });

    let request = HttpRequestArgs {
        method: HttpMethod::POST,
        url,
        headers,
        body: Some(serde_json::to_vec(&json_body).unwrap()),
        max_response_bytes: Some(2_000_000),
        transform: Some(TransformContext {
            function: TransformFunc::new(canister_self(), "transform".into()),
            context: vec![],
        }),
    };

    match http_request(&request).await {
        Ok(res) => {
            let body_str = String::from_utf8(res.body).unwrap_or_default();
            let json: serde_json::Value = serde_json::from_str(&body_str).unwrap_or_default();
            json["candidates"][0]["content"]["parts"][0]["text"]
                .as_str()
                .unwrap_or("Error")
                .to_string()
        }
        Err(e) => format!("Request failed: {:?}", e),
    }
}

// HTTP Response Transformation
#[ic_cdk::query]
fn transform(raw: TransformArgs) -> HttpRequestResult {
    let headers = vec![
        HttpHeader {
            name: "X-Content-Type-Options".to_string(),
            value: "nosniff".to_string(),
        },
        HttpHeader {
            name: "X-Frame-Options".to_string(),
            value: "DENY".to_string(),
        },
        HttpHeader {
            name: "Referrer-Policy".to_string(),
            value: "strict-origin".to_string(),
        },
        HttpHeader {
            name: "Strict-Transport-Security".to_string(),
            value: "max-age=63072000".to_string(),
        },
    ];

    HttpRequestResult {
        status: raw.response.status,
        headers: headers,
        body: raw.response.body,
    }
}