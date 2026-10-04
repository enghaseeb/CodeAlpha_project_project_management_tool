import client from './client';

export const createList = (data) => client.post('/lists', data).then((r) => r.data.list);
export const updateList = (id, data) => client.patch(`/lists/${id}`, data).then((r) => r.data.list);
export const deleteList = (id) => client.delete(`/lists/${id}`).then((r) => r.data);
export const reorderLists = (projectId, orderedIds) =>
  client.post('/lists/reorder', { projectId, orderedIds }).then((r) => r.data);
