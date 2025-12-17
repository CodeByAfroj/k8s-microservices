import dotenv  from "dotenv";
import mongoose, { model,Schema } from "mongoose";

dotenv.config()
const url=process.env.MONGO_URL

if (!url) {
  throw new Error("❌ MONGO_URL is missing in .env file");
}
await mongoose.connect(url)
.then(()=>{
    console.log("database Connected")
})
const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  email: { 
    type: String, 
    unique: true, 
    sparse: true, 
    lowercase: true 
  },

  role: {
    type: String,
    enum: ["customer", "delivery_partner", "restaurant_owner"],
    default: "customer"
  }
});



export const UserModel = model('User',UserSchema)

