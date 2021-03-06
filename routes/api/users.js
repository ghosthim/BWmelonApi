const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const keys = require("../../config/keys");
const passport = require("passport");


router.post("/register",(req, res) => {
    User.findOne({name:req.body.name})
        .then((user) => {
            if(user) {
                return res.status(400).json("账号已存在");
            } else {
                const newUser = new User({
                    name: req.body.name,
                    password: req.body.password
                })

                // 密码加密
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(newUser.password, salt, function (err, hash) {
                        if (err) {
                            throw err;
                        }
                        newUser.password = hash;
                        newUser.save()
                                .then(user => res.json(user))
                                .catch(err => console.log(err));
                                
                    });
                });
            }


        })
})

router.post("/login", (req, res) => {
    const name = req.body.name;
    const password = req.body.password;

    if(name != 'admin') {
        return res.status(404).json("用户名错误");
    }
    User.findOne({name})
        .then(user => {
            if (!user) {
                // return res.status(404).json("用户不存在");
                if(password != "123456") {
                    return res.status(404).json("密码错误");
                }
                
                const newUser = new User({
                    name: "admin",
                    password: "123456"
                })

                // 密码加密
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(newUser.password, salt, function (err, hash) {
                        if (err) {
                            throw err;
                        }
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));

                    });
                });
            
                return res.status(404).json("初始化成功，请重新登录");
                
                
                
            } else {
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            const rule = {
                                id: user.id,
                                name: user.name
                            }
                            jwt.sign(rule, keys.secretOrKey, {
                                expiresIn: 3600
                            }, (err, token) => {
                                if (err) throw err;
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                })
                            })
                            console.log(req.headers);
                        } else {
                            
                            
                            return res.status(400).json("密码错误");
                        }
                    })
            }

            
        })
})

router.get("/current", passport.authenticate("jwt", {session:false}), (req, res) => {
    res.json({
        id: req.user.id,
        name:req.user.name
    })
})

module.exports = router;
