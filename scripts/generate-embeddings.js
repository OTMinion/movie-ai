// scripts/generate-embeddings.js
const mongoose = require("mongoose");
const axios = require("axios");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

// Load environment variables from .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");

if (fs.existsSync(envLocalPath)) {
  console.log("Loading .env.local file...");
  dotenv.config({ path: envLocalPath });
}

// Update to use MONGODB_URL instead of MONGODB_URI
const requiredEnvVars = ["MONGODB_URL", "HF_TOKEN"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("Error: Missing required environment variables:");
  missingEnvVars.forEach((envVar) => {
    console.error(`- ${envVar}`);
  });
  console.error("\nPlease check your .env.local file.");
  process.exit(1);
}

const postSchema = new mongoose.Schema({
  adult: Boolean,
  backdrop_path: String,
  genre_ids: [Number],
  id: Number,
  origin_country: [String],
  original_language: String,
  original_name: String,
  overview: String,
  popularity: Number,
  poster_path: String,
  first_air_date: String,
  name: String,
  vote_average: Number,
  vote_count: Number,
  overview_embedding: [Number],
});

const PostModel = mongoose.models.Post || mongoose.model("Post", postSchema);

async function generateEmbedding(text) {
  try {
    console.log("Using HF_TOKEN:", process.env.HF_TOKEN ? "✓ Found" : "✗ Missing");
    const response = await axios.post(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      { inputs: [text] },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    return response.data[0];
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("Error: Invalid or missing HF_TOKEN. Please check your .env.local file.");
      process.exit(1);
    }
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function generatePostEmbeddings() {
  try {
    if (!process.env.MONGODB_URL.startsWith("mongodb")) {
      throw new Error("Invalid MongoDB URL. Please check your .env.local file.");
    }

    console.log("\nConnecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected successfully to MongoDB");

    // Verify search index exists
    const db = mongoose.connection.db;
    const indexes = await db.collection("posts").listIndexes().toArray();
    const hasVectorIndex = indexes.some(
      (index) =>
        index.name === "overview_vector_index" || (index.key && index.key.overview_embedding)
    );

    if (!hasVectorIndex) {
      console.warn('\nWarning: Vector search index "overview_vector_index" not found!');
      console.warn("Please create the index in MongoDB Atlas using the Search tab.");
      console.warn('Make sure to name it "overview_vector_index"');
    }

    const posts = await PostModel.find({ overview_embedding: { $exists: false } });
    console.log(`Found ${posts.length} posts without embeddings`);

    let processed = 0;
    const total = posts.length;

    for (const post of posts) {
      try {
        if (!post.overview) {
          console.log(`Skipping post ${post.name} - no overview available`);
          continue;
        }

        console.log(`\nProcessing (${++processed}/${total}): ${post.name}`);
        console.log("Generating embedding...");

        const embedding = await generateEmbedding(post.overview);

        // Verify embedding dimensions
        if (embedding.length !== 384) {
          console.warn(
            `Warning: Unexpected embedding dimensions (${embedding.length}). Expected 384.`
          );
        }

        console.log("Updating document...");
        await PostModel.updateOne({ _id: post._id }, { $set: { overview_embedding: embedding } });

        console.log(`✓ Successfully processed: ${post.name}`);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing post ${post.name}:`, error);
        continue;
      }
    }

    console.log("\nEmbedding generation complete!");
    console.log(`Processed ${processed} posts`);
  } catch (error) {
    console.error("Error:", error?.message || error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}

console.log("Starting embedding generation process...");
console.log(
  "Using MongoDB URL:",
  process.env.MONGODB_URL?.replace(/\/\/[^:]+:[^@]+@/, "//<credentials>@")
);
generatePostEmbeddings();
