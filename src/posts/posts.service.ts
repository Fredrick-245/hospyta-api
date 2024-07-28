import {
  Injectable,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Post } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { last } from '../../node_modules/rxjs/dist/esm5/internal/operators/last';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(post: any, id: number) {
    // Create Post
    try {
      const createdPost = await this.prisma.post.create({
        data: {
          title: post.title,
          content: post.content,
          author: {
            connect: { id: id },
          },
        },
        include: {
          author: {
            select: {
              id: false,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return createdPost;
    } catch (err) {
      if (err instanceof PrismaClientValidationError) {
        throw new HttpException('Invalid data', HttpStatus.BAD_REQUEST);
      }
      return err;
    }

    // Return Post
  }

  async updatePost(body: UpdatePostDto, postId: number) {
    // Find post and update
    try {
      const updatedPost = await this.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          title: body.title,
          content: body.content,
        },
      });
      return updatedPost;
    } catch (err) {
      if (err instanceof PrismaClientValidationError) {
        throw new HttpException('Invalid data', HttpStatus.BAD_REQUEST);
      }
      return 'Unable to update post please try again later';
    }

    // Return Post
  }
  async deletePost(postId: number) {
    // Find the post and delete it
    const deletedPost = this.prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return {
      message: 'Post deleted successfully',
      deletedPost: deletedPost,
    };
  }
  async getAllPosts() {
    return await this.prisma.post.findMany({
      include: {
        author: {
          select: {
            id: false,
            lastName: true,
            firstName: true,
          },
        },
      },
    });
  }

  async getAllPostByUser(id: number) {
    try {
      const posts = await this.prisma.post.findMany({
        where: {
          authorId: id,
        },
      });
      return posts;
    } catch (error) {
      return error;
    }
  }

  async getSinglePost(id: number) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          id: id,
        },
        include: {
          comments: true,
          likes: true,
          dislikes: true,
        },
      });
      return post;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  async likePost(userId: number, postId: number) {
    // If user has liked, return
    const likesOnSinglePost = await this.prisma.like.findFirst({
      where: {
        postId: postId,
        userId: userId,
      },
    });
    if (likesOnSinglePost) {
      throw new ForbiddenException('Can not like  again');
    }

    const like = await this.prisma.like.create({
      data: {
        user: {
          connect: { id: userId },
        },
        post: {
          connect: { id: postId },
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        post: {
          select: {
            title: true,
          },
        },
      },
    });
    return like;
  }

  async getPostLike(postId: number) {
    const likes = await this.prisma.like.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: {
          select: {
            firstName: true,
          },
        },
        post: {
          select: {
            title: true,
          },
        },
      },
    });
    if (!likes) {
    }
    return {
      totalLikes: likes.length,
      likes: likes,
    };
  }
  async dislikePost(userId: number, postId: number) {
    // Check if dislike exists
    const dislike = await this.prisma.dislike.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });
    if (dislike) {
      throw new ForbiddenException('Can not dislike twice!!');
    }
    // Check if like exist
    const like = await this.prisma.like.findFirst({
      where: {
        postId: postId,
        userId: userId,
      },
    });
    if (like) {
      await this.prisma.like.delete({
        where: {
          id: like.id,
        },
      });
    }
    // create dislike
    const createdDislike = await this.prisma.dislike.create({
      data: {
        post: {
          connect: { id: postId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
          },
        },
      },
    });
    return createdDislike;
  }

  async allDislikeOnPost(postId: number) {
    const dislikes = await this.prisma.dislike.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: {
          select: {
            firstName: true,
          },
        },
      },
    });
    return {
      totalDislike: dislikes.length,
      dislikes: dislikes,
    };
  }

  async createCommentReply(
    commentreply: { content: string },
    commentId: number,
  ) {
    const commentReply = await this.prisma.commentReply.create({
      data: {
        content: commentreply.content,
        comment: {
          connect: {
            id: commentId,
          },
        },
      },
    });
  }
}
