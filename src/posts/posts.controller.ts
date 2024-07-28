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

  @UseGuards(JwtGuard)
  @Post('like')
  likePost(@GetUser() user: User, @Query('id', ParseIntPipe) postId: number) {
    return this.postsService.likePost(user.id, postId);
  }

  @UseGuards(JwtGuard)
  @Get('like')
  getPostLike(@Query('id', ParseIntPipe) postId: number) {
    return this.postsService.getPostLike(postId);
  }
}
