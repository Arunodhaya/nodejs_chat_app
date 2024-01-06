import express from 'express';
import { UserModel } from '../model/user_model';

const route = express.Router()



route.get("/create", (req, res) => {

    UserModel.create({
        firstName: "JKohn",
        lastName: "Bob",
        email: "john@gmail.com"
    });

    res.json({
        "ke": "value"
    })
})


export default route
