'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, Link } from '@/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { articleAPI } from '@/lib/api';
import { useAuthStore, useLanguageStore } from '@/stores';
import { 
  Calendar, ArrowLeft, Share2, Clock, 
  Heart, MessageCircle, Send, Trash2 
} from 'lucide-react';
import { en, ne } from '@/locales';
import { formatDistanceToNow } from 'date-fns';
import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  titleNe?: string;
  heading: string;
  headingNe?: string;
  excerpt: string;
  excerptNe?: string;
  body: string;
  bodyNe?: string;
  imageUrl?: string;
  publishedAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
  comments: Comment[];
  _count: {
    likes: number;
  };
}

interface ArticleClientProps {
  article: Article;
}

export default function ArticleClient({ article: initialArticle }: ArticleClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = language === 'en' ? en : ne;
  
  const [article, setArticle] = useState<Article | null>(initialArticle);
  const [likes, setLikes] = useState(initialArticle._count?.likes || 0);
  const [isLiked, setIsLiked] = useState(false); // Note: In a real app, we'd check this from API
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // We rely on initialArticle, but we could re-validate or sync likes if needed. 
  // For now, we trust the SSR data and client-side updates.

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like this article');
      return;
    }
    if (!article) return;

    try {
      if (isLiked) {
        await articleAPI.unlike(article.id);
        setLikes(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        await articleAPI.like(article.id);
        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    if (!article) return;
    try {
      await articleAPI.share(article.id);
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/admin/login?redirect=${pathname}`);
      return;
    }
    if (!article || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await articleAPI.comment(article.id, commentText);
      const newComment = res.data;
      
      setArticle(prev => prev ? {
        ...prev,
        comments: [newComment, ...(prev.comments || [])]
      } : null);
      
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!article) return;
    if (!confirm('Delete this comment?')) return;

    try {
      await articleAPI.deleteComment(article.id, commentId);
      setArticle(prev => prev ? {
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId)
      } : null);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!article) return null; // Should ideally not happen if SSR passes data

  return (
    <>
      <Navbar />
      <article className="min-h-screen bg-white dark:bg-[var(--color-dark)]">
        {/* Hero Image */}
        <div className="w-full relative h-[60vh] md:h-[80vh] bg-gray-900">
          {article.imageUrl ? (
            <Image 
              src={getImageUrl(article.imageUrl)} 
              alt={article.title}
              fill
              className="object-cover object-center"
              priority
            />
          ) : (
            <div className="w-full h-[50vh] bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-6xl font-bold text-gray-300 dark:text-gray-600">BELA</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
            <div className="container-custom">
              <Link 
                href="/articles" 
                className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" /> {language === 'ne' ? 'लेखहरूमा फर्कनुहोस्' : 'Back to Articles'}
              </Link>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl">
                {language === 'ne' ? (article.titleNe || article.title) : article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                {article.author ? (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-none bg-primary flex items-center justify-center font-bold text-white">
                      {article.author.firstName?.charAt(0) || 'A'}
                    </div>
                    <span className="font-medium">
                      {article.author.firstName} {article.author.lastName}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-none bg-primary flex items-center justify-center font-bold text-white">
                      B
                    </div>
                    <span className="font-medium">Bela Team</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : (language === 'ne' ? 'ड्राफ्ट' : 'Draft')}</span>
                </div>
                {article.body && (
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>{Math.ceil(article.body.length / 1000)} {language === 'ne' ? 'मिनेट पढ्न' : 'min read'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="lead text-xl text-gray-600 dark:text-gray-300 font-medium mb-8 border-l-4 border-primary pl-4 italic">
                {language === 'ne' ? (article.excerptNe || article.excerpt) : article.excerpt}
              </p>
              <div 
                className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: language === 'ne' ? (article.bodyNe || article.body) : article.body }}
              />
            </div>

            {/* Interaction Bar */}
            <div className="mt-12 py-6 border-y border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-none transition-colors ${
                    isLiked 
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                  <span className="font-medium">{likes} Likes</span>
                </button>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MessageCircle size={20} />
                  <span className="font-medium">{article.comments?.length || 0} Comments</span>
                </div>
              </div>

              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
              >
                <Share2 size={20} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Comments</h3>
              
              {/* Comment Form */}
              {user ? (
                <form onSubmit={handleComment} className="mb-10">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-none bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold">
                      {user.firstName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add to the discussion..."
                        className="w-full p-4 rounded-none border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-32"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingComment || !commentText.trim()}
                          className="px-6 py-2 bg-primary text-white rounded-none hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Send size={16} />
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-none text-center mb-10">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Please log in to join the conversation.</p>
                  <Link href="/admin/login" className="inline-block px-6 py-2 bg-primary text-white rounded-none hover:bg-primary/90 transition">
                    Log In
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-8">
                {article.comments && article.comments.length > 0 ? (
                  article.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-none bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold">
                        {comment.user?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-none rounded-tl-none">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-bold text-gray-900 dark:text-white mr-2">
                                {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            {(user?.id === comment.userId || user?.role === 'ADMIN') && (
                              <button 
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-500 transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Author Card */}
            {article.author && (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-none border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About the Author</h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-none bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-400">
                    {article.author.firstName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {article.author.firstName} {article.author.lastName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Content Creator at Bela Eco Panels
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Newsletter / CTA */}
            <div className="bg-primary text-white p-8 rounded-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-none -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-xl font-bold mb-4 relative z-10">Build Sustainably</h3>
              <p className="text-white/90 mb-6 relative z-10">
                Ready to start your eco-friendly project? Get a quote today.
              </p>
              <Link 
                href="/contact" 
                className="block w-full text-center bg-white text-primary font-bold py-3 rounded-none hover:bg-gray-100 transition relative z-10"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}
