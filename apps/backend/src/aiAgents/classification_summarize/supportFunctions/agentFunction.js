import "dotenv/config";
import { pipeline } from "@xenova/transformers";
import fileCategoryGroups from "../reference/categoryList.js";

// Step 1: Define a function to classify category using zero-shot classification
async function classifyCategory(text, labels = fileCategoryGroups) {
  const classifier = await pipeline(
    "zero-shot-classification",
    "Xenova/nli-deberta-v3-xsmall"
  );
  const result = await classifier(text, labels);
  return result.labels[0]; // Best matching category
}

// Step 2: Summarize the text
async function summarizeText(text) {
  const summarizer = await pipeline("summarization", "Xenova/bart-large-cnn");
  const summary = await summarizer(text, {
    max_length: 60,
    min_length: 15,
    do_sample: false,
  });
  return summary[0].summary_text;
}

// Step 3: Unified function
export async function classifyAndSummarize(text) {
  const [category, summary] = await Promise.all([
    classifyCategory(text),
    summarizeText(text),
  ]);

  return {
    category,
    summary,
  };
}
