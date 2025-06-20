import api from './apiClient';

/**
 * Get all comments for a track
 * @param {string} trackId - The track ID
 * @returns {Promise} - The API response
 */
export const getTrackComments = async (trackId) => {
  try {
    const response = await api.get(`/api/tracks/${trackId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching track comments:', error);
    throw error;
  }
};

/**
 * Add a comment to a track
 * @param {string} trackId - The track ID
 * @param {object} commentData - The comment data
 * @returns {Promise} - The API response
 */
export const addTrackComment = async (trackId, commentData) => {
  try {
    const response = await api.post(`/api/tracks/${trackId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error adding track comment:', error);
    throw error;
  }
};

/**
 * Update a comment
 * @param {string} commentId - The comment ID
 * @param {object} commentData - The comment data to update
 * @returns {Promise} - The API response
 */
export const updateComment = async (commentId, commentData) => {
  try {
    const response = await api.put(`/api/comments/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

/**
 * Delete a comment
 * @param {string} commentId - The comment ID
 * @returns {Promise} - The API response
 */
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/api/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

/**
 * Add a reply to a comment
 * @param {string} commentId - The parent comment ID
 * @param {object} replyData - The reply data
 * @returns {Promise} - The API response
 */
export const addCommentReply = async (commentId, replyData) => {
  try {
    const response = await api.post(`/api/comments/${commentId}/replies`, replyData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment reply:', error);
    throw error;
  }
};

/**
 * Add a reaction to a comment
 * @param {string} commentId - The comment ID
 * @param {object} reactionData - The reaction data (type)
 * @returns {Promise} - The API response
 */
export const addCommentReaction = async (commentId, reactionData) => {
  try {
    const response = await api.post(`/api/comments/${commentId}/reactions`, reactionData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment reaction:', error);
    throw error;
  }
};

/**
 * Change the status of a comment
 * @param {string} commentId - The comment ID
 * @param {object} statusData - The status data
 * @returns {Promise} - The API response
 */
export const changeCommentStatus = async (commentId, statusData) => {
  try {
    const response = await api.put(`/api/comments/${commentId}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error changing comment status:', error);
    throw error;
  }
};