import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signToken } from '../utils/jwt';
import { SignupInput, LoginInput } from '../validations/auth.validation';
import { ENV } from '../config/env';

export const signup = async (input: SignupInput) => {
  const hashedPassword = await bcrypt.hash(input.password, ENV.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      role: input.role,
    },
  });

  let profileId = '';

  if (input.role === 'CLIENT') {
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });
    profileId = client.id;
  } else {
    const freelancer = await prisma.freelancer.create({
      data: {
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });
    profileId = freelancer.id;
  }

  const token = signToken({ userId: user.id, role: user.role, profileId });
  return { token, user: { id: user.id, email: user.email, role: user.role, profileId } };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new Error('Invalid credentials');
  if (user.isBlocked) throw new Error('Account is blocked. Contact support.');

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  let profileId = '';
  if (user.role === 'CLIENT') {
    const client = await prisma.client.findUnique({ where: { userId: user.id } });
    profileId = client?.id || '';
  } else if (user.role === 'FREELANCER') {
    const freelancer = await prisma.freelancer.findUnique({ where: { userId: user.id } });
    profileId = freelancer?.id || '';
  } else {
    const admin = await prisma.admin.findUnique({ where: { userId: user.id } });
    profileId = admin?.id || '';
  }

  const token = signToken({ userId: user.id, role: user.role, profileId });
  return { token, user: { id: user.id, email: user.email, role: user.role, profileId } };
};
