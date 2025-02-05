// data/questions.js

export const quiz = {
    topic: 'Javascript',
    level: 'Beginner',
    totalQuestions: 4,
    perQuestionScore: 5,
    questions: [
        {
            question: 'Which function is used to serialize an object into a JSON string in Javascript?',
            choices: ['stringify()', 'parse()', 'convert()', 'None of the above'],
            type: 'MCQ',
            correctAnswer: 'stringify()',
        },
        {
            question: 'Which of the following keywords is used to define a variable in Javascript?',
            choices: ['var', 'let', 'var and let', 'None of the above'],
            type: 'MCQ',
            correctAnswer: 'var and let',
        },
        // Add other questions following the same structure
    ],
}