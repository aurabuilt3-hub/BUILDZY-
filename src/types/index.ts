export type ServiceCategory = 
  | 'labour'
  | 'contractors'
  | 'architects'
  | 'plumbing'
  | 'electrical'
  | 'painting'
  | 'carpentry'
  | 'renovation'
  | 'materials';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  startingPrice: number;
  priceUnit: string;
  iconName: string;
  description: string;
  popular?: boolean;
  estimatedTime: string;
}

export interface Professional {
  id: string;
  name: string;
  title: string;
  trade: string;
  companyName?: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  hourlyRate?: number;
  dailyRate?: number;
  projectRateRange?: string;
  area: string;
  availability: 'Available Today' | 'Available This Week' | 'Booked (Next Week)';
  avatar: string;
  tier: 'Budget-friendly' | 'Balanced' | 'Premium';
  verified: boolean;
  skills: string[];
  completedProjects: number;
  phone: string;
  email: string;
  bio: string;
  quotationSample?: {
    scope: string[];
    exclusions: string[];
    materialsIncluded: boolean;
    materialsDetails: string;
    durationEstimate: string;
    warranty: string;
    indicativePrice: number;
  };
}

export interface Booking {
  id: string;
  serviceName: string;
  category: string;
  professionalName: string;
  professionalId?: string;
  professionalTrade: string;
  date: string;
  timeSlot: string;
  location: string;
  workerCount: number;
  durationValue: number;
  durationUnit: 'hours' | 'days';
  totalPrice: number;
  status: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  requirements: string;
  createdAt: string;
  liveStep?: number; // 1: Assigned, 2: On The Way, 3: Arrived, 4: In Progress, 5: Completed
}

export interface ProjectTask {
  id: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo: string;
  dueDate: string;
  category: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  percentage: number;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  targetDate: string;
  payoutAmount: number;
  isPaid: boolean;
}

export interface ProjectMaterial {
  id: string;
  name: string;
  quantity: string;
  estimatedCost: number;
  status: 'Requisitioned' | 'Ordered' | 'Delivered' | 'Installed';
  supplier: string;
}

export interface ProjectProgressPhoto {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  milestoneTitle: string;
}

export interface ProjectFeedback {
  id: string;
  authorName: string;
  rating: number;
  category: 'Quality of Work' | 'Timeliness' | 'Communication' | 'Budget Adherence' | 'Overall Experience';
  comment: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  type: string;
  location: string;
  startDate: string;
  estimatedCompletion: string;
  progressPercentage: number;
  budgetEstimated: number;
  agreedQuotation: number;
  amountSpent: number;
  contractor: {
    name: string;
    company: string;
    avatar: string;
    phone: string;
    rating: number;
  };
  assignedWorkersCount: number;
  tier: 'Budget-friendly' | 'Balanced' | 'Premium';
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  materials: ProjectMaterial[];
  photos: ProjectProgressPhoto[];
  feedbacks?: ProjectFeedback[];
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed';
}
