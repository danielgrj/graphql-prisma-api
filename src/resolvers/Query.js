const Query = {
  users(parent, { query }, { prisma }, info) {
    if (!query) return prisma.query.users(null, info);

    const opsArgs = {
      where: {
        OR: [
          {
            name_contains: query
          },
          { email_contains: query }
        ]
      }
    };

    return prisma.query.users(opsArgs, info);
  },

  posts(parent, { query }, { prisma }, info) {
    if (!query) return prisma.query.posts(null, info);

    const opsArgs = {
      where: {
        OR: [
          {
            title_contains: query
          },
          { body_contains: query }
        ]
      }
    };

    return prisma.query.posts(opsArgs, info);
  },

  comments(parent, { query }, { prisma }, info) {
    if (!query) return prisma.query.comments(null, info);

    const opsArgs = {
      where: {
        text_contains: query
      }
    };

    return prisma.query.comments(opsArgs, info);
  },

  me() {
    return {
      id: '123902',
      name: 'Daniel',
      email: 'daniel@example.com'
    };
  },
  post() {
    return {
      id: 'dasdas',
      title: 'Some title',
      body: 'Awesome body',
      published: false
    };
  }
};

export default Query;
