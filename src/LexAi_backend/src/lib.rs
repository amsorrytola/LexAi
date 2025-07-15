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

#[ic_cdk::init]
fn init() {
    TEMPLATES.with(|templates| {
        let mut map = templates.borrow_mut();
        map.insert(KeyString("NDA".to_string()), LegalTemplate {
            id: "NDA".to_string(),
            name: "Non-Disclosure Agreement".to_string(),
            template_text: "Generate a non-disclosure agreement with the following details: Disclosing Party: {disclosingParty}, Receiving Party: {receivingParty}, Purpose: {purpose}, Duration: {duration}, Jurisdiction: {jurisdiction}, Effective Date: {effectiveDate}, Confidential Information: {confidentialInformation}, Non-Compete Clause: {nonCompete}, Remedies: {remedies}".to_string(),
        });
        map.insert(KeyString("Employment".to_string()), LegalTemplate {
            id: "Employment".to_string(),
            name: "Employment Agreement".to_string(),
            template_text: "Generate an employment agreement with the following details: Employer: {employer}, Employee: {employee}, Position: {position}, Duration: {duration}, Jurisdiction: {jurisdiction}, Salary: {salary}, Start Date: {startDate}, Benefits: {benefits}, Termination Conditions: {termination}".to_string(),
        });
        map.insert(KeyString("Service".to_string()), LegalTemplate {
            id: "Service".to_string(),
            name: "Service Agreement".to_string(),
            template_text: "Generate a service agreement with the following details: Service Provider: {serviceProvider}, Client: {client}, Service Description: {serviceDescription}, Duration: {duration}, Jurisdiction: {jurisdiction}, Payment Terms: {paymentTerms}, Start Date: {startDate}, Deliverables: {deliverables}, Termination Clause: {termination}".to_string(),
        });
        map.insert(KeyString("Partnership".to_string()), LegalTemplate {
            id: "Partnership".to_string(),
            name: "Partnership Agreement".to_string(),
            template_text: "Generate a partnership agreement with the following details:\n\n**PARTNERSHIP AGREEMENT**\n\nThis Partnership Agreement (the \"Agreement\") is made and entered into on {effectiveDate} by and between {partner1} (\"Partner 1\") and {partner2} (\"Partner 2\"), collectively referred to as the \"Partners\".\n\n**1. PURPOSE**\n\nThe Partners agree to form a partnership for the purpose of {purpose}.\n\n**2. DURATION**\n\nThe term of this Agreement shall commence on {effectiveDate} and continue for {duration}, unless terminated earlier as provided herein.\n\n**3. CONTRIBUTIONS**\n\n(a) Partner 1 shall contribute expertise and resources as agreed.\n(b) Partner 2 shall contribute expertise and resources as agreed.\n\n**4. MANAGEMENT**\n\nThe management structure shall be as follows: {responsibilities}. Decisions shall be made by mutual agreement.\n\n**5. PROFITS AND LOSSES**\n\nThe net profits and losses shall be shared in the proportion of {profitSharing} (Partner 1 / Partner 2).\n\n**6. ACCOUNTING**\n\nThe Partners shall maintain accurate books and records. Financial statements shall be prepared annually. An independent auditor shall audit the accounts annually.\n\n**7. TERMINATION**\n\nThis Agreement may be terminated by mutual agreement or material breach. Upon termination, assets shall be distributed according to profit-sharing ratios.\n\n**8. GOVERNING LAW AND JURISDICTION**\n\nThis Agreement shall be governed by the laws of {jurisdiction}. Disputes shall be resolved by {disputeResolution} in {jurisdiction}.\n\n**9. ENTIRE AGREEMENT**\n\nThis Agreement constitutes the entire agreement between the Partners and supersedes all prior agreements.\n\n**IN WITNESS WHEREOF**, the Partners have executed this Agreement as of {effectiveDate}.\n\n_________________________\nPartner 1: {partner1}\n\n_________________________\nPartner 2: {partner2}\n\nSignature: _________________________\nSignature: _________________________\n\nPrinted Name: {partner1}\nPrinted Name: {partner2}".to_string(),
        });
        map.insert(KeyString("Rental".to_string()), LegalTemplate {
            id: "Rental".to_string(),
            name: "Rental Agreement".to_string(),
            template_text: "Generate a rental agreement with the following details: Landlord: {landlord}, Tenant: {tenant}, Property Address: {propertyAddress}, Duration: {duration}, Jurisdiction: {jurisdiction}, Rent Amount: {rentAmount}, Start Date: {startDate}, Security Deposit: {securityDeposit}, Maintenance Terms: {maintenance}".to_string(),
        });
        map.insert(KeyString("Purchase".to_string()), LegalTemplate {
            id: "Purchase".to_string(),
            name: "Purchase Agreement".to_string(),
            template_text: "Generate a purchase agreement with the following details: Seller: {seller}, Buyer: {buyer}, Item/Service: {itemService}, Duration: {duration}, Jurisdiction: {jurisdiction}, Purchase Price: {purchasePrice}, Delivery Date: {deliveryDate}, Payment Terms: {paymentTerms}, Warranties: {warranties}".to_string(),
        });
    });
}

