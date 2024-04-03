// controllers/comments.js
import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId }).populate('creator', 'name');
    res.status(200).json(comments);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Create a new comment on a post
export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  if (!mongoose.Types.ObjectId.isValid(postId)) return res.status(404).send('No post with that id');

  try {
    const newComment = new Comment({ text, creator: req.userId, post: postId });
    await newComment.save();

    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } }, { new: true });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No comment with that id');

  const updatedComment = { text, _id: id };

  await Comment.findByIdAndUpdate(id, updatedComment, { new: true });

  res.json(updatedComment);
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No comment with that id');

  await Comment.findByIdAndRemove(id);

  res.json({ message: 'Comment deleted successfully.' });
};