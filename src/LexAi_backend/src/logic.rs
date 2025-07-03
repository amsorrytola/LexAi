use crate::state::{QUESTIONS, next_id};
use crate::types::{Question, Answer};
use ic_cdk::api::time;

pub fn add_question(content: String) -> String {
    let id = next_id();
    let question = Question {
        id,
        content,
        timestamp: time(),
        answer: None,
    };

    QUESTIONS.with(|q| {
        q.borrow_mut().push(question);
    });

    format!("Question #{id} submitted.")
}

pub fn list_questions() -> Vec<Question> {
    QUESTIONS.with(|q| q.borrow().clone())
}

pub fn add_answer(id: u64, content: String) -> Option<Answer> {
    let answer = Answer {
        id: time(), // or generate a proper unique ID
        question_id: id,
        content,
        timestamp: time(),
    };
    

    QUESTIONS.with(|q| {
        let mut questions = q.borrow_mut();
        if let Some(q) = questions.iter_mut().find(|q| q.id == id) {
            q.answer = Some(answer.clone());
            Some(answer)
        } else {
            None
        }
    })
}
