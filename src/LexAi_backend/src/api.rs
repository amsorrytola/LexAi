use ic_cdk::query;
use ic_cdk::update;

use crate::logic;
use crate::types::{Question, Answer};

#[update]
pub fn submit_question(content: String) -> String {
    logic::add_question(content)
}

#[query]
pub fn get_all_questions() -> Vec<Question> {
    logic::list_questions()
}

#[update]
pub fn answer_question(id: u64, content: String) -> Option<Answer> {
    logic::add_answer(id, content)
}
