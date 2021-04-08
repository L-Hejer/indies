// Require express
const express = require('express');

const Router = express.Router();

// Require User Model
const User = require('../../models/User');

// Require Profile Model
const Profile = require('../../models/Profile');

// Require post model
const Post = require('../../models/Post');

const isAuth = require('../../middleWares/isAuth');
const authAdmin = require('../../middleWares/authAdmin');

//@route    POST api/post
//@desc     Create post
///@access  Private
Router.post('/', isAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  const { postTitle, postDescription, images, category } = req.body;
  try {
    const newPost = await new Post({
      user: req.user.id,
      name: user.name,
      avatar: user.avatar,
      postTitle,
      postDescription,
      images,
      category,
    });
    const post = await newPost.save();
    res.status(200).send({ msg: 'Post Created', post });
  } catch (error) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

//@route    Delete api/post/:id
//@desc     Delete post
///@access  Private
Router.delete('/:id', isAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);

    // Check for post
    if (!req.params.id || !post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check for user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete post
    await post.remove();

    res.status(200).send({ msg: 'Post deleted' });
  } catch (error) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

//@route    PUT api/post/editPost/:id
//@desc     Edit a post
///@access  Private
Router.put('/editPost/:_id', isAuth, async (req, res) => {
  const { _id } = req.params;

  try {
    const postToEdit = await Post.findOneAndUpdate(
      { user: req.user._id, _id },
      { $set: req.body },
      { new: true }
    );

    const post = await postToEdit.save();

    res.status(200).send({ msg: 'Post updated', post });
  } catch (error) {
    res.status(500).send({ msg: 'Server Error' });
    console.log(error);
  }
});

//@route    GET api/post/:_id
//@desc     Get post by user id
///@access  Private
Router.get('/:id', isAuth, async (req, res) => {
  try {
    const post = await Post.findOne({
      user: req.params.id,
    });
    // Check for post
    if (!post) {
      return res.status(400).json({ msg: 'Post not found' });
    }
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send({ msg: 'Server Error' });
  }
});

//@route    GET api/post/allPosts
//@desc     Get all posts
///@access  Public
Router.get('/allPosts/posts', isAuth, authAdmin, async (req, res) => {
  try {
    const posts = await Post.find().sort({ PostCreationDate: -1 });

    res.send(posts);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: 'Server Error', error });
  }
});

//@route    POST api/post/comment/:id
//@desc     Comment a post
///@access  Private
Router.post('/comment/:id', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    const newComment = {
      commentText: req.body.commentText,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    };

    //add the new comment to the post
    post.comments.unshift(newComment);

    //save the post with comments
    await post.save();

    res.send(post.comments);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: 'Server Error', error });
  }
});

//@route    PUT api/post/comment/editComment/:id
//@desc     Edit a comment
///@access  Private
Router.put('/comment/editComment/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
  } catch (error) {}
});

//@route    DELETE api/post/comment/:id/:comment_id
//@desc     Delete a comment by post id && comment id
///@access  Private
Router.delete('/comment/:id/:comment_id', isAuth, async (req, res) => {
  try {
    // Find post
    const post = await Post.findById(req.params.id);
    // Pull out comment
    const comment = await post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.id)
      .indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.send(post.comments);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: 'Server Error', error });
  }
});

module.exports = Router;
