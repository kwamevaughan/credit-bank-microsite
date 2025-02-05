// data/questions.js

export const quizzes = [
    {
        topic: 'History and Corporate Information',
        level: 'Beginner',
        totalQuestions: 2,
        perQuestionScore: 5,
        questions: [
            {
                question: 'In which year was Credit Bank founded?',
                choices: ['1986', '1995', '2000', '2010'],
                type: 'MCQ',
                correctAnswer: '1986',
            },
            {
                question: 'What was Credit Bank’s original name upon establishment?',
                choices: ['Credit Kenya Limited', 'Kenya Credit Bank', 'Credit Finance Corporation', 'Credit Bank of Kenya'],
                type: 'MCQ',
                correctAnswer: 'Credit Kenya Limited',
            },
        ],
    },
    {
        topic: 'Financing',
        level: 'Beginner',
        totalQuestions: 2,
        perQuestionScore: 5,
        questions: [
            {
                question: 'What is the main function of financing?',
                choices: ['Investing', 'Saving', 'Borrowing', 'All of the above'],
                type: 'MCQ',
                correctAnswer: 'All of the above',
            },
            {
                question: 'The term “interest” refers to?',
                choices: ['The cost of borrowing', 'The profit from investments', 'The total amount loaned', 'None of the above'],
                type: 'MCQ',
                correctAnswer: 'The cost of borrowing',
            },
        ],
    },
];