use crate::types::Question;
use std::cell::RefCell;
use once_cell::unsync::Lazy;

thread_local! {
    pub static QUESTIONS: RefCell<Vec<Question>> = RefCell::new(Vec::new());
    pub static COUNTER: RefCell<u64> = RefCell::new(0);
}

pub fn next_id() -> u64 {
    COUNTER.with(|c| {
        let mut id = c.borrow_mut();
        *id += 1;
        *id
    })
}
