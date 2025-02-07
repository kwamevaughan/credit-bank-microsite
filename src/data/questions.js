// data/questions.js

export const quizzes = [
    {
        id: 1,
        topic: 'History and Corporate Information',
        level: 'Beginner',
        totalQuestions: 8,
        perQuestionScore: 5,
        questions: [
            {
                question: 'In which year did Credit Bank obtain its commercial banking license?',
                choices: ['1986', '1995', '2005', '2010'],
                type: 'MCQ',
                correctAnswer: '1995',
            },
            {
                question: 'Where is Credit Bank’s headquarters located?',
                choices: ['Mombasa', 'Nairobi', 'Kisumu', 'Nakuru'],
                type: 'MCQ',
                correctAnswer: 'Nairobi',
            },
            {
                question: 'Who is the CEO of Credit Bank as of 2025?',
                choices: ['James Mwangi', 'Betty Korir', 'Joshua Oigara', 'Gideon Muriuki'],
                type: 'MCQ',
                correctAnswer: 'Betty Korir',
            },
            {
                question: 'What is Credit Bank’s mission statement?',
                choices: [
                    'To be the leading bank in Africa',
                    'To transform the financial industry landscape through innovative & relevant financial solutions',
                    'To provide the best customer service',
                    'To maximize shareholder value'
                ],
                type: 'MCQ',
                correctAnswer: 'To transform the financial industry landscape through innovative & relevant financial solutions',
            },
            {
                question: 'Which regulatory body oversees Credit Bank’s operations?',
                choices: ['Central Bank of Kenya', 'Kenya Revenue Authority', 'Nairobi Securities Exchange', 'Capital Markets Authority'],
                type: 'MCQ',
                correctAnswer: 'Central Bank of Kenya',
            },
            {
                question: 'What type of financial institution is Credit Bank classified as?',
                choices: ['Microfinance Bank', 'Commercial Bank', 'Investment Bank', 'Savings and Loan Association'],
                type: 'MCQ',
                correctAnswer: 'Commercial Bank',
            },
            {
                question: 'Which of the following is a core value of Credit Bank?',
                choices: ['Innovation', 'Tradition', 'Exclusivity', 'Conservatism'],
                type: 'MCQ',
                correctAnswer: 'Innovation',
            },
            {
                question: 'As of December 2022, what were Credit Bank’s total assets valued at?',
                choices: ['US$50 million', 'US$100 million', 'US$199.24 million', 'US$250 million'],
                type: 'MCQ',
                correctAnswer: 'US$199.24 million',
            }
        ]
    },
    {
        id: 2,
        topic: 'Credit Bank’s Products and Services',
        level: 'Beginner',
        totalQuestions: 13,
        perQuestionScore: 5,
        questions: [
            {
                question: 'What is the name of Credit Bank’s mobile banking application?',
                choices: ['CB Konnect', 'Credit Mobile', 'BankEasy', 'MobileCredit'],
                type: 'MCQ',
                correctAnswer: 'CB Konnect',
            },
            {
                question: 'Which account is specifically designed for Kenyans living abroad?',
                choices: ['Student Account', 'Senior Citizens Account', 'Nyumbani Diaspora Account', 'Business Account'],
                type: 'MCQ',
                correctAnswer: 'Nyumbani Diaspora Account',
            },
            {
                question: 'What additional account does a customer need to trade shares on the Nairobi Securities Exchange (NSE)?',
                choices: ['Fixed Deposit Account', 'Personal Savings Account', 'CDSC Account', 'Nyumbani Diaspora Account'],
                type: 'MCQ',
                correctAnswer: 'CDSC Account',
            },
            {
                question: 'What type of account offers secure, high-interest savings over a fixed term?',
                choices: ['CDSC Account', 'Fixed Deposit Account', 'Nyumbani Diaspora Account', 'Current Account'],
                type: 'MCQ',
                correctAnswer: 'Fixed Deposit Account',
            },
            {
                question: 'What type of loan does Credit Bank offer to help customers purchase vehicles?',
                choices: ['Personal Loan', 'Asset Finance', 'Mortgage Loan', 'Overdraft'],
                type: 'MCQ',
                correctAnswer: 'Asset Finance',
            },
            {
                question: 'Which service allows Credit Bank customers to access foreign currencies?',
                choices: ['Forex Rates', 'Fixed Deposit Account', 'Savings Account', 'Insurance Services'],
                type: 'MCQ',
                correctAnswer: 'Forex Rates',
            },
            {
                question: 'What is the purpose of the ‘Elev8HER’ program by Credit Bank?',
                choices: ['To support women’s businesses', 'To provide student loans', 'To offer agricultural loans', 'To support real estate investments'],
                type: 'MCQ',
                correctAnswer: 'To support women’s businesses',
            },
            {
                question: 'Which type of account is designed for investment groups?',
                choices: ['Personal Current Account', 'Investment Groups Account', 'Salary Account', 'Foreign Currency Account'],
                type: 'MCQ',
                correctAnswer: 'Investment Groups Account',
            },
            {
                question: 'What is the ‘CB Soko Account’ tailored for?',
                choices: ['Market traders', 'Students', 'Farmers', 'Corporate executives'],
                type: 'MCQ',
                correctAnswer: 'Market traders',
            },
            {
                question: 'Which card does Credit Bank offer for prepaid transactions?',
                choices: ['Konnect Prepaid Card', 'Gold Credit Card', 'Platinum Debit Card', 'Student Card'],
                type: 'MCQ',
                correctAnswer: 'Konnect Prepaid Card',
            },
            {
                question: 'What is the ‘Levitical Account’ designed for?',
                choices: ['Religious institutions', 'Students', 'Senior citizens', 'Corporate clients'],
                type: 'MCQ',
                correctAnswer: 'Religious institutions',
            },
            {
                question: 'Which service does Credit Bank offer to assist with international money transfers?',
                choices: ['Remittances', 'Local Transfers', 'Mobile Money', 'Cheque Clearing'],
                type: 'MCQ',
                correctAnswer: 'Remittances',
            },
            {
                question: 'In which of the following currencies can the Nyumbani Diaspora Account be operated in?',
                choices: ['USD', 'GBP', 'KES', 'Euro', 'All The Above'],
                type: 'MCQ',
                correctAnswer: 'All The Above',
            }
        ]
    },
    {
        id: 3,
        topic: 'Financial Literacy on International Money Transfers',
        level: 'Beginner',
        totalQuestions: 20,
        perQuestionScore: 5,
        questions: [
            {
                question: 'What is remittance?',
                choices: ['A payment for goods or services in another country', 'A type of currency used in international trade', 'A transfer of money sent by a migrant worker to their home country', 'A loan given by a bank to someone abroad'],
                type: 'MCQ',
                correctAnswer: 'A transfer of money sent by a migrant worker to their home country',
            },
            {
                question: 'What does KYC stand for in banking?',
                choices: ['Keep Your Cash', 'Know Your Customer', 'Kenyan Youth Credit', 'Key Yearly Charges'],
                type: 'MCQ',
                correctAnswer: 'Know Your Customer',
            },
            {
                question: 'Which of the following affects exchange rates?',
                choices: ['The time of day a transaction is made', 'The sender’s nationality', 'Inflation and economic stability', 'The number of bank branches in a country'],
                type: 'MCQ',
                correctAnswer: 'Inflation and economic stability',
            },
            {
                question: 'How long does an international money transfer usually take?',
                choices: ['Instantly', '2-5 business days', '1-2 weeks', '1 month'],
                type: 'MCQ',
                correctAnswer: '2-5 business days',
            },
            {
                question: 'What does SWIFT stand for in international banking?',
                choices: ['Secure Worldwide International Funds Transfer', 'Standard World Investment and Finance Transactions', 'Society for Worldwide Interbank Financial Telecommunication', 'Systematic Wealth Investment Fund Transfers'],
                type: 'MCQ',
                correctAnswer: 'Society for Worldwide Interbank Financial Telecommunication',
            },
            {
                question: 'Why is it recommended to use regulated financial institutions like Credit Bank for remittances?',
                choices: ['To avoid exchange rate fluctuations', 'To protect against fraud and money laundering', 'Because banks charge lower fees', 'To bypass government regulations'],
                type: 'MCQ',
                correctAnswer: 'To protect against fraud and money laundering',
            },
            {
                question: 'Which of these is a common reason for remittances?',
                choices: ['Sending money for business investments', 'Paying for international flights', 'Purchasing luxury items abroad', 'Funding global stock investments'],
                type: 'MCQ',
                correctAnswer: 'Sending money for business investments',
            },
            {
                question: 'Which factor increases the cost of international money transfers?',
                choices: ['Using mobile banking instead of cash transfers', 'High transaction fees and unfavorable exchange rates', 'Transferring money within the same country', 'Sending money in smaller amounts'],
                type: 'MCQ',
                correctAnswer: 'High transaction fees and unfavorable exchange rates',
            },
            {
                question: 'What is a correspondent bank?',
                choices: ['A bank that directly deals with foreign transactions', 'A local bank that handles cash deposits', 'A financial institution that processes international transfers on behalf of another bank', 'A bank that only serves corporate clients'],
                type: 'MCQ',
                correctAnswer: 'A financial institution that processes international transfers on behalf of another bank',
            },
            {
                question: 'Which of the following is the safest method for international money transfers?',
                choices: ['Sending cash via postal mail', 'Using a regulated bank or financial service provider', 'Giving money to a friend traveling home', 'Hiding money in a package'],
                type: 'MCQ',
                correctAnswer: 'Using a regulated bank or financial service provider like Credit Bank',
            },
            {
                question: 'Through which platform does Credit Bank facilitate international remittances?',
                choices: ['Western Union', 'Ria Money Transfer', 'PayPal', 'MoneyGram'],
                type: 'MCQ',
                correctAnswer: 'Ria Money Transfer',
            },
            {
                question: 'What is the name of Credit Bank’s mobile banking application?',
                choices: ['CB Konnect', 'Credit Mobile', 'BankEasy', 'MobileCredit'],
                type: 'MCQ',
                correctAnswer: 'CB Konnect',
            },
            {
                question: 'Which feature is NOT available on CB Konnect?',
                choices: ['Balance inquiry', 'Funds transfer', 'Flight booking', 'Bill payments'],
                type: 'MCQ',
                correctAnswer: 'Flight booking',
            },
            {
                question: 'How can customers access CB Konnect?',
                choices: ['Visiting a branch', 'Downloading the app', 'Calling customer service', 'Sending a text message'],
                type: 'MCQ',
                correctAnswer: 'Downloading the app',
            },
            {
                question: 'What is a key benefit of using CB Konnect?',
                choices: ['Higher interest rates', '24/7 account access', 'Free international calls', 'Complimentary insurance'],
                type: 'MCQ',
                correctAnswer: '24/7 account access',
            },
            {
                question: 'Which security feature is implemented in CB Konnect?',
                choices: ['Voice recognition', 'Multi-factor authentication', 'Captcha verification', 'Security questions'],
                type: 'MCQ',
                correctAnswer: 'Multi-factor authentication',
            },
            {
                question: 'Can customers apply for loans through CB Konnect?',
                choices: ['True', 'False'],
                type: 'MCQ',
                correctAnswer: 'True',
            },
            {
                question: 'Which type of account can be managed via CB Konnect?',
                choices: ['Savings Account', 'Current Account', 'Fixed Deposit Account', 'All of the above'],
                type: 'MCQ',
                correctAnswer: 'All of the above',
            },
            {
                question: 'Is CB Konnect available for both Android and iOS devices?',
                choices: ['Yes', 'No'],
                type: 'MCQ',
                correctAnswer: 'Yes',
            },
            {
                question: 'What should a customer do if they forget their CB Konnect password?',
                choices: ['Visit the nearest branch', 'Use the ‘Forgot Password’ feature', 'Call customer service', 'Create a new account'],
                type: 'MCQ',
                correctAnswer: 'Use the ‘Forgot Password’ feature',
            },
            {
                question: 'Which of the following is a benefit of CB Konnect?',
                choices: ['Real-time transaction alerts', 'Free credit reports', 'Discounted loan rates', 'Access to exclusive events'],
                type: 'MCQ',
                correctAnswer: 'Real-time transaction alerts',
            }
        ]
    },
    {
        id: 4,
        topic: 'Credit Bank’s Commitment to Community and Sustainability',
        level: 'Beginner',
        totalQuestions: 10,
        perQuestionScore: 5,
        questions: [
            {
                question: 'What initiative has Credit Bank launched to support women’s businesses?',
                choices: ['Elev8HER', 'Women in Business Fund', 'Female Entrepreneurs Program', 'Ladies First Initiative'],
                type: 'MCQ',
                correctAnswer: 'Elev8HER',
            },
            {
                question: 'Which sector does Credit Bank actively support through sustainable financing?',
                choices: ['Real Estate', 'Agriculture', 'Oil and Gas', 'Cryptocurrency'],
                type: 'MCQ',
                correctAnswer: 'Agriculture',
            },
            {
                question: 'What is the primary goal of the Elev8HER program?',
                choices: ['To provide digital banking solutions', 'To fund and mentor women entrepreneurs', 'To offer micro-loans to students', 'To build corporate offices'],
                type: 'MCQ',
                correctAnswer: 'To fund and mentor women entrepreneurs',
            },
            {
                question: 'How does Credit Bank contribute to financial literacy in Kenya?',
                choices: ['By offering free online financial courses', 'By conducting financial education workshops and mentorship programs', 'By providing interest-free loans', 'By limiting loan eligibility to educated clients'],
                type: 'MCQ',
                correctAnswer: 'By conducting financial education workshops and mentorship programs',
            },
            {
                question: 'Which environmental initiative is Credit Bank involved in?',
                choices: ['Plastic-Free Banking', 'Sustainable Green Financing', 'Digital-Only Banking', 'Paperless Currency Initiative'],
                type: 'MCQ',
                correctAnswer: 'Sustainable Green Financing',
            },
            {
                question: 'What is the primary focus of Credit Bank’s CSR (Corporate Social Responsibility) activities?',
                choices: ['Only profit maximization', 'Education, healthcare, and entrepreneurship development', 'Cryptocurrency trading', 'Sports sponsorship'],
                type: 'MCQ',
                correctAnswer: 'Education, healthcare, and entrepreneurship development',
            },
            {
                question: 'Which financial literacy program does Credit Bank run for SMEs and startups?',
                choices: ['Business Empowerment Hub', 'SME Finance Academy', 'Credit Bank Business Clinic', 'The Startup Booster'],
                type: 'MCQ',
                correctAnswer: 'Credit Bank Business Clinic',
            },
            {
                question: 'How does Credit Bank support youth entrepreneurship?',
                choices: ['By providing job placements', 'Through mentorship programs and startup financing', 'By offering tax-free accounts', 'By providing entertainment sponsorships'],
                type: 'MCQ',
                correctAnswer: 'Through mentorship programs and startup financing',
            },
            {
                question: 'Which of the following best describes Credit Bank’s commitment to sustainability?',
                choices: ['Investing only in corporate businesses', 'Supporting eco-friendly projects and financial inclusion', 'Prioritizing urban developments over rural growth', 'Focusing only on large-scale investors'],
                type: 'MCQ',
                correctAnswer: 'Supporting eco-friendly projects and financial inclusion',
            },
            {
                question: 'Which area does Credit Bank’s financial inclusion strategy primarily target?',
                choices: ['Large multinational corporations', 'Low-income individuals and SMEs', 'Government agencies only', 'International financial markets'],
                type: 'MCQ',
                correctAnswer: 'Low-income individuals and SMEs',
            }
        ]
    },
];