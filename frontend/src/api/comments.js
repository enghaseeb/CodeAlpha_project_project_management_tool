import client from './client';

export const getComments = (taskId) => client.get(`/tasks/${taskId}/comments`).then((r) => r.data.comments);
export const addComment = (taskId, text) =>
  client.post(`/tasks/${taskId}/comments`, { text }).then((r) => r.data.comment);
export const deleteComment = (id) => client.delete(`/tasks/comments/${id}`).then((r) => r.data);
