// These throw after setting a status code on `res`, so they must be called
// from inside an asyncHandler-wrapped controller.

export const ensureMember = (project, userId, res) => {
  const isMember = project.members.some((m) => m.user.toString() === userId.toString());
  if (!isMember) {
    res.status(403);
    throw new Error('You are not a member of this project');
  }
};

export const ensureAdmin = (project, userId, res) => {
  const member = project.members.find((m) => m.user.toString() === userId.toString());
  if (!member || !['owner', 'admin'].includes(member.role)) {
    res.status(403);
    throw new Error('You do not have permission to perform this action');
  }
};
