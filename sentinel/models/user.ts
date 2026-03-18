import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    name: {
      type: String,
    },
    salt: { type: String, required: true },
  },
  { timestamps: true },
);

// uncomment when user changes
// if (mongoose.models.User) {
//   delete (mongoose.models as any).User;
// }

export default models.User || model("User", UserSchema);
