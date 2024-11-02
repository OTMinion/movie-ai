import mongoose from "mongoose";
import { generateEmbedding } from "./utils/embedding";
import { config } from "dotenv";
import PostModel, { IPost } from "./models/postModel";

config();

async function generatePostEmbeddings(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB");

    const posts = await PostModel.find({ overview_embedding: { $exists: false } });
    console.log(`Found ${posts.length} posts without embeddings`);

    for (const post of posts) {
      try {
        if (!post.overview) {
          console.log(`Skipping post ${post.name} - no overview available`);
          continue;
        }

        console.log(`Generating embedding for: ${post.name}`);
        const embedding = await generateEmbedding(post.overview);

        await PostModel.updateOne({ _id: post._id }, { $set: { overview_embedding: embedding } });

        console.log(`Successfully generated embedding for: ${post.name}`);

        // Add delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing post ${post.name}:`, error);
        continue;
      }
    }

    console.log("Embedding generation complete");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
generatePostEmbeddings();
