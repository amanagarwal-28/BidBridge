export type Role = 'CLIENT' | 'FREELANCER' | 'ADMIN';

export type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'CLOSED';
export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  role: Role;
  profileId: string;
  isActive?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  status: ProjectStatus;
  totalBids: number;
  createdAt: string;
  client?: { firstName: string; lastName: string; avatarUrl?: string; country?: string };
  skills?: { skill: Skill }[];
  _count?: { bids: number };
  contract?: { status: ContractStatus; freelancer?: { firstName: string; lastName: string; avatarUrl?: string } };
}

export interface Freelancer {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  country?: string;
  hourlyRate: number;
  avgRating: number;
  totalReviews: number;
  completedJobs: number;
  totalEarned: number;
  availableForWork?: boolean;
  skills?: { skill: Skill; proficiency: number }[];
  portfolio?: PortfolioItem[];
  reviews?: Review[];
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  avatarUrl?: string;
  country?: string;
  totalSpent: number;
}

export interface Bid {
  id: string;
  projectId: string;
  freelancerId: string;
  proposal: string;
  bidAmount: number;
  deliveryDays: number;
  status: BidStatus;
  createdAt: string;
  freelancer?: Freelancer;
  project?: Project;
}

export interface Contract {
  id: string;
  projectId: string;
  freelancerId: string;
  agreedAmount: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  project?: Project;
  freelancer?: Freelancer;
  client?: Client;
  milestones?: Milestone[];
  payments?: Payment[];
}

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
  status: MilestoneStatus;
}

export interface Payment {
  id: string;
  contractId: string;
  milestoneId?: string;
  amount: number;
  status: PaymentStatus;
  txRef?: string;
  paidAt?: string;
  createdAt: string;
  contract?: Contract;
  milestone?: Milestone;
}

export interface Review {
  id: string;
  contractId: string;
  clientId: string;
  freelancerId: string;
  clientRating: number;
  clientText?: string;
  freelancerRating?: number;
  freelancerText?: string;
  createdAt: string;
  client?: { firstName: string; lastName: string; avatarUrl?: string };
  contract?: Contract;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  projectUrl?: string;
  imageUrl?: string;
  category?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  entityId?: string;
  entityType?: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: { total?: number; page?: number; limit?: number; totalPages?: number };
}
