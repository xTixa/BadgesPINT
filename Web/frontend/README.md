# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Criar Badges com IA (Admin)

O frontend chama um endpoint no backend para criar as imagens através do Hugging Face.

1. No backend, define a variável de ambiente `HF_API_TOKEN` com o teu token.
2. Define `HF_MODEL_ID` para escolher outro modelo (por defeito: `stabilityai/stable-diffusion-xl-base-1.0`).
3. No Dashboard Admin, usa o painel “Gerar Badge com IA”.

Endpoint usado:
- `POST http://localhost:4000/api/admin/badges/generate-image`
- Body: `{ "prompt": "...", "size": "1024x1024" }`

### Cloudinary (guardar imagens)

Definir variáveis no backend:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Endpoint usado:
- `POST http://localhost:4000/api/admin/badges/upload-image`
- Body: `{ "image": "data:image/png;base64,...", "folder": "badges" }`
