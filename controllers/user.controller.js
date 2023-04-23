
const { User } = require('../models')

const jwt = require('jsonwebtoken')

const Validator = require("fastest-validator")

const v = new Validator()
const bcrypt = require('bcrypt')

require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET

// CREATE USER (SIGN UP USER)
function signup(req, res, next) {

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash){
            const data = {
                username: req.body.username, 
                password: hash, 
                email: req.body.email, 
                fullname: req. body.fullname, 
                picture: req.body.picture, 
                bio : req.body.bio, 
                createdAt: new Date(), 
                updatedAt: new Date(), 
                createdBy : 0, 
                updatedBy: 0, 
                isDeleted: false
            }
        
            const schema = {
                username: {type: "string", max: 50, min: 5, optional: false},
                email: {type: "email", opsional: false},
                password: {type: "string", min: 5, max: 255, opsional: false},
            }
        
        
            User.findOne({where: {email: req.body.email}}).then(user => {
                if(user) {
                    res.status(400).json({
                        massage: 'email is already exist'
                    })
                } else {
        
                    const validationResult = v.validate(data, schema)
        
                    if(validationResult !== true) {
                        res.status(400).json({
                            massage: 'validation failed',
                            data: validationResult
                        })
                    } else {
                        User.create(data).then(result => {
                            res.status(200).json({
                                massage: "Success Registration",
                                data: result
                            })
                        }).catch(err => {
                            res.status(500).json({
                                massage:'Register Failed',
                                data: err
                            })
                        })
                    }
                }
            }).catch(err => {
                res.status(500).json({
                    massage: 'something is wrong',
                    data: err
                })
            })
        })
    })

}

// READ USER
function read(req, res, next) {
    // res.send('read brooo')
    User.findAll({
        where: {isDeleted : false}
    }).then(users => {
        res.send(users)
    }).catch(err => {
        res.send(err)
    })
    
}

// READ USER BY ID
function readById(req, res, next) {
    const id = req.params.id
    User.findByPk(id).then(users => {
        res.send(users)
    }).catch(err => {
        res.send(err)
    })
}

// UPDATE USER
function update(req, res, next) {
    const data = {
        username: req.body.username, 
        password: req. body.password, 
        email: req.body.email, 
        fullname: req. body.fullname, 
        picture: req.body.picture, 
        bio : req.body.bio, 
        updatedAt: new Date(), 
        updatedBy: 0, 
        isDeleted: false
    }

    const schema = {
        username: {type: "string", max: 50, min: 5, optional: false},
        email: {type: "email", opsional: false},
        password: {type: "string", min: 5, max: 50, opsional: false},
    }

    const validationResult = v.validate(data, schema)

            if(validationResult !== true) {
                res.status(400).json({
                    massage: 'validation failed',
                    data: validationResult
                })
            } else {
                User.update(
                    data, 
                    {where : {
                        id : req.params.id
                    }}).then(result => {
                    res.status(200).json({
                        massage: "Success update data",
                        data: result
                    })
                }).catch(err => {
                    res.status(500).json({
                        massage:'Updated Failed',
                        data: err
                    })
                })
            }

    
}

// DELETE USER
function destroy(req, res, next) {
    User.destroy(
        {where : {
            id : req.params.id
        }}).then(result => {
        res.status(200).json({
            massage: "Success delete data",
            data: result
        })
    }).catch(err => {
        res.status(500).json({
            massage:'Delete Failed',
            data: err
        })
    })
}

// LOGIN USER (SIGN IN)
function signin(req, res, next) {
    User.findOne({where: {email: req.body.email}}).then(user => {
        if(user){
            if(user.isDeleted == false) {

                bcrypt.compare(req.body.password, user.password, function(err, result){
                    
                    if(result) {
                        const token = jwt.sign({
                            email: user.email,
                            username: user.username,
                            userid: user.id
                        }, JWT_SECRET, function(err, token){
                            res.status(200).json({
                                status: 'SUCCESS',
                                massage: 'login is success',
                                token: token,
                            })
                        })
                        
                    } else {
                        res.status(401).json({
                            status: 'FAILED',
                            massage:'Wrong password',
                            data: err
                        })
                    }
                })

            } else {
                res.status(401).json({
                    massage: 'User has been deleted'
                })
            }
        } else {
            res.status(404).json({
                massage: 'Wrong email or email is not found'
            })
        }
    }).catch(err => {
        res.status(500).json({
            massage: 'login failed',
            data: err
        })
    })
}

module.exports = {
    signup,
    read,
    readById,
    update,
    destroy,
    signin
}