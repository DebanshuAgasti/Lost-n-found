# Image Matching Pipeline

## Problem

Photos of lost/found objects may be:
- blurry
- low-light
- partially occluded
- taken from different angles
- visually similar to many unrelated objects

Therefore, raw image similarity alone should not decide a match.

## Proposed pipeline

1. User uploads an image.
2. Validate and normalize the image.
3. Generate an image embedding using an appropriate open-source vision/multimodal model.
4. Store the embedding in the vector-search layer.
5. Retrieve visually similar candidates.
6. Combine vector similarity with structured metadata.
7. Optionally compare text descriptions and user-entered distinguishing features.
8. Rank candidates.
9. Present likely matches to users for confirmation/review.

## Optional manual features

The finder can enter additional characteristics such as:
- color
- brand
- model
- scratches/marks
- stickers
- accessories
- distinctive damage
- approximate dimensions
- other identifying observations

These features are particularly useful when the photo is unreliable.

## Training vs using a pretrained model

The initial system should not assume that a custom model must be trained from scratch.

A sensible first version is:
- use a strong pretrained open-source vision/multimodal model
- generate embeddings
- evaluate retrieval quality on representative L&F examples
- only fine-tune if evaluation shows a meaningful domain-specific benefit

This keeps the first implementation substantially simpler.
