const express=require('express')
const gravatar=require('gravatar')
const bcrypt=require('bcryptjs')

const router=express.Router();


const User=require('../../models/User')

router.get('/test',(req,res)=>{
    res.json({msg:"User works"})
});

/////REGISTER

router.post('/register',(req,res)=>{
    User.findOne({email:req.body.email})
    .then(user=>{
        if(user)
        {
            return res.status(400).json({email:'Email already exists'}); // sending error status code
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
    const email=req.body.email;
    const password=req.body.password;

    User.findOne({email})
        .then(user=>{
            if(!user){
                return res.status(404).json({email:'User not found'});
            }

            bcrypt.compare(password,user.password)   //password is the password typed at login and user.password is the hashed password stored in db
                .then(isMatch=>{
                    if(isMatch){
                        res.json({msg:'Success'})
                    }
                    else{
                        return res.status(400).json({password:'Incorrect password'})
                    }
                })
        })
})


module.exports=router;