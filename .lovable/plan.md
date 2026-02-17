

# Fix: "Failed to import content" Error

## Root Cause

When importing content from the Dashboard (library view), the `ImportContentModal` tries to insert blocks into the database with fields `block_payload` and `block_meta` -- but the `blocks` table does not have these columns. This causes a database insert error, surfacing as "Failed to import content."

The Editor's save functions work fine because they only send `project_id`, `type`, `content`, and `order_index`.

## Fix

### 1. Remove `block_payload` and `block_meta` from the DB insert in `ImportContentModal.tsx`

**File:** `src/components/ImportContentModal.tsx`

In the `handleSubmit` function (around lines 440-458), the block insert includes `block_payload` and `block_meta`. These need to be stripped before inserting into the `blocks` table.

Change the `blocksToInsert` mapping to only include columns that exist in the table:

```typescript
const blocksToInsert = orderedBlocks.map((block, index) => {
  const payload = (block as any).block_payload ?? block.content;
  return {
    project_id: newProject.id,
    type: block.type,
    content: payload as Record<string, unknown>,
    order_index: index,
  };
});
```

This removes the conditional spread of `block_payload` and `block_meta` while still using the payload as the `content` value (so visual block data is preserved).

### 2. Also fix `buildPreviewBlocks` to not carry invalid DB fields

The `buildPreviewBlocks` function (lines 217-234) adds `block_payload` and `block_meta` to the preview blocks. These are fine for in-memory preview but should not leak into DB inserts. The fix in step 1 already handles this by only mapping valid columns during insert.

## Summary

One file change: `src/components/ImportContentModal.tsx` -- remove `block_payload` and `block_meta` from the database insert in `handleSubmit`.

