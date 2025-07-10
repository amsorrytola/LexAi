use ic_cdk::{
    api::canister_self,
    management_canister::{
        http_request, HttpHeader, HttpMethod, HttpRequestArgs, HttpRequestResult, TransformArgs,
        TransformContext, TransformFunc,
    },
};
use serde_json::json;
use std::collections::HashMap;
use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize, CandidType)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
struct ChatSession {
    name: String,
    messages: Vec<ChatMessage>,
}


type SessionId = String;

type Sessions = HashMap<SessionId, ChatSession>;

thread_local! {
    static SESSIONS: std::cell::RefCell<Sessions> = std::cell::RefCell::new(HashMap::new());
}


#[ic_cdk::update]
fn start_session(prompt: String) -> SessionId {
    use std::time::{SystemTime, UNIX_EPOCH};
    use sha2::{Sha256, Digest};
    use hex;

    // Fallback "unique-enough" ID using timestamp + prompt hash
    let time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
    let mut hasher = Sha256::new();
    hasher.update(&prompt);
    let hash = hex::encode(hasher.finalize());

    let session_id = format!("s_{}_{}", time, hash);

    let name = prompt
        .split_whitespace()
        .take(5)
        .collect::<Vec<_>>()
        .join(" ");

    let initial_msg = ChatMessage {
        role: "user".into(),
        content: prompt.clone(),
    };

    let session = ChatSession {
        name,
        messages: vec![initial_msg],
    };

    SESSIONS.with(|s| s.borrow_mut().insert(session_id.clone(), session));
    session_id
}

#[ic_cdk::update]
async fn chat(session_id: SessionId, prompt: String) -> String {
    let reply = query_gemini_api(&prompt).await;

    SESSIONS.with(|s| {
        let mut sessions = s.borrow_mut();
        if let Some(session) = sessions.get_mut(&session_id) {
            session.messages.push(ChatMessage {
                role: "user".into(),
                content: prompt.clone(),
            });
            session.messages.push(ChatMessage {
                role: "assistant".into(),
                content: reply.clone(),
            });
        }
    });

    reply
}

#[ic_cdk::query]
fn list_sessions() -> Vec<(SessionId, String)> {
    SESSIONS.with(|s| {
        s.borrow()
            .iter()
            .map(|(id, sess)| (id.clone(), sess.name.clone()))
            .collect()
    })
}

#[ic_cdk::query]
fn get_session(session_id: SessionId) -> Option<ChatSession> {
    SESSIONS.with(|s| s.borrow().get(&session_id).cloned())
}

#[ic_cdk::update]
async fn query_gemini_api(prompt: &str) -> String {
    let api_key = "AIzaSyCCvHKeDsSX4kp0F1Fm-mLa6xwLxIiE8YU";
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={}",
        api_key
    );

    let headers = vec![HttpHeader {
        name: "Content-Type".into(),
        value: "application/json".into(),
    }];

    let json_body = json!({
        "contents": [
            {
                "parts": [{ "text": prompt }]
            }
        ]
    });

    let request = HttpRequestArgs {
        url,
        max_response_bytes: Some(2_000_000),
        method: HttpMethod::POST,
        headers,
        body: Some(serde_json::to_vec(&json_body).unwrap()),
        transform: Some(TransformContext {
            function: TransformFunc::new(canister_self(), "transform".to_string()),
            context: vec![],
        }),
    };

    match http_request(&request).await {
        Ok(res) => String::from_utf8(res.body).unwrap_or("Invalid UTF-8".into()),
        Err(e) => format!("Request failed: {:?}", e),
    }
}

// Strips all data that is not needed from the original response.
#[ic_cdk::query]
fn transform(raw: TransformArgs) -> HttpRequestResult {
    let headers = vec![
        HttpHeader {
            name: "Content-Security-Policy".to_string(),
            value: "default-src 'self'".to_string(),
        },
        HttpHeader {
            name: "Referrer-Policy".to_string(),
            value: "strict-origin".to_string(),
        },
        HttpHeader {
            name: "Permissions-Policy".to_string(),
            value: "geolocation=(self)".to_string(),
        },
        HttpHeader {
            name: "Strict-Transport-Security".to_string(),
            value: "max-age=63072000".to_string(),
        },
        HttpHeader {
            name: "X-Frame-Options".to_string(),
            value: "DENY".to_string(),
        },
        HttpHeader {
            name: "X-Content-Type-Options".to_string(),
            value: "nosniff".to_string(),
        },
    ];

    let mut res = HttpRequestResult {
        status: raw.response.status.clone(),
        body: raw.response.body.clone(),
        headers,
        ..Default::default()
    };

    if res.status == 200u8 {
        res.body = raw.response.body;
    } else {
        ic_cdk::api::debug_print(format!("Received an error from coinbase: err = {:?}", raw));
    }
    res
}



