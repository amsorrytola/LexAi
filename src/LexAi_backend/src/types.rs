use candid::{CandidType, Deserialize};

#[derive(CandidType, Deserialize, Clone)]
pub struct Answer {
    pub id: u64,
    pub question_id: u64,
    pub content: String,
    pub timestamp: u64,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Question {
    pub id: u64,
    pub content: String,
    pub timestamp: u64,
    pub answer: Option<Answer>, // ✅ Add this field
}
