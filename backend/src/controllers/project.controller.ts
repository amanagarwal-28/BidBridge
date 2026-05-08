import { Response, NextFunction } from 'express';
import * as projectService from '../services/project.service';
import { createProjectSchema, updateProjectSchema } from '../validations/project.validation';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const input = createProjectSchema.parse(req.body);
    const project = await projectService.createProject(req.user!.profileId, input);
    sendSuccess(res, 'Project created successfully', project, 201);
  } catch (err) { next(err); }
};

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await projectService.getProjects(req.query as Record<string, string>);
    sendSuccess(res, 'Projects fetched', result.projects, 200, result.meta);
  } catch (err) { next(err); }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) { sendError(res, 'Project not found', 404); return; }
    sendSuccess(res, 'Project fetched', project);
  } catch (err) { next(err); }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const input = updateProjectSchema.parse(req.body);
    const project = await projectService.updateProject(req.params.id, req.user!.profileId, input);
    sendSuccess(res, 'Project updated', project);
  } catch (err) { next(err); }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await projectService.deleteProject(req.params.id, req.user!.profileId);
    sendSuccess(res, 'Project deleted');
  } catch (err) { next(err); }
};

export const getMyProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await projectService.getClientProjects(req.user!.profileId, req.query as Record<string, string>);
    sendSuccess(res, 'Projects fetched', result.projects, 200, result.meta);
  } catch (err) { next(err); }
};

export const getRecommendedFreelancers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const freelancers = await projectService.getRecommendedFreelancers(req.params.id);
    sendSuccess(res, 'Recommended freelancers', freelancers);
  } catch (err) { next(err); }
};

export const closeProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.closeProject(req.params.id, req.user!.profileId);
    sendSuccess(res, 'Project closed', project);
  } catch (err) { next(err); }
};
