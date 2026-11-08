const Task = require('../models/Task');

// @desc    Get all tasks with filters
// @route   GET /api/v1/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    if (req.user.role === 'sales_executive' && req.query.onlyMine === 'true') {
      query.assignedTo = req.user._id;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    const totalCount = await Task.countDocuments();
    const pendingCount = await Task.countDocuments({ status: 'Pending' });
    const inProgressCount = await Task.countDocuments({ status: 'In Progress' });
    const completedCount = await Task.countDocuments({ status: 'Completed' });

    res.status(200).json({
      success: true,
      count: tasks.length,
      summary: {
        total: totalCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount
      },
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, status, dueDate, relatedTo } = req.body;

    const task = await Task.create({
      title,
      description: description || '',
      assignedTo: assignedTo || req.user._id,
      priority: priority || 'Medium',
      status: status || 'Pending',
      dueDate,
      relatedTo: relatedTo || { modelType: 'General' },
      createdBy: req.user._id
    });

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (status === 'Completed' && task.status !== 'Completed') {
      req.body.completedAt = new Date();
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedTo', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

