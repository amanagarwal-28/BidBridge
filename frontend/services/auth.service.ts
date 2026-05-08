import { api } from '@/lib/api';
import { ApiResponse, User } from '@/types';

export const signup = async (data: {
  email: string;
  password: string;
  role: 'CLIENT' | 'FREELANCER';
  firstName: string;
  lastName: string;
}) => {
  const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/signup', data);
  return res.data.data;
};

export const login = async (data: { email: string; password: string }) => {
  const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', data);
  return res.data.data;
};

export const me = async () => {
  const res = await api.get<ApiResponse<User>>('/auth/me');
  return res.data.data;
};
