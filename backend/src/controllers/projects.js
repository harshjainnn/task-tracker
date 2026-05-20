import prisma from '../config/db.js';

/**
 * @desc    Create a new project (Admin Only)
 * @route   POST /api/projects
 * @access  Private (Admin)
 */
export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required.',
      });
    }

    const project = await prisma.$transaction(async (tx) => {
      const createdProject = await tx.project.create({
        data: {
          name,
          description,
        },
      });

      await tx.projectMember.create({
        data: {
          userId: req.user.id,
          projectId: createdProject.id,
        },
      });

      return createdProject;
    });

    const projectWithCounts = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    // Creator is automatically registered as an active member of this project.
    res.status(201).json({
      success: true,
      message: 'Project created successfully, and creator registered as member.',
      project: projectWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects (ADMIN gets all, MEMBER gets only assigned)
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req, res, next) => {
  try {
    const isSearchAdmin = req.user.role === 'ADMIN';

    // Query projects with appropriate roles filtering
    const projects = await prisma.project.findMany({
      where: isSearchAdmin ? {} : {
        members: {
          some: { userId: req.user.id },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project details, memberships, and tasks
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getSingleProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Query the project
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // 2. Validate authorizations (members can only view their projects)
    if (req.user.role !== 'ADMIN') {
      const isMember = project.members.some((member) => member.userId === req.user.id);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this project.',
        });
      }
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project info (Admin Only)
 * @route   PUT /api/projects/:id
 * @access  Private (Admin)
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required.',
      });
    }

    // Verify project existence
    const projectExists = await prisma.project.findUnique({
      where: { id },
    });

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Perform database updates
    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project & cascade details (Admin Only)
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin)
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const projectExists = await prisma.project.findUnique({
      where: { id },
    });

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Delete Project (Cascade configuration deletes associated ProjectMember and Task entries automatically)
    await prisma.project.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully along with all tasks and memberships.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add member to project (Admin Only)
 * @route   POST /api/projects/:id/members
 * @access  Private (Admin)
 */
export const addProjectMember = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const { email, userId } = req.body;

    if (!email && !userId) {
      return res.status(400).json({
        success: false,
        message: 'A userId or email is required to add a project member.',
      });
    }

    // 1. Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // 2. Find target user by id first, or email as a fallback for API compatibility.
    const targetUser = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: userId ? 'Selected user was not found.' : `No user found with the email address: ${email}`,
      });
    }

    // 3. Verify user is not already a member of the project
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: targetUser.id,
          projectId,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: 'This user is already a member of the project.',
      });
    }

    // 4. Create project membership relation
    const membership = await prisma.projectMember.create({
      data: {
        userId: targetUser.id,
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Member added to project successfully.',
      member: membership.user,
    });
  } catch (error) {
    next(error);
  }
};
