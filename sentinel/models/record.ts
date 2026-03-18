import { Schema, model, models } from "mongoose";

const AttributeSchema = new Schema(
  {
    label: { type: String, required: true },
    values: [{ type: String }],
    type: {
      type: String,
      enum: [
        "text",
        "phone",
        "email",
        "date",
        "list",
        "markdown",
        "secret",
        "image",
        "url",
      ],
      default: "text",
    },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false },
);

const LinkSchema = new Schema(
  {
    targetId: { type: Schema.Types.ObjectId, ref: "Record", required: true },
    relationship: { type: String, required: true },
  },
  { _id: false },
);

const RecordSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tags: [String],
    attributes: [AttributeSchema],
    links: [LinkSchema],
    lastModified: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "records",
  },
);

RecordSchema.index({ userId: 1, lastModified: -1 });

export default models.Record || model("Record", RecordSchema);
