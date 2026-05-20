import prisma from '../config/db.js';

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const isValidEnum = (value, allowedValues) => !value || allowedValues.includes(value);

/**
 * @desc    Create a new task (Admin Only)
 * @route   POST /api/tasks
 * @access  Private (Admin)
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, assignedTo, projectId } = req.body;

    // 1. Inputs validation
    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Task title and project identifier are required.',
      });
    }

    if (!isValidEnum(priority, VALID_PRIORITIES)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be LOW, MEDIUM, or HIGH.',
      });
    }

    // 2. Validate Project existence
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'The referenced project does not exist.',
      });
    }

    // 3. Validate Assignee user existence (if assignedTo is provided)
    if (assignedTo) {
      const assigneeMembership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: assignedTo,
            projectId,
          },
        },
        include: {
          user: {
            select: { id: true },
          },
        },
      });

      if (!assigneeMembership) {
        return res.status(404).json({
          success: false,
          message: 'The assigned user must be a member of this project.',
        });
      }
    }

    // 4. Create Task in Prisma
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedTo: assignedTo || null,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Task created and assigned successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tasks (ADMIN gets all, MEMBER gets only assigned; supports filters)
 * @route   GET /api/tasks
 * @access  Private
 */
export const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, assignedTo, priority } = req.query;

    if (!isValidEnum(status, VALID_STATUSES)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be TODO, IN_PROGRESS, or COMPLETED.',
      });
    }

    if (!isValidEnum(priority, VALID_PRIORITIES)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be LOW, MEDIUM, or HIGH.',
      });
    }

    // Initialize query filter constraints
    const filter = {};

    // Enforce role scoping: Members only see tasks assigned directly to them
    if (req.user.role === 'ADMIN') {
      if (assignedTo) filter.assignedTo = assignedTo;
    } else {
      filter.assignedTo = req.user.id;
    }

    // Attach active query filters
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await prisma.task.findMany({
      where: filter,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
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
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task details or status
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Verify task existence
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // 2. Role-Based Access Control logic
    if (req.user.role !== 'ADMIN') {
      // Members are restricted to editing tasks assigned directly to them
      if (task.assignedTo !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Members can only update tasks assigned directly to them.',
        });
      }

      // Members are only allowed to modify the 'status' column
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Permission denied. Standard members are only permitted to update the task status.',
        });
      }

      const allowedMemberFields = ['status'];
      const disallowedFields = Object.keys(req.body).filter((key) => !allowedMemberFields.includes(key));
      if (disallowedFields.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied. Members can only update task status.',
        });
      }

      // Perform limited update
      if (!isValidEnum(status, VALID_STATUSES)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be TODO, IN_PROGRESS, or COMPLETED.',
        });
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Task status updated reactively.',
        task: updatedTask,
      });
    }

    // 3. Admin path: Full details modification allowed
    const { title, description, priority, status, dueDate, assignedTo, projectId } = req.body;

    if (!isValidEnum(status, VALID_STATUSES)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be TODO, IN_PROGRESS, or COMPLETED.',
      });
    }

    if (!isValidEnum(priority, VALID_PRIORITIES)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be LOW, MEDIUM, or HIGH.',
      });
    }

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (status !== undefined) dataToUpdate.status = status;
    if (dueDate !== undefined) dataToUpdate.dueDate = dueDate ? new Date(dueDate) : null;
    
    const targetProjectId = projectId || task.projectId;
    const targetAssigneeId = assignedTo !== undefined ? assignedTo : task.assignedTo;

    // Handle project reference validation before membership checks.
    if (projectId !== undefined) {
      const projectExists = await prisma.project.findUnique({ where: { id: projectId } });
      if (!projectExists) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
      dataToUpdate.projectId = projectId;
    }

    // Handle assignee/project membership validation. Tasks can only be assigned to users
    // who belong to the selected project.
    if (targetAssigneeId) {
      const assigneeMembership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: targetAssigneeId,
            projectId: targetProjectId,
          },
        },
      });

      if (!assigneeMembership) {
        return res.status(404).json({
          success: false,
          message: 'Assignee must be a member of the selected project.',
        });
      }
    }

    // Handle assignee update assignment
    if (assignedTo !== undefined) {
      dataToUpdate.assignedTo = assignedTo || null;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Task details updated successfully.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task (Admin Only)
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin)
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const taskExists = await prisma.task.findUnique({
      where: { id },
    });

    if (!taskExists) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Execute deletion
    await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
