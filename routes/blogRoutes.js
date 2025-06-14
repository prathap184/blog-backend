const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog'); // ✅ MOVE THIS TO THE TOP
const auth = require('../middleware/authMiddleware');

const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');

// 🔓 Public Routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// 🔒 Protected Routes
router.post('/', auth, createBlog);
router.put('/:id', auth, updateBlog);
router.delete('/:id', auth, deleteBlog);

// ❤️ Like toggle
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const userId = req.user.id;
    const alreadyLiked = blog.likes.includes(userId);

    if (alreadyLiked) {
      blog.likes = blog.likes.filter(id => id.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();
    res.json({ likes: blog.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💬 Comment add
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    blog.comments.push({
      user: req.user.id,
      text,
      createdAt: new Date()
    });

    await blog.save();
    res.status(201).json({ message: 'Comment added', comments: blog.comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Edit a comment
router.put('/:blogId/comment/:commentId', auth, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Comment text is required' });
  
      const blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json({ error: 'Blog not found' });
  
      const comment = blog.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ error: 'Comment not found' });
  
      if (comment.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
  
      comment.text = text;
      await blog.save();
  
      res.json({ message: 'Comment updated', comment });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Delete a comment
 // Delete a comment
router.delete('/:blogId/comment/:commentId', auth, async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json({ error: 'Blog not found' });
  
      const comment = blog.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ error: 'Comment not found' });
  
      if (comment.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
  
      // 🔧 SAFELY remove comment from array
      blog.comments = blog.comments.filter(c => c._id.toString() !== req.params.commentId);
      await blog.save();
  
      res.json({ message: 'Comment deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.get('/user/:username', async (req, res) => {
    try {
      const { username } = req.params;
  
      const blogs = await Blog.find()
        .populate('author', 'username')
        .sort({ createdAt: -1 });
  
      // ✅ Manually filter after populating
      const userBlogs = blogs.filter(blog => blog.author?.username === username);
  
      res.json(userBlogs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.get('/user/:username', async (req, res) => {
    try {
      const { username } = req.params;
  
      const blogs = await Blog.find()
        .populate('author', 'username')
        .sort({ createdAt: -1 });
  
      // ✅ Manually filter after populating
      const userBlogs = blogs.filter(blog => blog.author?.username === username);
  
      res.json(userBlogs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
    
  
  
module.exports = router;
