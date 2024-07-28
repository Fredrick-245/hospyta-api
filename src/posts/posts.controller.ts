import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorators';
import { User } from '@prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  // Posts
  @UseGuards(JwtGuard)
  @Post()
  createPost(@GetUser() user: User, @Body() post: CreatePostDto) {
    return this.postsService.createPost(post, user.id);
  }

  @UseGuards(JwtGuard)
  @Get('all')
  getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @UseGuards(JwtGuard)
  @Get('')
  getSinglePost(@Query('id', ParseIntPipe) id: number) {
    return this.postsService.getSinglePost(id);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  getPostByUser(@GetUser() user: User) {
    console.log(user);
    return this.postsService.getAllPostByUser(user.id);
  }
  // delete a post
  @UseGuards(JwtGuard)
  @Delete()
  deletePost(@Query('postid', ParseIntPipe) postId: number) {
    return this.postsService.deletePost(postId);
  }

  // update a post

  @UseGuards(JwtGuard)
  @Patch()
  updatePost(
    @Body() body: UpdatePostDto,
    @Query('postId', ParseIntPipe) postId: number,
  ) {
    return this.postsService.updatePost(body, postId);
  }
  // like a post
  @UseGuards(JwtGuard)
  @Post('like')
  likePost(@GetUser() user: User, @Query('id', ParseIntPipe) postId: number) {
    return this.postsService.likePost(user.id, postId);
  }
  // unlike a post
  @UseGuards(JwtGuard)
  @Get('like')
  getPostLike(@Query('id', ParseIntPipe) postId: number) {
    return this.postsService.getPostLike(postId);
  }
  // Comments
  // Comment on a post
  @UseGuards(JwtGuard)
  @Post()
  async createPostComment(
    @GetUser() user: User,
    @Body() body: { content: string },
    @Query('postId', ParseIntPipe) postId: number,
  ) {
    return this.postsService.createComment(body, user.id, postId);
  }
  // delete comment on a post
  @UseGuards(JwtGuard)
  @Delete('comments')
  async deleteCommentOnPost(
    @Query('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.postsService.deleteComment(commentId);
  }
  // update a comment
  @UseGuards(JwtGuard)
  @Patch('comments')
  async updateComment(
    @Body() body: { content: string },
    @Query('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.postsService.updateComment(body, commentId);
  }
  // like a comment
  @UseGuards(JwtGuard)
  @Post('comments/like')
  async likeComment(@Query('commentId', ParseIntPipe) commentId: number) {
    return this.postsService.likeComment(commentId);
  }
  // delete like on coment
  @UseGuards(JwtGuard)
  @Delete('comments/like')
  async deleteLikeOnComment(
    @Query('commentLikeId', ParseIntPipe) commentLikeId: number,
  ) {
    return this.postsService.deletelikeComment(commentLikeId);
  }
  // dislike a comment
  @UseGuards(JwtGuard)
  @Post('comments/dislike')
  async deslikeComment(@Query('commentId', ParseIntPipe) commentId: number) {
    return this.postsService.disLikeComment(commentId);
  }
  // delete dislike on a comment
  @UseGuards(JwtGuard)
  @Delete('comments/dislike')
  async deleteDislikeOnComment(
    @Query('commentDislikeId', ParseIntPipe) commentDislikeId: number,
  ) {
    return this.postsService.deletedislikeOnComment(commentDislikeId);
  }
  // reply to a comment
  @UseGuards(JwtGuard)
  @Post('comments/reply')
  async replyToComment(
    @Body() body: { content: string },
    @Query('commentId', ParseIntPipe) commentId: number,
    @Query('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
  ) {
    return this.postsService.createCommentReply(
      body,
      commentId,
      postId,
      user.id,
    );
  }
  // delete comment reply
  @UseGuards(JwtGuard)
  @Delete('comments/reply')
  async deleteCommentReply(
    @Query('commentReplyId', ParseIntPipe) commentReplyId: number,
  ) {
    return this.postsService.deleteCommentReply(commentReplyId);
  }
  // like reply to a comment
  // delete like to a reply to a comment
  // dislike reply to a comment
  // delete dislike to a comment
}
