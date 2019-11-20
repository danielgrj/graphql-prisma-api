import uuidv4 from 'uuid/v4';

const Mutation = {
  async createUser(parent, { data }, { prisma }, info) {
    const { email } = data;

    const isEmailTaken = await prisma.exists.User({ email });
    if (isEmailTaken) throw new Error('The email is already taken');

    return prisma.mutation.createUser({ data }, info);
  },

  async deleteUser(parent, { data }, { prisma }, info) {
    const { id } = data;

    const userExists = prisma.exists.User({ id });
    if (!userExists) throw new Error('User not found');

    return prisma.mutation.deleteUser({ where: { id } }, info);
  },

  async updateUser(parent, { data }, { prisma }, info) {
    const { id } = data;

    const userExists = prisma.exists.User({ id });
    if (!userExists) throw Error('User not found');

    return prisma.User.updateUser({ where: { id }, data }, info);
  },

  createPost(parent, { data }, { db, pubsub }, info) {
    const { author, title, body, published } = data;
    const userExists = db.users.some(user => user.id === author);

    if (!userExists) throw new Error("User doesn't exist");

    const post = {
      id: uuidv4(),
      title,
      body,
      published,
      author
    };

    db.posts.push(post);
    if (published)
      pubsub.publish(`post`, {
        post: {
          mutation: 'CREATED',
          data: post
        }
      });

    return post;
  },

  deletePost(args, { id }, { db, pubsub }, info) {
    const postIndex = db.posts.findIndex(post => post.id === id);

    if (postIndex === -1) throw new Error('Post not found');

    const [deletedPost] = db.posts.splice(postIndex, 1);
    db.comments = db.comments.filter(comment => comment.post !== id);

    if (deletedPost.published) {
      pubsub.publish(`post`, {
        post: {
          mutation: 'DELETED',
          data: deletedPost
        }
      });
    }

    return deletedPost;
  },

  updatePost(args, { id, data }, { db, pubsub }, info) {
    const { title, body, published } = data;
    const post = db.posts.find(post => post.id === id);
    const originalPost = { ...post };

    if (!post) throw new Error('Post not found');

    for (const key in data) {
      post[key] = data[key];
    }

    if (originalPost.published && !post.published) {
      pubsub.publish(`post`, {
        post: {
          mutation: 'DELETED',
          data: originalPost
        }
      });
    } else if (!originalPost.published && post.published) {
      pubsub.publish(`post`, {
        post: {
          mutation: 'CREATED',
          data: post
        }
      });
    } else if (post.published) {
      pubsub.publish(`post`, {
        post: {
          mutation: 'UPDATED',
          data: post
        }
      });
    }

    return post;
  },

  createComment(parent, { data }, { db, pubsub }, info) {
    const { author, text, post } = data;
    const userExists = db.users.some(user => user.id === author);
    const postExists = db.posts.some(currentPost => currentPost.id === post && currentPost.published);

    if (!userExists || !postExists) throw new Error('Incorrect user or post');

    const comment = {
      id: uuidv4(),
      author,
      post,
      text
    };

    db.comments.push(comment);
    pubsub.publish(`comment ${post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment
      }
    });

    return comment;
  },

  deleteComment(parent, { id }, { db, pubsub }, info) {
    const commentIndex = db.comments.findIndex(comment => comment.id === id);

    if (commentIndex === -1) throw new Error('Comment not found');

    const [comment] = db.comments.splice(commentIndex, 1);

    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: comment
      }
    });

    return comment;
  },

  updateComment(parent, { id, data }, { db, pubsub }, info) {
    const { text } = data;
    const comment = db.comments.find(comment => comment.id === id);

    if (!comment) throw new Error('Comment not found');

    if (text) {
      comment.text = text;
      pubsub.publish(`comment ${comment.post}`, {
        comment: {
          mutation: 'UPDATED',
          data: comment
        }
      });
    }

    return comment;
  }
};

export default Mutation;
