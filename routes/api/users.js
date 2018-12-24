const express=require('express')
const gravatar=require('gravatar')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const passport=require('passport')

const keys=require('../../config/keys')

const router=express.Router();

const validateRegisterInput=require('../../validation/register')
const validateLoginInput=require('../../validation/login')

const User=require('../../models/User')

router.get('/test',(req,res)=>{
    res.json({msg:"User works"})
});

/////REGISTER

router.post('/register',(req,res)=>{

    const {errors,isValid}=validateRegisterInput(req.body);

    if(!isValid){
        return res.status(400).json(errors)
    }

    User.findOne({email:req.body.email})
    .then(user=>{
        if(user)
        {
            errors.email='Email already exists'
            return res.status(400).json(errors); // sending error status code
        }
        else{
            const avatar=gravatar.url(req.body.email,{
                s:'200', //Size
                r:'pg', //rating
                d:'mm' //Default
            })

            const newUser=new User({
                name:req.body.name,
                email:req.body.email,
                password:req.body.password,
                avatar
            })

            bcrypt.genSalt(10,(err,salt)=>{
                bcrypt.hash(newUser.password,salt,(err,hash)=>{
                    if(err)
                    throw err;
                    newUser.password=hash; //setting password to the hash
                    newUser.save()
                        .then(user=>res.json(user))
                        .catch(err=>console.log(err));
                })
            })
        }
    })
})


/////LOGIN
router.post('/login',(req,res)=>{

    const {errors,isValid}=validateLoginInput(req.body);

    if(!isValid){
        return res.status(400).json(errors)
    } 

    const email=req.body.email;
    const password=req.body.password;

    User.findOne({email})
        .then(user=>{
            if(!user){
                errors.email='User not found';
                return res.status(404).json(errors);
            }

            bcrypt.compare(password,user.password)   //'password' is the password typed at login and user.password is the hashed password stored in db
                .then(isMatch=>{
                    if(isMatch){
                        const payload={id:user.id,name:user.name,avatar:user.avatar} //Create JWT Payload

                        jwt.sign(payload,keys.secretOrKey,{expiresIn:3600},(err,token)=>{
                            res.json({
                                success:true,
                                token:'Bearer ' +token
                            });
                        });
                    }
                    else{
                        errors.password='Password Incorrect'
                        return res.status(400).json(errors)
                    }
                })
        })
})


////Private route to return current user

router.get('/current',passport.authenticate('jwt',{session:false}),(req,res)=>{
    res.json({
        id:req.user.id,
        name:req.user.name,
        email:req.user.email
    })
})


module.exports=router;