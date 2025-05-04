# Microserviço de Validação de Documentos com Google Cloud Vision

Este microserviço realiza a análise de documentos (como RG, CPF, etc.) utilizando a API do **Google Cloud Vision**, extraindo texto (OCR) e avaliando se o conteúdo é válido com base em regras heurísticas e estrutura esperada.

## 📦 Funcionalidades

- Upload de imagem de documento via `multipart/form-data` (arquivo).
- Suporte a documentos em formato base64.
- Validação do conteúdo usando análise textual.
- Retorno de:
  - `isValid`: se o documento é válido.
  - `confidence`: confiança da análise (0–100%).
  - `details`: informações extras como número do documento, data de emissão e avisos (ex: "parece cópia").

---

## 🚀 Como executar

### 1. Clonar o projeto

```bash
git clone https://github.com/seu-usuario/analise-documento
cd analise-documento
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` ou `.env.local` com as credenciais da conta de serviço do Google:

```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=furia-knowyourfan@furia-know-your-fan.iam.gserviceaccount.com
```

> ❗ Essas variáveis são lidas no arquivo `googleVisionService.ts`. Você pode configurar usando `process.env` ou diretamente no código (como feito em `GOOGLE_CREDENTIALS`).

---

## 📄 Endpoints

### POST `/verify`

**Enviar documento via arquivo:**

```bash
curl -X POST http://localhost:3000/verify \
  -F "document=@/caminho/para/rg.jpg"
```

**Enviar via base64:**

```json
POST http://localhost:3000/verify
Content-Type: application/json

{
  "base64": "data:image/jpeg;base64,SUABAAIA...=="
}
```

### Resposta esperada:

```json
{
  "isValid": true,
  "confidence": 87.5,
  "details": {
    "documentNumber": "12.345.678-9",
    "issueDate": "12/04/2021"
  }
}
```

---

## 🧠 Validação

A análise textual considera:

- Tamanho e qualidade do texto extraído.
- Presença de termos comuns (ex: "República Federativa", "data de nascimento", "filiação").
- Presença de número de RG e data de emissão.
- Penalizações se identificar “cópia”.

---

## 📁 Estrutura

```bash
src/
├── controllers/
│   └── verifyDocumentController.ts   # Rota principal
├── services/
│   └── googleVisionService.ts        # Integração com Google Vision
├── utils/
│   └── cpfValidator.ts               # Valida CPF (quando necessário)
├── uploads/                          # Arquivos temporários
└── app.ts                            # Setup do Express
```

---

## 🔒 Segurança

- A chave do Google é carregada do `.env` para evitar exposição.
- O serviço não armazena arquivos nem os envia para fora além da Vision API.
- Base64 e MIME type são validados antes de qualquer análise.

---

## 🛠 Tecnologias

- Node.js
- TypeScript
- Express
- Google Cloud Vision API
- Multer (upload)
- Regex / heurísticas de validação

---

## 🤝 Contribuição

Sinta-se à vontade para abrir *issues* ou enviar *pull requests* para melhorias.

---

## 📄 Licença

MIT © João Mateus / Inova.js