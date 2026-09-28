import { Employee, TaskType, TrainingClass, Shift, Assignment } from '../types';

export const DEFAULT_TASK_TYPES: TaskType[] = [
  {
    id: 'parking',
    name: 'Parking Duty',
    category: 'parking',
    color: 'amber',
    icon: 'car',
    description: 'Direct vehicles, monitor parking lot capacity, guide attendees to entrance'
  },
  {
    id: 'support',
    name: 'Classroom Support',
    category: 'support',
    color: 'blue',
    icon: 'users',
    description: 'Assist instructor, manage classroom materials, answer attendee questions, AV support'
  },
  {
    id: 'registration',
    name: 'Registration / Greeter',
    category: 'custom',
    color: 'emerald',
    icon: 'clipboard',
    description: 'Welcome arriving attendees, distribute name tags, check attendance roster'
  },
  {
    id: 'floater',
    name: 'Floater / Logistics',
    category: 'custom',
    color: 'purple',
    icon: 'shield',
    description: 'Handle unexpected operational needs, restock supplies, assist transitions'
  }
];

// Helper to get formatted dates relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const SAMPLE_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@company.org',
    phone: '(555) 234-5671',
    department: 'Facilities & Ops',
    qualifications: ['parking', 'support', 'floater'],
    maxShifts: 4,
    unavailableDates: [],
    notes: 'Experienced parking lead. First-aid certified.',
    active: true
  },
  {
    id: 'emp-2',
    name: 'Elena Rostova',
    email: 'elena.r@company.org',
    phone: '(555) 345-6782',
    department: 'HR & Training',
    qualifications: ['support', 'registration'],
    maxShifts: 5,
    unavailableDates: [],
    notes: 'Great at classroom moderation and AV setup.',
    active: true
  },
  {
    id: 'emp-3',
    name: 'David Chen',
    email: 'david.chen@company.org',
    phone: '(555) 456-7893',
    department: 'Logistics',
    qualifications: ['parking', 'floater'],
    maxShifts: 3,
    unavailableDates: [],
    notes: 'Prefers morning parking shifts.',
    active: true
  },
  {
    id: 'emp-4',
    name: 'Sarah Jenkins',
    email: 'sarah.j@company.org',
    phone: '(555) 567-8904',
    department: 'Customer Success',
    qualifications: ['support', 'registration', 'floater'],
    maxShifts: 4,
    unavailableDates: [],
    notes: 'Excellent with attendee check-ins.',
    active: true
  },
  {
    id: 'emp-5',
    name: 'James Morales',
    email: 'j.morales@company.org',
    phone: '(555) 678-9015',
    department: 'Security',
    qualifications: ['parking', 'floater'],
    maxShifts: 5,
    unavailableDates: [],
    notes: 'Traffic control trained.',
    active: true
  },
  {
    id: 'emp-6',
    name: 'Aisha Patel',
    email: 'aisha.p@company.org',
    phone: '(555) 789-0126',
    department: 'IT Support',
    qualifications: ['support', 'floater'],
    maxShifts: 4,
    unavailableDates: [],
    notes: 'Can assist with laptops and projector issues.',
    active: true
  },
  {
    id: 'emp-7',
    name: 'Robert Taylor',
    email: 'robert.t@company.org',
    phone: '(555) 890-1237',
    department: 'Operations',
    qualifications: ['parking', 'support'],
    maxShifts: 3,
    unavailableDates: [],
    notes: 'Available all week.',
    active: true
  },
  {
    id: 'emp-8',
    name: 'Maria Santos',
    email: 'maria.s@company.org',
    phone: '(555) 901-2348',
    department: 'Administration',
    qualifications: ['registration', 'support'],
    maxShifts: 3,
    unavailableDates: [],
    notes: 'Bilingual (English / Spanish).',
    active: true
  },
  {
    id: 'emp-9',
    name: 'Kevin O\'Connor',
    email: 'kevin.oc@company.org',
    phone: '(555) 012-3459',
    department: 'Fleet Services',
    qualifications: ['parking'],
    maxShifts: 4,
    unavailableDates: [],
    notes: 'Parking lot navigation specialist.',
    active: true
  },
  {
    id: 'emp-10',
    name: 'Rachel Kim',
    email: 'rachel.kim@company.org',
    phone: '(555) 123-4560',
    department: 'Talent Dev',
    qualifications: ['support', 'registration'],
    maxShifts: 4,
    unavailableDates: [],
    notes: 'Trainer assistant experience.',
    active: true
  },
  {
    id: 'emp-11',
    name: 'Brian Washington',
    email: 'brian.w@company.org',
    phone: '(555) 234-5672',
    department: 'Maintenance',
    qualifications: ['parking', 'floater'],
    maxShifts: 3,
    unavailableDates: [],
    notes: 'Morning availability preferred.',
    active: true
  },
  {
    id: 'emp-12',
    name: 'Zoe Martinez',
    email: 'zoe.m@company.org',
    phone: '(555) 345-6783',
    department: 'Communications',
    qualifications: ['support', 'registration', 'floater'],
    maxShifts: 3,
    unavailableDates: [],
    notes: 'Photography & orientation helper.',
    active: true
  }
];

