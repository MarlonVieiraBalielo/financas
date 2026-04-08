# Tutorial: Rodando o App Financas

## Parte 1 — Configurar o Supabase (backend gratuito)

### 1.1 Criar conta e projeto

1. Acesse **https://supabase.com** e crie uma conta gratuita
2. Clique em **New Project**
3. Escolha um nome (ex: `financas`), defina uma senha forte para o banco e selecione a região mais próxima (South America)
4. Aguarde o projeto inicializar (~1 min)

### 1.2 Criar as tabelas

1. No painel do Supabase, vá em **SQL Editor** (ícone de terminal no menu lateral)
2. Clique em **New query**
3. Copie todo o conteúdo do arquivo `supabase/schema.sql` deste projeto
4. Cole no editor e clique em **Run**
5. Deve aparecer "Success" para cada comando

### 1.3 Pegar as credenciais

1. Vá em **Project Settings** → **API**
2. Copie:
   - **Project URL** (formato: `https://xxxxxxxxxxx.supabase.co`)
   - **anon public** key (chave longa embaixo de "Project API keys")

### 1.4 Colar as credenciais no projeto

Abra o arquivo `src/lib/supabase.ts` e substitua:

```ts
const SUPABASE_URL = "https://SEU_PROJETO.supabase.co";   // ← cole aqui
const SUPABASE_ANON_KEY = "SUA_ANON_KEY";                 // ← cole aqui
```

---

## Parte 2 — Rodar localmente no Windows

### 2.1 Pré-requisitos

Instale na ordem abaixo caso não tenha:

| Ferramenta | Link | Verificar |
|---|---|---|
| Node.js 20 LTS | https://nodejs.org | `node -v` |
| Git | https://git-scm.com | `git -v` |
| Expo CLI | (instala no passo 2.2) | `npx expo --version` |

Para Android físico ou emulador, instale também:
- **Android Studio** → https://developer.android.com/studio
- Após instalar, vá em SDK Manager e instale o Android SDK 34

### 2.2 Instalar dependências do projeto

Abra o terminal (PowerShell ou cmd) dentro da pasta do projeto:

```bash
cd C:\xampp\htdocs\Financas
npm install
```

Aguarde baixar todos os pacotes (pode demorar alguns minutos na primeira vez).

### 2.3 Rodar o projeto

```bash
npx expo start
```

Vai aparecer um **QR Code** no terminal.

**Opção A — Testar no celular (mais fácil):**
1. Instale o app **Expo Go** na Play Store ou App Store
2. Aponte a câmera do celular para o QR Code
3. O app abre direto no celular (celular e PC precisam estar na mesma rede Wi-Fi)

**Opção B — Testar no emulador Android:**
1. Abra o Android Studio → Device Manager → crie um emulador
2. Inicie o emulador
3. No terminal com o Expo rodando, pressione `a`

**Opção C — Testar no navegador (funcional mas limitado):**
- Pressione `w` no terminal com o Expo rodando

---

## Parte 3 — Gerar o APK para instalar no Android

Caso queira um arquivo `.apk` para instalar direto no celular:

### 3.1 Instalar EAS CLI

```bash
npm install -g eas-cli
eas login
```

Crie conta em https://expo.dev se não tiver.

### 3.2 Configurar o build

```bash
eas build:configure
```

Escolha **Android** quando perguntar.

### 3.3 Buildar o APK

```bash
eas build -p android --profile preview
```

Após concluir (5–15 min, roda na nuvem), você recebe um link para baixar o `.apk`.

---

## Parte 4 — Deploy no CasaOS (servidor doméstico)

Esta parte transforma o app em uma **versão web** e a serve no seu CasaOS com domínio próprio.

### 4.1 Gerar o build web

No seu PC com Windows, dentro da pasta do projeto:

```bash
npx expo export -p web
```

Isso gera uma pasta `dist/` com os arquivos estáticos do site.

### 4.2 Transferir para o CasaOS

**Opção A — Via SSH (recomendado):**

```bash
# No terminal do Windows (PowerShell)
scp -r dist/* usuario@IP_DO_CASAOS:/DATA/AppData/nginx/html/financas/
```

Substitua `usuario` e `IP_DO_CASAOS` pelos dados da sua rede local.

**Opção B — Via interface web do CasaOS:**
1. Acesse o painel do CasaOS no navegador
2. Vá em **Files** (gerenciador de arquivos)
3. Navegue até `/DATA/AppData/` e crie a pasta `financas`
4. Faça upload de todos os arquivos da pasta `dist/`

### 4.3 Configurar o Nginx no CasaOS

No CasaOS, o Nginx já vem instalado. Acesse via SSH:

```bash
ssh usuario@IP_DO_CASAOS
```

Crie o arquivo de configuração do site:

```bash
sudo nano /etc/nginx/conf.d/financas.conf
```

Cole o conteúdo abaixo (substitua `financas.seudominio.com` pelo seu domínio):

```nginx
server {
    listen 80;
    server_name financas.seudominio.com;

    root /DATA/AppData/nginx/html/financas;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`.

Teste e recarregue o Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4.4 Configurar domínio com HTTPS (opcional mas recomendado)

Se seu roteador tem IP fixo ou você usa um serviço de DNS dinâmico (ex: DuckDNS, Cloudflare):

```bash
# Instalar Certbot para gerar certificado SSL gratuito
sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d financas.seudominio.com
```

O Certbot configura o HTTPS automaticamente e renova o certificado a cada 90 dias.

### 4.5 Liberar a porta no roteador (para acesso externo)

Se quiser acessar de fora da sua rede local:

1. Acesse o painel do seu roteador (geralmente `192.168.1.1` ou `192.168.0.1`)
2. Vá em **Port Forwarding** (Encaminhamento de portas)
3. Crie uma regra:
   - Porta externa: `80` e `443`
   - IP interno: IP do seu CasaOS (ex: `192.168.1.100`)
   - Porta interna: `80` e `443`

---

## Resumo dos comandos principais

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npx expo start

# Gerar build web para produção
npx expo export -p web

# Gerar APK Android
eas build -p android --profile preview
```

---

## Problemas comuns

| Problema | Solução |
|---|---|
| `npm install` trava | Delete a pasta `node_modules` e tente de novo |
| QR Code não funciona | Confirme que celular e PC estão no mesmo Wi-Fi |
| Erro de CORS no Supabase | Vá em Supabase → Authentication → URL Configuration e adicione seu domínio |
| Tela branca no build web | Verifique se o Nginx tem `try_files $uri /index.html` |
| App não autentica em produção | Adicione a URL do site em Supabase → Auth → Redirect URLs |

---

## Configurar o Supabase para produção

Após colocar no ar, faça isso no painel do Supabase:

1. Vá em **Authentication** → **URL Configuration**
2. Em **Site URL**, coloque: `https://financas.seudominio.com`
3. Em **Redirect URLs**, adicione: `https://financas.seudominio.com/**`
4. Salve

Isso permite que o login e o cadastro funcionem corretamente no domínio de produção.
