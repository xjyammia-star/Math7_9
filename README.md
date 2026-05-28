<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/975d610d-cfe2-4c55-8dd4-699db9d40151

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the model API keys in [.env.local](.env.local):
   - `VITE_DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3`
   - `VITE_DOUBAO_API_KEY=...`
   - `VITE_DOUBAO_MODEL=doubao-seed-2-0-lite-250615`
   - `VITE_GLM_API_KEY=...`
   - `VITE_GLM_MODEL=ep-20260528150018-jh75j`
3. Run the app:
   `npm run dev`

In the UI, use the model selector in the left sidebar to switch between GLM 4.7 and 豆包 manually.
