const Blog = require('../models/Blog');

// Create a blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, category, image } = req.body;
    const newBlog = new Blog({
      title,
      content,
      category,
      image,
      author: req.user.id
    });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username');
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return res.status(404).json({ error: 'Blog not found' });
  
      if (blog.author.toString() !== req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      blog.title = req.body.title;
      blog.content = req.body.content;
      blog.category = req.body.category;
      blog.image = req.body.image;
  
      await blog.save();
      res.json({ message: 'Blog updated successfully', blog });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

// Delete blog
exports.deleteBlog = async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return res.status(404).json({ error: 'Blog not found' });
  
      if (blog.author.toString() !== req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      await blog.deleteOne(); // or blog.remove() in older Mongoose
      res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  