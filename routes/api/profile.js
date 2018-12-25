const express=require('express')
const router=express.Router();

const mongoose=require('mongoose')
mongoose.set('useFindAndModify', false);
const passport=require('passport')

const Profile=require('../../models/Profile')
const User=require('../../models/User')

const validateProfileInput=require('../../validation/profile')



router.get('/test',(req,res)=>{
    res.json({msg:"Profile works"})
});

//////Get current user profile
router.get('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const errors={};

    Profile.findOne({user:req.user.id})
        .populate('user',['name','avatar'])
        .then(profile=>{
            if(!profile){
                errors.noprofile='There is no profile for this user';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err=>res.status(400).json(err));
})

/////Post users profile
router.post('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const {errors,isValid}=validateProfileInput(req.body);

    //Validation check
    if(!isValid){
        return res.status(400).json(errors);
    }
    
    //Field entry logic
    const profileFields={};
    profileFields.user=req.user.id;
    if(req.body.handle) profileFields.handle=req.body.handle;    
    if(req.body.company) profileFields.company=req.body.company;    
    if(req.body.website) profileFields.website=req.body.website;    
    if(req.body.bio) profileFields.bio=req.body.bio;    
    if(req.body.status) profileFields.status=req.body.status;    
    if(req.body.githubusername) profileFields.githubusername=req.body.githubusername; 

    if(typeof req.body.skills!='undefined'){
        profileFields.skills=req.body.skills.split(',');
    }

    profileFields.social={};    
    if(req.body.youtube) profileFields.social.youtube=req.body.youtube;    
    if(req.body.facebook) profileFields.social.facebook=req.body.facebook;    
    if(req.body.linkedin) profileFields.social.linkedin=req.body.linkedin;    
    if(req.body.instagram) profileFields.social.instagram=req.body.instagram;    
    if(req.body.twitter) profileFields.social.twitter=req.body.twitter;    
        
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            if(profile){ //Editing profile logic
                Profile.findOneAndUpdate({user:req.user.id},{$set:profileFields},{new:true}) 
                    .then(profile=>res.json(profile))
            }else{ //Creating profile logic
                Profile.findOne({handle:profileFields.handle})
                    .then(profile=>{
                        if(profile){ //Check handle exists or not
                            errors.handle='The handle already exists';
                            res.status(400).json(errors)
                        }
                        new Profile(profileFields) //Save the profile 
                            .save()
                            .then(profile=>{
                                res.json(profile)
                            })
                    })
            }
        })
})

module.exports=router;