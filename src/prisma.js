import { Prisma } from 'prisma-binding';

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466'
});

export default prisma;

// const createPostForUser = async (userId, data) => {
//   const userExists = await prisma.exists.User({ id: userId });

//   if (!userExists) throw new Error('User not found');

//   const post = await prisma.mutation.createPost(
//     {
//       data: {
//         ...data,
//         author: {
//           connect: {
//             id: userId
//           }
//         }
//       }
//     },
//     `{author { name email posts { id title body published }}}`
//   );

//   return post.author;
// };

// // createPostForUser('ck29m13an00b00773hnvzj3z', { title: 'Sometitle', body: 'Somebody', published: false })
// //   .then(data => console.log(JSON.stringify(data, undefined, 2)))
// //   .catch(e => console.log(e));

// const updatePostForUser = async (postId, data) => {
//   const postExist = await prisma.exists.Post({ id: postId });

//   if (!postExist) throw new Error('Post not found');

//   const post = await prisma.mutation.updatePost(
//     { where: { id: postId }, data },
//     `{ author { name email posts { id title body published }}}`
//   );

//   return post.author;
// };

// // updatePostForUser('ck29u559y00l107731z4wzvo', { published: false })
// //   .then(data => console.log(JSON.stringify(data, undefined, 2)))
// //   .catch(e => console.log(e));
