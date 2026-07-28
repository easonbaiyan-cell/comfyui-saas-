1. **Add routing and navigation**:
   - Create a new directory and page for batch retouching: `src/app/batch-retouch/page.tsx`.
   - Modify `src/components/Header.tsx` to add a new navigation entry: `[批量修图] (Batch Retouch)`.

2. **Develop the UI Layout**:
   - Inside `src/app/batch-retouch/page.tsx`, create a two-column layout.
   - Left side: Implement a multi-file drag and drop uploader to select/drag many images.
   - Right/Top side: Fetch published workflows (where `status = 'published'`) from the Supabase `workflows` table. Implement a dropdown to select a workflow.
   - Render a card/grid for each image showing its status: Pending, Uploading, Generating, Completed, Failed.

3. **Storage Upload**:
   - Implement logic so that when the user clicks "Start Batch Generation", the images are uploaded to the `site-assets` bucket in Supabase `storage` to get their public URLs.

4. **Concurrency Limit Queue**:
   - Implement a queue that processes up to 2 tasks at a time.
   - For each task:
     - Replace the `fieldValue` of the image node in `workflow.rh_payload_template.nodeInfoList` with the public URL of the uploaded image.
     - Send a request to `/api/generate`.
     - When the API responds (and we poll `/api/status` until completion), update the UI card for this image with the generated image URL (or failure state).
     - Once one task finishes, the next task in the queue is automatically started.
     - Provide a clear UI progress and error handling.

5. **Complete pre commit steps**:
   - Complete pre commit steps to make sure proper testing, verifications, reviews and reflections are done.

6. **Submit**:
   - Once thoroughly tested, submit the changes.
