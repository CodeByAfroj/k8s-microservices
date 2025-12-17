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

interface IUser {
  userId: string;
  username: string;
  email?: string;
  role: string;
  address?: string;
  phone?: string;
}


const userSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: String,
 role: {
  type: String,
  enum: ["customer", "delivery_partner", "restaurant_owner"],
  default: "customer"
}
,
  address: String,
  phone: String
});

export const UserModel = model<IUser>("User", userSchema);
