import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the post document
export interface IPost extends Document {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
  overview_embedding?: number[];
}

// Create the schema
const postSchema = new Schema<IPost>(
  {
    adult: {
      type: Boolean,
      required: true,
    },
    backdrop_path: {
      type: String,
      required: true,
    },
    genre_ids: {
      type: [Number],
      required: true,
    },
    id: {
      type: Number,
      unique: true,
      required: true,
    },
    origin_country: {
      type: [String],
      required: true,
    },
    original_language: {
      type: String,
      required: true,
    },
    original_name: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
      required: true,
    },
    popularity: {
      type: Number,
      required: true,
    },
    poster_path: {
      type: String,
      required: true,
    },
    first_air_date: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    vote_average: {
      type: Number,
      required: true,
    },
    vote_count: {
      type: Number,
      required: true,
    },
    overview_embedding: {
      type: [Number],
      required: false,
    },
  },
  {
    // Reduce overhead and potential serialization issues
    timestamps: false,
    versionKey: false,
  }
);

// Remove any custom validators that might cause issues
postSchema.path("adult").validators = [];
postSchema.path("backdrop_path").validators = [];
// Repeat for other paths if needed

// Create the model with proper typing
const PostModel: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);

export default PostModel;
