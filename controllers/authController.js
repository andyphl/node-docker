const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.singUp = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            password: hashedPassword
        });
        req.session.user = newUser;
        res.status(201).json({
            status: "success",
            data: {
                user: newUser
            }
        });
    }
    catch (error) {
        res.status(400).json({
            status: "failed"
        });
    }
};

exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({username})

        if(!user) {
            return res.status(404).json({
                status: "failed",
                message: "user not found"
            })
        }

        const isValidate = await bcrypt.compare(password, user.password);
        if(isValidate) {
            req.session.user = user;
            res.status(200).json({
                status: "success"
            });
        }
        else {
            res.status(400).json({
                status: "failed",
                message: "incorret username or password"
            });
        }
    }
    catch (error) {
        res.status(400).json({
            status: "failed"
        });
    }
}