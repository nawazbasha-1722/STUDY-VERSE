// Placement Quiz Question Bank
export const QUIZ_BANK = {
  DBMS: [
    {
      question: 'Which of the following is NOT a characteristic of ACID properties in databases?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability', 'Concurrency'],
      correctAnswer: 4,
      explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.',
    },
    {
      question: 'What is a foreign key?',
      options: [
        'A key that uniquely identifies a row in its own table.',
        'A key that links to the primary key of another table.',
        'A key imported from a search engine database.',
        'A key used for table encrypting.',
      ],
      correctAnswer: 1,
      explanation: 'A foreign key is a column or group of columns in one table that references the primary key of another table.',
    },
  ],
  OS: [
    {
      question: 'What is thrashing in operating systems?',
      options: [
        'High CPU utilization with no active tasks.',
        'Extensive page swapping where the system spends more time paging than executing.',
        'The process of deleting junk files.',
        'A hardware failure due to temperature peaks.',
      ],
      correctAnswer: 1,
      explanation: 'Thrashing occurs when the virtual memory paging process is in a constant state of paging, leading to low system speed.',
    },
  ],
  CN: [
    {
      question: 'Which OSI layer is responsible for routing and logical addressing?',
      options: ['Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer'],
      correctAnswer: 2,
      explanation: 'The Network Layer (Layer 3) handles routing, logical addressing (IP), and forwarding packets.',
    },
  ],
  OOPS: [
    {
      question: 'What is polymorphism?',
      options: [
        'The ability of an object to take on many forms.',
        'The process of hiding implementation details.',
        'The process of inheriting features from a parent class.',
        'The wrapping of data and code into a single unit.',
      ],
      correctAnswer: 0,
      explanation: 'Polymorphism allows objects of different classes to be treated as objects of a common superclass, enabling method overriding.',
    },
  ],
  Aptitude: [
    {
      question: 'A train 120m long passes a telegraph post in 6 seconds. What is the speed of the train in km/h?',
      options: ['72 km/h', '60 km/h', '80 km/h', '90 km/h'],
      correctAnswer: 0,
      explanation: 'Speed = Distance / Time = 120m / 6s = 20 m/s. Convering to km/h: 20 * (18/5) = 72 km/h.',
    },
  ],
};

// Mock Coding Challenges
export const CODING_CHALLENGES = [
  {
    id: 'twosum',
    title: 'Two Sum',
    description: 'Write a function `twoSum(nums, target)` that returns the indices of the two numbers in the array `nums` that add up to the `target` value.',
    stub: {
      javascript: 'function twoSum(nums, target) {\n  // Write your code here\n}',
      python: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
    },
    testCases: [
      { input: 'twoSum([2, 7, 11, 15], 9)', expected: '[0, 1]' },
      { input: 'twoSum([3, 2, 4], 6)', expected: '[1, 2]' },
    ],
  },
  {
    id: 'palindrome',
    title: 'Valid Palindrome',
    description: 'Write a function `isPalindrome(s)` that returns `true` if the string `s` is a palindrome (ignoring casing and spaces), and `false` otherwise.',
    stub: {
      javascript: 'function isPalindrome(s) {\n  // Write your code here\n}',
      python: 'def isPalindrome(s):\n    # Write your code here\n    pass',
    },
    testCases: [
      { input: 'isPalindrome("racecar")', expected: 'true' },
      { input: 'isPalindrome("hello")', expected: 'false' },
    ],
  },
];
