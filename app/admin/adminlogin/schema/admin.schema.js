
import mongoose from  'mongoose';
import { string } from 'yup';

const Schema = mongoose.Schema;

const AdminSchema = new Schema({

    email: {
        
        type: String,
        required:true
    },
    password : {
        
        type: String,
        required:true
    },
    hashpassword:{
        type: String,
        required:true
    },
    otp:{
        type: String,
        default: ""
    },
    otpExpire:{
        type: Date,
        default: null
    }
})


const Admin = mongoose.model("admin", AdminSchema, "admin");
export default Admin;