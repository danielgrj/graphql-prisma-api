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

    const userExists = await prisma.exists.User({ id });
    if (!userExists) throw new Error('User not found');

    return prisma.mutation.deleteUser({ where: { id } }, info);
  },

  async updateUser(parent, { data }, { prisma }, info) {
    const { id } = data;

    const userExists = await prisma.exists.User({ id });
    if (!userExists) throw Error('User not found');

    return prisma.User.updateUser({ where: { id }, data }, info);
  },

  async createPost(parent, { data }, { prisma }, info) {
    const { author: id } = data;

    const userExists = await prisma.exists.User({ id });
    if (!userExists) throw new Error('User not found');

    return prisma.Post.createPost({ ...data, author: { connect: { id } } }, info);
  },

  async deletePost(args, { data }, { prisma }, info) {
    const { id } = data;

    const postExists = await prisma.exists.Post({ id });
    if (!postExists) throw new Error('Post not found');

    return prisma.Post.deletePost({ where: { id } }, info);
  },

  async updatePost(args, { data }, { prisma }, info) {
    const { id } = data;

    const postExists = await prisma.exists.User({ id });
    if (!postExists) throw new Error('Post not found');

    return prisma.Post.updatePost({ where: { id }, data }, info);
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
