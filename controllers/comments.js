const Post = require('../models/post');
const Comment = require('../models/comments');
const USER = require('../models/user');
const Community = require('../models/community');
const UserProfile = require('../models/userProfilePicture');

async function getCommentsByPost(curr_user, community, postId,flag, res) {
    try {
        
        // Find post by ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).render('error', { 
                message: 'Post not found',
                error: { status: 404 }
            });
        }
        
        // Find user who created the post
        const user = await USER.findById(post.user_id);
        if (!user) {
            return res.status(404).render('error', { 
                message: 'User not found',
                error: { status: 404 }
            });
        }
        
        // Find user's profile picture
        const userProfile = await UserProfile.findOne({ user_id: user._id });
        
        // Find community
        const communityData = await Community.findById(community);
        if (!communityData) {
            return res.status(404).render('error', { 
                message: 'Community not found',
                error: { status: 404 }
            });
        }
        
        // Verify if the post belongs to the specified community
        if (post.community_id.toString() !== community) {
            return res.status(404).render('error', { 
                message: 'Post not found in this community',
                error: { status: 404 }
            });
        }
        
        console.log(curr_user);
        // Get comments for this post
         const comments = await Comment.find({ post_id: postId })
        const curr_profile = await UserProfile.findOne({ user_id: curr_user });

        const userComment = await USER.find({});
        const userProfileComments = await UserProfile.find({});

        // Render the comments page with all necessary data
        return res.render('comments', {
            userProfile: userProfile || { picture_name: '/default-profile.png' },
            user: user,
            post: post,
            community: communityData,
            comments: comments || [],
            curr_profile: curr_profile,
            userComment: userComment,
            userProfileComments: userProfileComments,
            flag:flag,
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).render('error', { 
            message: 'Error loading comments',
            error: { status: 500 }
        });
    }
}

async function createComment(req, res) {
    try {
        console.log(req.body);
        if (!req.user) {
            return res.status(401).render('error', {
                message: 'Please log in to comment',
                error: { status: 401 }
            });
        }

        const { community, postId } = req.params;
        const { commentText } = req.body;

        // Validate comment text
        if (!commentText || commentText.trim().length === 0) {
            return res.status(400).render('error', {
                message: 'Comment text cannot be empty',
                error: { status: 400 }
            });
        }

        // Find the post first
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).render('error', { 
                message: 'Post not found',
                error: { status: 404 }
            });
        }

        // Verify if the post belongs to the specified community
        if (post.community_id.toString() !== community) {
            return res.status(404).render('error', { 
                message: 'Post not found in this community',
                error: { status: 404 }
            });
        }

        // Create the comment
        const comment = await Comment.create({
            post_id: postId,
            user_id: req.user._id,
            community_id: community,
            comment_text: commentText.trim(),
        });

        // Redirect back to the comments page with community and post ID
        res.redirect(`/comments/${community}/${postId}`);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).render('error', { 
            message: 'Error creating comment',
            error: { status: 500 }
        });
    }
}

module.exports = {
    getCommentsByPost,
    createComment
};
