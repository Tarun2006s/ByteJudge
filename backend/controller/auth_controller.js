const AuthUser = require('../model/authuser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const formatUser = (user) => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
});

const register = async(req, res) => {
    try {
        //get user data from request body
        // const firstName=req.body.firstName;
        // const lastName=req.body.lastName;
        // const email=req.body.email;
        // const password=req.body.password;
        const { firstName, lastName, email, password } = req.body;
        // console.log(firstName, lastName, email, password);
        // we have to use postman to send the data in json format in body of post to request and we have to use express.json() middleware in index.js file for parsing json from request body
        // do the above things in postman and fill the details then this console.log will print the data filled in the terminal


        // check if user data exist means all fields are filled
        if(!firstName || !lastName || !email || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        // validate user data
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
        }
        if(!email.includes('@')){
            return res.status(400).json({message:"Invalid email"});
        }
        if(firstName.length<3 || lastName.length<3){
            return res.status(400).json({message:"first name and last name must be atleast 3 characaters long"});
        }
        //check if user already exist in database
        const userExist=await AuthUser.findOne({email:email});
        if(userExist){
            return res.status(401).json({message:"User already exist"});
        }
        //encrypt password
        const hashedPassword=await bcrypt.hash(password,10);  // this will return a promise so we have to use await and we have to use async in the function and we have to import bcrypt package for hashing password
        //save user data in database
        const user = await AuthUser.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
        });
        //send response to client or token to client
        const token = jwt.sign({ id: user._id, email}, process.env.JWT_SECRET, { expiresIn: '1h' });//email and id are termed as payload and JWT_SECRET is the secret key which is used to sign the token and expiresIn is the time for which the token will be valid and we have to import jsonwebtoken package for creating token
        res.status(201).json({ message: "User registered successfully", user: formatUser(user), token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await AuthUser.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login successful",
            user: formatUser(user),
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// protected route - req.user is set by authMiddleware after verifying JWT token
const getMe = async (req, res) => {
    try {
        const user = await AuthUser.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: formatUser(user) });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { register, login, getMe };