export const getInitialData = () => {
  const day1 = getRelativeDate(2);
  const day2 = getRelativeDate(3);
  const day3 = getRelativeDate(4);

  const sampleClass: TrainingClass = {
    id: 'class-sample-1',
    title: 'Workforce Safety & Leadership Academy',
    location: 'Building C - North Auditorium & Lots A/B',
    startDate: day1,
    endDate: day3,
    description: '3-day comprehensive operational and compliance training session.',
    color: 'indigo'
  };

  const sampleShifts: Shift[] = [
    // Day 1 Morning
    {
      id: 'shift-1-m',
      classId: sampleClass.id,
      date: day1,
      title: 'Day 1 - Morning Session',
      startTime: '07:30',
      endTime: '12:00',
      taskRequirements: [
        { taskId: 'parking', taskName: 'Parking Duty', requiredCount: 3 },
        { taskId: 'support', taskName: 'Classroom Support', requiredCount: 2 },
        { taskId: 'registration', taskName: 'Registration / Greeter', requiredCount: 1 }
      ],
      notes: 'Heavy traffic expected between 7:30 - 8:30 AM.'
    },
    // Day 1 Afternoon
    {
      id: 'shift-1-a',
      classId: sampleClass.id,
      date: day1,
      title: 'Day 1 - Afternoon Session',
      startTime: '12:30',
      endTime: '17:00',
      taskRequirements: [
        { taskId: 'parking', taskName: 'Parking Duty', requiredCount: 2 },
        { taskId: 'support', taskName: 'Classroom Support', requiredCount: 2 }
      ],
      notes: 'Afternoon wrap-up and vehicle departures.'
    },
    // Day 2 Morning
    {
      id: 'shift-2-m',
      classId: sampleClass.id,
      date: day2,
      title: 'Day 2 - Morning Session',
      startTime: '07:30',
      endTime: '12:00',
      taskRequirements: [
        { taskId: 'parking', taskName: 'Parking Duty', requiredCount: 2 },
        { taskId: 'support', taskName: 'Classroom Support', requiredCount: 2 },
        { taskId: 'floater', taskName: 'Floater / Logistics', requiredCount: 1 }
      ]
    },
    // Day 2 Afternoon
    {
      id: 'shift-2-a',
      classId: sampleClass.id,
      date: day2,
      title: 'Day 2 - Afternoon Session',
      startTime: '12:30',
      endTime: '17:00',
      taskRequirements: [
        { taskId: 'parking', taskName: 'Parking Duty', requiredCount: 2 },
        { taskId: 'support', taskName: 'Classroom Support', requiredCount: 2 }
      ]
    },
    // Day 3 Morning
    {
      id: 'shift-3-m',
      classId: sampleClass.id,
      date: day3,
      title: 'Day 3 - Morning & Graduation',
      startTime: '08:00',
      endTime: '13:00',
      taskRequirements: [
        { taskId: 'parking', taskName: 'Parking Duty', requiredCount: 3 },
        { taskId: 'support', taskName: 'Classroom Support', requiredCount: 2 }
      ],
      notes: 'Graduation ceremony visitors expected in Lot A.'
    }
  ];

  return {
    employees: SAMPLE_EMPLOYEES,
    classes: [sampleClass],
    shifts: sampleShifts,
    assignments: [] as Assignment[],
    taskTypes: DEFAULT_TASK_TYPES,
    selectedClassId: sampleClass.id,
    selectedDate: day1
  };
};
