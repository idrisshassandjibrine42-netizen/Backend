import mongoose from "mongoose";

const UserSchema = mongoose.Schema({})

const User = mongoose.model("User", UserSchema);
export default User;