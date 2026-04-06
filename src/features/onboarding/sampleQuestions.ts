export interface SampleQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  {
    id: 'sample-1',
    questionText: 'Which bone is the longest in the human body?',
    options: ['Humerus', 'Femur', 'Tibia', 'Fibula'],
    correctOptionIndex: 1,
    explanation: 'The femur (thigh bone) is the longest and strongest bone in the human body.',
  },
  {
    id: 'sample-2',
    questionText: 'What is the main function of red blood cells?',
    options: ['Fight infection', 'Carry oxygen', 'Clot blood', 'Produce hormones'],
    correctOptionIndex: 1,
    explanation: 'Red blood cells contain haemoglobin, which binds oxygen and transports it throughout the body.',
  },
  {
    id: 'sample-3',
    questionText: 'Which muscle is primarily responsible for breathing?',
    options: ['Intercostals', 'Diaphragm', 'Abdominals', 'Pectoralis major'],
    correctOptionIndex: 1,
    explanation:
      'The diaphragm contracts and flattens during inhalation, creating negative pressure that draws air into the lungs.',
  },
  {
    id: 'sample-4',
    questionText: 'How many vertebrae are in the cervical spine?',
    options: ['5', '7', '12', '9'],
    correctOptionIndex: 1,
    explanation:
      'The cervical spine consists of 7 vertebrae (C1-C7), supporting the head and allowing neck movement.',
  },
  {
    id: 'sample-5',
    questionText: 'What type of joint is the knee?',
    options: ['Ball and socket', 'Pivot', 'Hinge', 'Saddle'],
    correctOptionIndex: 2,
    explanation: 'The knee is primarily a hinge joint, allowing flexion and extension with limited rotation.',
  },
];
