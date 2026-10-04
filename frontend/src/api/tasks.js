import client from './client';

export const createTask = (data) => client.post('/tasks', data).then((r) => r.data.task);
export const getTask = (id) => client.get(`/tasks/${id}`).then((r) => r.data.task);
export const updateTask = (id, data) => client.patch(`/tasks/${id}`, data).then((r) => r.data.task);
export const moveTask = (id, data) => client.post(`/tasks/${id}/move`, data).then((r) => r.data);
export const deleteTask = (id) => client.delete(`/tasks/${id}`).then((r) => r.data);