#[ic_cdk::query]
fn list_templates() -> Vec<(String, String)> {
    TEMPLATES.with(|templates| {
        let map = templates.borrow();
        let templates_list: Vec<(String, String)> = map.iter().map(|(id, t)| (id.0.clone(), t.name.clone())).collect();
        ic_cdk::println!("Returning templates: {:?}", templates_list); // Debug log
        templates_list
    })
}

#[ic_cdk::query]
fn list_documents() -> Vec<String> {
    let principal = msg_caller();
    DOCUMENTS.with(|documents| {
        let map = documents.borrow();
        map.iter()
            .filter(|(id, _)| {
                id.0.starts_with("doc_") 
            })
            .map(|(id, _)| id.0.clone())
            .collect()
    })
}


#[ic_cdk::query]
fn get_templates_count() -> u64 {
    TEMPLATES.with(|templates| {
        let map = templates.borrow();
        map.len()
    })
}

#[ic_cdk::update]
fn init_templates() {
    TEMPLATES.with(|templates| {
        let mut map = templates.borrow_mut();
        map.insert(KeyString("NDA".to_string()), LegalTemplate {
            id: "NDA".to_string(),
            name: "Non-Disclosure Agreement".to_string(),
            template_text: "Generate a non-disclosure agreement with the following details: Disclosing Party: {disclosingParty}, Receiving Party: {receivingParty}, Purpose: {purpose}, Duration: {duration}, Jurisdiction: {jurisdiction}, Effective Date: {effectiveDate}, Confidential Information: {confidentialInformation}, Non-Compete Clause: {nonCompete}, Remedies: {remedies}".to_string(),
        });
        map.insert(KeyString("Employment".to_string()), LegalTemplate {
            id: "Employment".to_string(),
            name: "Employment Agreement".to_string(),
            template_text: "Generate an employment agreement with the following details: Employer: {employer}, Employee: {employee}, Position: {position}, Duration: {duration}, Jurisdiction: {jurisdiction}, Salary: {salary}, Start Date: {startDate}, Benefits: {benefits}, Termination Conditions: {termination}".to_string(),
        });
        map.insert(KeyString("Service".to_string()), LegalTemplate {
            id: "Service".to_string(),
            name: "Service Agreement".to_string(),
            template_text: "Generate a service agreement with the following details: Service Provider: {serviceProvider}, Client: {client}, Service Description: {serviceDescription}, Duration: {duration}, Jurisdiction: {jurisdiction}, Payment Terms: {paymentTerms}, Start Date: {startDate}, Deliverables: {deliverables}, Termination Clause: {termination}".to_string(),
        });
        map.insert(KeyString("Partnership".to_string()), LegalTemplate {
            id: "Partnership".to_string(),
            name: "Partnership Agreement".to_string(),
            template_text: "Generate a partnership agreement with the following details:\n\n**PARTNERSHIP AGREEMENT**\n\nThis Partnership Agreement (the \"Agreement\") is made and entered into on {effectiveDate} by and between {partner1} (\"Partner 1\") and {partner2} (\"Partner 2\"), collectively referred to as the \"Partners\".\n\n**1. PURPOSE**\n\nThe Partners agree to form a partnership for the purpose of {purpose}.\n\n**2. DURATION**\n\nThe term of this Agreement shall commence on {effectiveDate} and continue for {duration}, unless terminated earlier as provided herein.\n\n**3. CONTRIBUTIONS**\n\n(a) Partner 1 shall contribute expertise and resources as agreed.\n(b) Partner 2 shall contribute expertise and resources as agreed.\n\n**4. MANAGEMENT**\n\nThe management structure shall be as follows: {responsibilities}. Decisions shall be made by mutual agreement.\n\n**5. PROFITS AND LOSSES**\n\nThe net profits and losses shall be shared in the proportion of {profitSharing} (Partner 1 / Partner 2).\n\n**6. ACCOUNTING**\n\nThe Partners shall maintain accurate books and records. Financial statements shall be prepared annually. An independent auditor shall audit the accounts annually.\n\n**7. TERMINATION**\n\nThis Agreement may be terminated by mutual agreement or material breach. Upon termination, assets shall be distributed according to profit-sharing ratios.\n\n**8. GOVERNING LAW AND JURISDICTION**\n\nThis Agreement shall be governed by the laws of {jurisdiction}. Disputes shall be resolved by {disputeResolution} in {jurisdiction}.\n\n**9. ENTIRE AGREEMENT**\n\nThis Agreement constitutes the entire agreement between the Partners and supersedes all prior agreements.\n\n**IN WITNESS WHEREOF**, the Partners have executed this Agreement as of {effectiveDate}.\n\n_________________________\nPartner 1: {partner1}\n\n_________________________\nPartner 2: {partner2}\n\nSignature: _________________________\nSignature: _________________________\n\nPrinted Name: {partner1}\nPrinted Name: {partner2}".to_string(),
        });
        map.insert(KeyString("Rental".to_string()), LegalTemplate {
            id: "Rental".to_string(),
            name: "Rental Agreement".to_string(),
            template_text: "Generate a rental agreement with the following details: Landlord: {landlord}, Tenant: {tenant}, Property Address: {propertyAddress}, Duration: {duration}, Jurisdiction: {jurisdiction}, Rent Amount: {rentAmount}, Start Date: {startDate}, Security Deposit: {securityDeposit}, Maintenance Terms: {maintenance}".to_string(),
        });
        map.insert(KeyString("Purchase".to_string()), LegalTemplate {
            id: "Purchase".to_string(),
            name: "Purchase Agreement".to_string(),
            template_text: "Generate a purchase agreement with the following details: Seller: {seller}, Buyer: {buyer}, Item/Service: {itemService}, Duration: {duration}, Jurisdiction: {jurisdiction}, Purchase Price: {purchasePrice}, Delivery Date: {deliveryDate}, Payment Terms: {paymentTerms}, Warranties: {warranties}".to_string(),
        });
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
        let mut prompt = String::new();
        for msg in &session.messages {
            prompt.push_str(&format!("{}: {}\n", msg.role, msg.content));
        }
        prompt.push_str(&format!("User: {}\n", input));
        let reply = query_gemini_api(&prompt).await;
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

#[ic_cdk::update]
fn rename_session(session_id: String, new_title: String) -> bool {
    let principal = msg_caller();
    SESSIONS.with(|sessions| {
        let mut map = sessions.borrow_mut();
        if let Some(session) = map.get(&KeyString(session_id.clone())).map(|s| s.clone()) {
            if session.principal != principal {
                return false;
            }
            let mut updated_session = session;
            updated_session.title = Some(new_title);
            map.insert(KeyString(session_id), updated_session);
            true
        } else {
            false
        }
    })
}

#[ic_cdk::update]
fn delete_session(session_id: String) -> bool {
    let principal = msg_caller();
    SESSIONS.with(|sessions| {
        let mut map = sessions.borrow_mut();
        if let Some(session) = map.get(&KeyString(session_id.clone())).map(|s| s.clone()) {
            if session.principal != principal {
                return false;
            }
            map.remove(&KeyString(session_id));
            true
        } else {
            false
        }
    })
}

// Legal Template Management Functions
#[ic_cdk::update]
fn add_template(id: String, name: String, template_text: String) {
    let id_clone = id.clone();
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
        ic_cdk::println!("Initial prompt: {}", prompt);
        for (key, value) in &fields {
            let placeholder = format!("{{{}}}", key);
            ic_cdk::println!("Replacing {} with {}", placeholder, value);
            prompt = prompt.replace(&placeholder, value);
        }
        ic_cdk::println!("Final prompt sent to Gemini: {}", prompt);
        let document_text = query_gemini_api_document(&prompt).await;
        ic_cdk::println!("Generated document text: {}", document_text);
        let principal = msg_caller();
        let now = time();
        let mut hasher = Sha256::new();
        hasher.update(principal.as_slice());
        hasher.update(now.to_be_bytes());
        hasher.update(template_id.as_bytes());
        let hash = hex::encode(hasher.finalize());
        let document_id = format!("doc_{}", hash);
        DOCUMENTS.with(|documents| {
            let mut map = documents.borrow_mut();
            map.insert(KeyString(document_id.clone()), ValueString(document_text.clone()));
        });
        document_id
    } else {
        ic_cdk::println!("Template not found: {}", template_id);
        "Template not found".to_string()
    }
}

#[ic_cdk::query]
fn get_document(document_id: String) -> Option<String> {
    DOCUMENTS.with(|documents| {
        let map = documents.borrow();
        let document = map.get(&KeyString(document_id.clone())).map(|v| v.0.clone());
        ic_cdk::println!("Retrieved document for ID {}: {:?}", document_id, document);
        document
    })
}

async fn query_gemini_api_document(prompt: &str) -> String {
    let api_key = "AIzaSyCCvHKeDsSX4kp0F1Fm-mLa6xwLxIiE8YU"; // Replace with your actual Gemini API key
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={}",
        api_key
    );

    let headers = vec![HttpHeader {
        name: "Content-Type".to_string(),
        value: "application/json".to_string(),
    }];

    let full_prompt = format!(
        "{}\n\nPlease generate a professional legal document based on the provided details. Include all specified fields in the document, ensuring proper formatting with numbered sections, clear headings, and no placeholders (e.g., [Specify]). Avoid including any disclaimers, introductions, or AI-related statements.",
        prompt
    );

    let json_body = json!({
        "contents": [
            {
                "parts": [{ "text": full_prompt }]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 2048,
            "stopSequences": []
        }
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
            ic_cdk::println!("Gemini API response: {}", body_str);
            let json: serde_json::Value = serde_json::from_str(&body_str).unwrap_or_default();
            let parts = json["candidates"][0]["content"]["parts"].as_array();
            match parts {
                Some(parts_array) => {
                    let text = parts_array
                        .iter()
                        .filter_map(|part| part["text"].as_str())
                        .collect::<Vec<&str>>()
                        .join("\n");
                    if text.is_empty() {
                        ic_cdk::println!("Error: No valid text in response");
                        "Error: No valid text in response".to_string()
                    } else {
                        text
                    }
                }
                None => {
                    ic_cdk::println!("Error: Invalid response structure");
                    "Error: Invalid response structure".to_string()
                }
            }
        }
        Err(e) => {
            ic_cdk::println!("Gemini API request failed: {:?}", e);
            format!("Request failed: {:?}", e)
        }
    }
}

// Gemini API Integration
async fn query_gemini_api(prompt: &str) -> String {
    let api_key = "AIzaSyCCvHKeDsSX4kp0F1Fm-mLa6xwLxIiE8YU"; // Replace with your actual Gemini API key
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={}",
        api_key
    );

    let headers = vec![HttpHeader {
        name: "Content-Type".to_string(),
        value: "application/json".to_string(),
    }];

    let full_prompt = format!(
        "{}\n\nAvoid including any disclaimers, introductions, or AI-related statements. like dont say i am ai i cant give leagal advice , just asnswer the question in a professional manner",
        prompt
    );

    let json_body = json!({
        "contents": [
            {
                "parts": [{ "text": full_prompt }]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 2048,
            "stopSequences": []
        }
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
            ic_cdk::println!("Gemini API response: {}", body_str);
            let json: serde_json::Value = serde_json::from_str(&body_str).unwrap_or_default();
            let parts = json["candidates"][0]["content"]["parts"].as_array();
            match parts {
                Some(parts_array) => {
                    let text = parts_array
                        .iter()
                        .filter_map(|part| part["text"].as_str())
                        .collect::<Vec<&str>>()
                        .join("\n");
                    if text.is_empty() {
                        ic_cdk::println!("Error: No valid text in response");
                        "Error: No valid text in response".to_string()
                    } else {
                        text
                    }
                }
                None => {
                    ic_cdk::println!("Error: Invalid response structure");
                    "Error: Invalid response structure".to_string()
                }
            }
        }
        Err(e) => {
            ic_cdk::println!("Gemini API request failed: {:?}", e);
            format!("Request failed: {:?}", e)
        }
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
        headers,
        body: raw.response.body,
    }
}