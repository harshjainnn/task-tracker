import prisma from '../config/db.js';

const STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

const getTaskScope = (user) => {
  if (user.role === 'ADMIN') return {};
  return { assignedTo: user.id };
};

const getProjectScope = (user) => {
  if (user.role === 'ADMIN') return {};
  return {
    members: {
      some: { userId: user.id },
    },
  };
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const taskWhere = getTaskScope(req.user);
    const projectWhere = getProjectScope(req.user);
    const now = new Date();

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      groupedStatuses,
      recentProjects,
      recentTasks,
    ] = await Promise.all([
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ...taskWhere, status: { not: 'COMPLETED' } } }),
      prisma.task.count({
        where: {
          ...taskWhere,
          status: { not: 'COMPLETED' },
          dueDate: { lt: now },
        },
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: taskWhere,
        _count: { status: true },
      }),
      prisma.project.findMany({
        where: projectWhere,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
      }),
      prisma.task.findMany({
        where: taskWhere,
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          createdAt: true,
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const distribution = STATUSES.reduce((acc, status) => {
      const found = groupedStatuses.find((item) => item.status === status);
      acc[status] = found?._count?.status || 0;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
      recentProjects,
      recentTasks,
      taskDistribution: distribution,
    });
  } catch (error) {
    next(error);
  }
};
