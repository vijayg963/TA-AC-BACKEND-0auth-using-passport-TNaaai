const express = require('express');
var router = express.Router();

// const session = require('express-session');
// var mongoose = require('mongoose');

let Article = require('../models/article');
let Comment = require('../models/comments');
let auth = require('../middlewares/auth');
const { findById } = require('../models/article');

router.get('/new', async (req, res) => {
  // console.log(req.session.userId);
  if (req.user) {
    return res.render('addarticle');
  } else {
    return res.redirect('/users/login');
  }
});

router.get('/', async (req, res) => {
  try {
    let allArticles = await Article.find({});
    res.render('articles', { articles: allArticles });
  } catch (err) {
    res.redirect('/articles/new');
  }
});

// post a articles and redirect to all the articles page
router.post('/', async (req, res, next) => {
  try {
    req.body.author = req.user._id;
    let createdArticle = await Article.create(req.body);
    if (createdArticle) {
      res.redirect('/articles');
    }
  } catch (err) {
    res.redirect('/article/new');
  }
});

//get a article  detailed article by a single artilce id
router.get('/:slug', async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug: slug })
      .populate('author')
      .populate('comments');
    if (article) {
      res.render('detailedArticle', { article: article });
    }
  } catch (err) {
    // console.log("Got an error inside  the get a single article page ");
    res.redirect('/articles');
  }
});

// /articles/<%=article.slug%>/comment

router.post('/:id/:slug/comment', auth.isUserLogged, async (req, res) => {
  let id = req.params.id;
  let slug = req.params.slug;
  try {
    req.body.authorId = req.user._id;
    req.body.articleId = id;
    let comment = await Comment.create(req.body);
    let updatedcommentInArticle = await Article.findByIdAndUpdate(id, {
      $push: { comments: comment._id },
    });
    res.redirect('/articles/' + slug);
  } catch (err) {
    res.redirect('/articles/' + slug);
  }
});

// adding  the like functionality here
// articles/<%=article.slug%>/like
router.get('/:slug/like', auth.isUserLogged, (req, res, next) => {
  let slug = req.params.slug;
  Article.findOneAndUpdate(
    { slug: slug },
    { $inc: { likes: 1 } },
    { new: true },
    (err, article) => {
      if (err) return next(err);
      console.log('This is the updated article ' + article);
      res.redirect(`/articles/${slug}`);
    }
  );
});

//   dislike  the article
router.get('/:slug/dislike', async (req, res) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug: slug });
    if (article.likes > 0) {
      let decreseLike = await Article.findByIdAndUpdate(
        article._id,
        { $inc: { likes: -1 } },
        { new: true }
      );
      console.log(decreseLike);
      res.redirect('/articles/' + slug);
    }
    res.redirect('/articles/' + slug);
  } catch (err) {
    res.redirect('/articles/' + slug);
  }
});

// Delete the article only when if the user who have created the article has logged in  right now
// other users can not delete the article because we are comparing the user id who have created the article
// with the user id who have logged in right now
router.get('/:slug/delete', auth.isUserLogged, async (req, res) => {
  try {
    let slug = req.params.slug;
    let article = await Article.findOne({ slug: slug }).populate('author');
    let authorId = article.author._id.toString();
    let userId = req.user._id.toString();
    if (authorId == userId) {
      let deleteArticle = await Article.findOneAndDelete(
        { slug: slug },
        { new: true }
      );
      if (deleteArticle) {
        return res.redirect('/articles');
      }
    }
    return res.redirect('/articles');
  } catch (err) {
    res.redirect('/articles');
  }
});

// Get a form to edit the  only when if the user is looged in right now is the author of that article
router.get('/:slug/edit', auth.isUserLogged, async (req, res) => {
  let slug = req.params.slug;

  try {
    let article = await Article.findOne({ slug: slug }).populate('author');
    let authorId = article.author._id.toString();
    let userId = req.user._id.toString();
    if (authorId === userId) {
      let article = await Article.findOne({ slug: slug });
      return res.render('editarticle', { article: article });
    }
    return res.redirect('/articles');
  } catch (err) {
    res.redirect('/articles/' + slug);
  }
});
// now update  the article
router.post('/:slug/edit', auth.isUserLogged, async (req, res) => {
  let slug = req.params.slug;
  let article = await Article.findOne({ slug: slug }).populate('author');
  let authorId = article.author._id.toString();
  let userId = req.user._id.toString();
  try {
    if (authorId === userId) {
      let updatedArticle = await Article.findOneAndUpdate(
        { slug: slug },
        req.body,
        { new: true }
      );
      if (updatedArticle) {
        return res.redirect('/articles/' + slug);
      }
    }
    return res.redirect('/articles');
  } catch (err) {
    res.redirect('/articles');
  }
});

//show a form to edit the  comment only the author who have created the  comment
// is  able to delete that comment no other user can delete the comment
router.get('/comment/:id/edit', async (req, res) => {
  let id = req.params.id;
  try {
    let comment = await Comment.findById(id).populate('articleId');
    let authorId = comment.authorId.toString();
    let userId = req.user._id.toString();
    if (comment && authorId === userId) {
      res.render('editcomment', { comment: comment });
    }
    return res.redirect('/articles/' + comment.articleId.slug);
  } catch (err) {
    res.redirect('/articles');
  }
});

// only the user who creted that comment can delete that comment other user are re
router.post('/comment/:id/', async (req, res) => {
  let id = req.params.id;
  try {
    let comment = await Comment.findByIdAndUpdate(id, req.body, { new: true });
    let populatedComment = comment.findById(id).populate('articleId');
    if (comment && populatedComment) {
      res.redirect('/articles/' + populatedComment.articleId.slug);
    }
  } catch (err) {
    res.redirect('/articles');
  }
});

//Delete the comment
router.get('/comment/:id/delete', async (req, res) => {
  let id = req.params.id;
  try {
    let populatedComment = await Comment.findById(id).populate('articleId');
    if (populatedComment) {
      let authorId = populatedComment.authorId.toString();
      let userId = req.user._id.toString();
      if (authorId === userId) {
        let comment = await Comment.findByIdAndDelete(id, { new: true });
        if (comment)
          return res.redirect('/articles/' + populatedComment.articleId.slug);
      }
    }
    return res.redirect('/articles/' + populatedComment.articleId.slug);
  } catch (err) {
    res.redirect('/articles');
  }
});

module.exports = router;
