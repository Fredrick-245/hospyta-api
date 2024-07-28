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
  // Comments

  async createComment(
    body: { content: string },
    postId: number,
    userId: number,
  ) {
    try {
      const comment = await this.prisma.comment.create({
        data: {
          content: body.content,
          post: {
            connect: { id: postId },
          },
          author: {
            connect: { id: userId },
          },
        },
        include: {
          post: {
            select: {
              title: true,
              content: true,
            },
          },
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } catch (err) {
      return { message: 'Failed to create comment' };
    }
  }

  async getAllCommentsOnPost(postId: number) {
    try {
      const allcomments = await this.prisma.comment.findMany({
        where: {
          postId: postId,
        },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          likes: {
            select: {
              likedAt: true,
            },
          },
          dislikes: {
            select: {
              dislikedAt: true,
            },
          },
        },
      });
      return {
        totalComments: allcomments.length,
        comments: allcomments,
      };
    } catch (err) {
      return { message: 'Failed to load all comments' };
    }
  }

  async deleteComment(commentId: number) {
    try {
      const deletedComment = await this.prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
      return deletedComment;
    } catch (err) {
      return { message: 'Failed to delete comment' };
    }
  }

  async updateComment(body: { content: string }, commentId: number) {
    try {
      const updatedComment = await this.prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          content: body.content,
        },
      });
    } catch (err) {
      return { message: 'Failed to update comment' };
    }
  }

  async likeComment(commentId: number) {
    try {
      const comment = await this.prisma.commentLikes.create({
        data: {
          comment: {
            connect: {
              id: commentId,
            },
          },
        },
      });
      return comment;
    } catch (err) {
      return {
        message: 'Failed to add comment',
      };
    }
  }

  async deletelikeComment(commentLikeId: number) {
    try {
      const unlikedComment = await this.prisma.commentLikes.delete({
        where: {
          id: commentLikeId,
        },
      });
    } catch (err) {
      return { message: 'failed to unlike comment' };
    }
  }

  async getAllCommentLikes(commentId: number) {
    try {
      const allCommentLikes = await this.prisma.commentLikes.findMany({
        where: {
          commentId: commentId,
        },
      });
      return allCommentLikes;
    } catch (err) {
      return { message: 'Failed to get all comment likes on this post' };
    }
  }

  async disLikeComment(commentId: number) {
    try {
      const dislikeComment = await this.prisma.commentDislikes.create({
        data: {
          comment: {
            connect: { id: commentId },
          },
        },
      });
      return dislikeComment;
    } catch (err) {
      return { message: 'Failed to  dislike comment' };
    }
  }
  async getAllDislikesOnComment(commentId: number) {
    try {
      const dislikes = await this.prisma.commentDislikes.findMany({
        where: {
          commentId: commentId,
        },
        select: {
          dislikedAt: true,
        },
      });
      return {
        totalDislikes: dislikes.length,
        dislikes: dislikes,
      };
    } catch (err) {
      return { message: 'Failed to get all dislikes on this comment' };
    }
  }

  async deletedislikeOnComment(commentReplyId: number) {
    try {
      const dislikedComment = await this.prisma.commentDislikes.delete({
        where: {
          id: commentReplyId,
        },
      });
      return dislikedComment;
    } catch (err) {
      return { message: 'Failed to undislike comment' };
    }
  }

  // Comment Reply

  async createCommentReply(
    commentreply: { content: string },
    commentId: number,
    postId: number,
    userId: number,
  ) {
    try {
      const commentReply = await this.prisma.commentReply.create({
        data: {
          content: commentreply.content,
          comment: {
            connect: {
              id: commentId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          post: {
            connect: {
              id: postId,
            },
          },
        },
      });
      return commentReply;
    } catch (err) {
      return err;
    }
  }

  async getAllCommentsRepliesOnUser(userId: number) {
    try {
      const userCommentsReplies = await this.prisma.commentReply.findMany({
        where: {
          userId: userId,
        },
      });
      return {
        commentsTotal: userCommentsReplies.length,
        commentReplies: userCommentsReplies,
      };
    } catch (err) {
      return err;
    }
  }

  async getAllCommentRepliesOnPost(postId: number) {
    try {
      const allCommentRepliesOnPost = this.prisma.commentReply.findMany({
        where: { postId: postId },
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
              content: true,
            },
          },
          comment: {
            select: {
              content: true,
              author: true,
            },
          },
        },
      });
      return allCommentRepliesOnPost;
    } catch (err) {
      return err;
    }
  }

  async deleteCommentReply(replyCommentId: number) {
    try {
      const deletedCommentReply = await this.prisma.commentReply.delete({
        where: {
          id: replyCommentId,
        },
      });
      return { message: 'Comment reply deleted successfully' };
    } catch (err) {
      return err;
    }
  }
}
