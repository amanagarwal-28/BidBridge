import { api } from '@/lib/api';
import {
  ApiResponse, Project, Bid, Contract, Payment, Review,
  Notification, Skill, Freelancer, Client,
} from '@/types';

// PROJECTS
export const projectService = {
  list: async (params?: Record<string, string>) => {
    const res = await api.get<ApiResponse<Project[]>>('/projects', { params });
    return res.data;
  },
  get: async (id: string) => (await api.get<ApiResponse<Project>>(`/projects/${id}`)).data.data,
  create: async (data: Record<string, unknown>) => (await api.post<ApiResponse<Project>>('/projects', data)).data.data,
  update: async (id: string, data: Record<string, unknown>) => (await api.put<ApiResponse<Project>>(`/projects/${id}`, data)).data.data,
  delete: async (id: string) => (await api.delete(`/projects/${id}`)).data,
  myProjects: async (params?: Record<string, string>) => {
    const res = await api.get<ApiResponse<Project[]>>('/projects/me/list', { params });
    return res.data;
  },
  recommended: async (id: string) => (await api.get<ApiResponse<Freelancer[]>>(`/projects/${id}/recommended`)).data.data,
  close: async (id: string) => (await api.put(`/projects/${id}/close`)).data,
  bids: async (projectId: string) => (await api.get<ApiResponse<Bid[]>>(`/projects/${projectId}/bids`)).data.data,
  placeBid: async (projectId: string, data: { proposal: string; bidAmount: number; deliveryDays: number }) =>
    (await api.post<ApiResponse<Bid>>(`/projects/${projectId}/bids`, data)).data.data,
};

// BIDS
export const bidService = {
  myBids: async (params?: Record<string, string>) => {
    const res = await api.get<ApiResponse<Bid[]>>('/bids/me', { params });
    return res.data;
  },
  accept: async (id: string) => (await api.put(`/bids/${id}/accept`)).data,
  reject: async (id: string) => (await api.put(`/bids/${id}/reject`)).data,
  withdraw: async (id: string) => (await api.put(`/bids/${id}/withdraw`)).data,
};

// CONTRACTS
export const contractService = {
  get: async (id: string) => (await api.get<ApiResponse<Contract>>(`/contracts/${id}`)).data.data,
  myClient: async () => (await api.get<ApiResponse<Contract[]>>('/contracts/client/me')).data.data,
  myFreelancer: async () => (await api.get<ApiResponse<Contract[]>>('/contracts/freelancer/me')).data.data,
  createMilestone: async (id: string, data: { title: string; amount: number; dueDate: string; description?: string }) =>
    (await api.post(`/contracts/${id}/milestones`, data)).data.data,
  complete: async (id: string) => (await api.put(`/contracts/${id}/complete`)).data,
  updateMilestone: async (milestoneId: string, status: string) =>
    (await api.put(`/milestones/${milestoneId}/status`, { status })).data,
};

// PAYMENTS
export const paymentService = {
  initiate: async (contractId: string, milestoneId?: string) =>
    (await api.post<ApiResponse<Payment>>(`/payments/contract/${contractId}/initiate`, { milestoneId })).data.data,
  complete: async (id: string) => (await api.put(`/payments/${id}/complete`)).data,
  contractPayments: async (contractId: string) =>
    (await api.get<ApiResponse<Payment[]>>(`/payments/contract/${contractId}`)).data.data,
  clientSummary: async () =>
    (await api.get<ApiResponse<{ payments: Payment[]; totalSpent: number; pendingAmount: number }>>('/payments/client/me')).data.data,
  freelancerEarnings: async () =>
    (await api.get<ApiResponse<{ payments: Payment[]; totalEarned: number; pendingAmount: number; pendingPayments: Payment[] }>>('/payments/freelancer/me')).data.data,
};

// REVIEWS
export const reviewService = {
  create: async (contractId: string, data: { clientRating?: number; clientText?: string; freelancerRating?: number; freelancerText?: string }) =>
    (await api.post(`/reviews/${contractId}`, data)).data,
  forFreelancer: async (freelancerId: string) =>
    (await api.get<ApiResponse<Review[]>>(`/reviews/freelancer/${freelancerId}`)).data.data,
};

// USERS
export const userService = {
  getFreelancer: async (id: string) => (await api.get<ApiResponse<Freelancer>>(`/users/freelancers/${id}`)).data.data,
  updateMyFreelancer: async (data: Record<string, unknown>) =>
    (await api.put<ApiResponse<Freelancer>>('/users/freelancers/me', data)).data.data,
  updateMySkills: async (skills: { skillId: string; proficiency: number }[]) =>
    (await api.put('/users/freelancers/me/skills', { skills })).data,
  addPortfolio: async (data: Record<string, unknown>) =>
    (await api.post('/users/freelancers/me/portfolio', data)).data.data,
  deletePortfolio: async (id: string) => (await api.delete(`/users/freelancers/me/portfolio/${id}`)).data,
  getClient: async (id: string) => (await api.get<ApiResponse<Client>>(`/users/clients/${id}`)).data.data,
  updateMyClient: async (data: Record<string, unknown>) =>
    (await api.put<ApiResponse<Client>>('/users/clients/me', data)).data.data,
  skills: async () => (await api.get<ApiResponse<Skill[]>>('/users/skills')).data.data,
};

// NOTIFICATIONS
export const notificationService = {
  list: async (unreadOnly = false) =>
    (await api.get<ApiResponse<Notification[]>>(`/notifications?unread=${unreadOnly}`)).data.data,
  markRead: async (id: string) => (await api.put(`/notifications/${id}/read`)).data,
  markAllRead: async () => (await api.put('/notifications/read-all')).data,
};

// ADMIN
export const adminService = {
  stats: async () => (await api.get<ApiResponse<Record<string, unknown>>>('/admin/stats')).data.data,
  analytics: async () => (await api.get<ApiResponse<Record<string, unknown>>>('/admin/analytics')).data.data,
  users: async (params?: Record<string, string>) => {
    const res = await api.get<ApiResponse<Record<string, unknown>[]>>('/admin/users', { params });
    return res.data;
  },
  blockUser: async (id: string) => (await api.put(`/admin/users/${id}/block`)).data,
  unblockUser: async (id: string) => (await api.put(`/admin/users/${id}/unblock`)).data,
  deleteUser: async (id: string) => (await api.delete(`/admin/users/${id}`)).data,
  projects: async (params?: Record<string, string>) => {
    const res = await api.get<ApiResponse<Record<string, unknown>[]>>('/admin/projects', { params });
    return res.data;
  },
  fraudReports: async (params?: Record<string, string>) =>
    (await api.get<ApiResponse<Record<string, unknown>[]>>('/admin/fraud-reports', { params })).data,
  resolveReport: async (id: string) => (await api.put(`/admin/fraud-reports/${id}/resolve`)).data,
};
