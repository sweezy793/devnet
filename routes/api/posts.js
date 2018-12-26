const express=require('express')
const router=express.Router();
const mongoose=require('mongoose')
const passport=require('passport')

const Post=require('../../models/Post')
const Profile=require('../../models/Profile')

const validatePostInput=require('../../validation/post')

router.get('/test',(req,res)=>{
    res.json({msg:"Posts works"})
});


////////Route to show all posts publicly
router.get('/',(req,res)=>{
    Post.find()
        .sort({date:-1})
        .then(posts=>res.json(posts))
        .catch(err=>res.status(404).json({nopostsfound:'No posts found'}));
})

////////Route to show individual posts publicly
router.get('/:id',(req,res)=>{
    Post.findById(req.params.id)
        .then(post=>res.json(post))
        .catch(err=>res.status(404).json({nopostfound:'No post found with that id'}));
})


//////Route to create a new post by the user
router.post('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const {errors,isValid}=validatePostInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    const newPost=new Post({
        text:req.body.text,
        name:req.body.name,
        avatar:req.body.avatar,
        user:req.user.id
    });
    newPost.save().then(post=>res.json(post))
})


//////Route to delete post by user
router.delete('/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            Post.findById(req.params.id)
                .then(post=>{
                    //Check for post owner
                    if(post.user.toString()!==req.user.id){
                        return res.status(401).json({notauthorized:'User not authorized'});
                    }

                    ////Delete
                    post.remove()
                        .then(()=>res.json({success:true}))
                }).catch(err=>res.status(404).json({postnotfound:'No post found'}));
        })
})



//////Route to post a like on the post using it's id
router.post('/like/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            Post.findById(req.params.id)
                .then(post=>{
                    if(post.likes.filter(like=>like.user.toString()===req.user.id).length>0){
                        return res.status(400).json({alreadyliked:'User already liked this post'})
                    }

                    //Add user id to likes array
                    post.likes.unshift({user:req.user.id});
                    post
                    .save()
                    .then(post=>res.json(post))

                }).catch(err=>res.status(404).json({postnotfound:'No post found'}));
        })
})


//////Route to post a like on the post using it's id
router.post('/unlike/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            Post.findById(req.params.id)
                .then(post=>{
                    if(post.likes.filter(like=>like.user.toString()===req.user.id).length===0){
                        return res.status(400).json({notliked: 'User has not liked this post'})
                    }

                    //Get remove index
                    const removeIndex=post.likes
                        .map(item=>item.user.toString())
                        .indexOf(req.user.id);

                    //Splice it out of array
                    post.likes.splice(removeIndex,1)

                    //Save
                    post.save().then(post=>res.json(post))
                    

                }).catch(err=>res.status(404).json({postnotfound:'No post found'}));
        })
})

module.exports=router;