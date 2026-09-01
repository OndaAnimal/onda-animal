# Onda Animal — Produção Git + Vercel + Neon

Esta é a versão preparada para produção do portal de adoção da Onda Animal.

## O que já está conectado ao Neon

Os dados abaixo deixam de depender do navegador e ficam compartilhados entre os computadores:

- animais e as URLs das duas fotos de cada perfil;
- ficha completa dos animais;
- status: Disponível, Em processo, Adotado e Indisponível;
- solicitações/formulários de adoção;
- status e observações internas das solicitações;
- Histórias de adoções concluídas;
- avaliações/pesquisa de satisfação;
- configurações do CMS;
- Forge Connect, conversas e mensagens.

O `localStorage` permanece apenas como cache/compatibilidade de interface. O Neon é a fonte persistente dos dados em produção. As imagens novas ficam no Cloudinary e o Neon guarda somente as URLs.

## Segurança do painel

O painel continua em:

```text
/admin
```

O PIN não fica exposto no JavaScript público. Configure o PIN na variável de ambiente `ADMIN_PIN` do Vercel.

A sessão administrativa usa cookie `HttpOnly`, assinado com `AUTH_SECRET`, com duração de 12 horas.

---

# 1. Testar no computador

Entre na pasta do projeto e execute:

```bash
npm install
```

Crie o arquivo `.env.local` copiando `.env.example` e preencha os valores.

Depois:

```bash
npm run dev
```

Site:

```text
http://localhost:3000
```

Painel:

```text
http://localhost:3000/admin
```

Teste do banco:

```text
http://localhost:3000/api/health
```

Quando o banco estiver correto, deve retornar algo semelhante a:

```json
{"ok":true,"database":"connected","service":"onda-animal"}
```

---

# 2. Criar o banco no Neon

Crie um projeto PostgreSQL no Neon e copie a connection string **pooled**.

Ela será usada em:

```text
DATABASE_URL
```

Exemplo de formato:

```text
postgresql://usuario:senha@host/neondb?sslmode=require
```

## Tabelas

Não é obrigatório criar as tabelas manualmente. Na primeira chamada ao banco, o sistema executa `CREATE TABLE IF NOT EXISTS` automaticamente.

O SQL completo também está disponível em:

```text
db/schema.sql
```

As tabelas são:

- `site_store`
- `adoption_applications`
- `site_feedback`
- `chat_conversations`
- `chat_messages`

Na primeira abertura, os animais de demonstração existentes no projeto são usados como seed inicial caso a chave `animals` ainda não exista no Neon.

---

# 3. Criar o repositório no GitHub

Dentro da pasta:

```bash
git init
git branch -M main
git add .
git commit -m "Onda Animal - versão produção"
```

Crie um repositório vazio no GitHub, por exemplo:

```text
onda-animal-site
```

Depois conecte:

```bash
git remote add origin https://github.com/SEU-USUARIO/onda-animal-site.git
git push -u origin main
```

O `.gitignore` já impede o envio de:

- `.env`
- `.env.local`
- `node_modules`
- `.next`
- `.vercel`

Nunca envie a `DATABASE_URL`, `ADMIN_PIN` ou `AUTH_SECRET` para o GitHub.

---

# 4. Subir no Vercel

No Vercel:

1. `Add New` → `Project`.
2. Importe o repositório `onda-animal-site`.
3. Framework: Next.js.
4. Antes do deploy, cadastre as variáveis de ambiente.

## Environment Variables

```text
DATABASE_URL
ADMIN_PIN
AUTH_SECRET
NEXT_PUBLIC_SITE_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Use a mesma `DATABASE_URL` copiada do Neon.

Para `ADMIN_PIN`, escolha o PIN real do painel.

Para `AUTH_SECRET`, use uma chave longa e imprevisível. No PowerShell você pode gerar uma com:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

No primeiro deploy, você pode usar a futura URL do projeto em `NEXT_PUBLIC_SITE_URL`, ou atualizar essa variável depois que o Vercel informar a URL e fazer um novo deploy.

---

# 5. Depois do deploy

Teste primeiro:

```text
https://SEU-SITE.vercel.app/api/health
```

Depois:

```text
https://SEU-SITE.vercel.app/admin
```

Cadastre um animal de teste no painel. Abra o site em outro navegador/dispositivo e confirme que o animal aparece. Isso confirma que a gravação está indo para o Neon e não apenas para o computador local.

Também teste:

1. formulário de adoção;
2. mudança do status da solicitação no painel;
3. conclusão de adoção + publicação em Histórias;
4. pesquisa de satisfação;
5. Forge Connect em outro dispositivo;
6. alterações de cor/banner/textos no CMS.

---

# CMS do painel

Em `Painel → Configurações` você pode alterar:

- logo e favicon;
- cores;
- tamanho das fontes;
- arredondamento;
- menu;
- aviso superior;
- banner da Home;
- textos e botões;
- seções da Home;
- contatos;
- redes sociais;
- rodapé;
- Forge Connect;
- pesquisa de satisfação;
- modo manutenção;
- SEO;
- CSS personalizado.

As configurações salvas pelo painel são armazenadas no Neon em `site_store`.

---

# Armazenamento das imagens — Cloudinary

A partir desta versão, uploads feitos no painel **não são mais gravados dentro do Neon**.

Fluxo:

```text
Painel ADM -> upload assinado no servidor -> Cloudinary -> URL salva no Neon
```

São enviados ao Cloudinary:

- as 2 fotos de cada animal;
- foto final de uma adoção/História;
- logo personalizada;
- favicon;
- banner da Home;
- imagem social do CMS.

O upload é feito por uma rota administrativa protegida. O `CLOUDINARY_API_SECRET` nunca é enviado ao navegador.

## Configurar o Cloudinary

1. Crie uma conta no Cloudinary.
2. No Dashboard, copie `Cloud name`, `API Key` e `API Secret`.
3. Na Vercel, adicione:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

As três podem ser cadastradas para Production e Preview. O `API Secret` deve sempre permanecer como Secret.

4. Faça um novo Redeploy na Vercel.
5. Abra `/api/health`. O retorno deve incluir:

```json
"media":"cloudinary-configured"
```

6. Entre em `/admin`, cadastre uma foto de teste e salve o animal.

## Imagens antigas

Se alguma versão anterior já tiver salvado imagens em base64 no Neon, use:

```text
Painel -> Configurações -> Segurança e backup -> Migrar para Cloudinary
```

O sistema envia as imagens antigas ao Cloudinary, troca o conteúdo pelo URL e salva novamente os registros no Neon.

---

# Estrutura principal

```text
app/
  api/
    admin/
    applications/
    connect/
    feedback/
    health/
    public/
  admin/
  adocao/
  avaliacao/
  historias/
components/
data/
db/
lib/
public/
```

## Rotas principais

```text
/                         Home
/adocao                   Animais disponíveis
/adocao/[slug]            Perfil individual
/adocao/[slug]/formulario Formulário de interesse
/historias                Adoções concluídas
/como-adotar              Como funciona
/avaliacao                 Pesquisa de satisfação
/contato                   Contato
/admin                     Painel administrativo
/api/health                Teste Neon
```

---

# Atualizações futuras pelo Git

Depois da primeira publicação:

```bash
git add .
git commit -m "Atualiza Onda Animal"
git push
```

Se o projeto do Vercel estiver conectado ao GitHub, cada `git push` na branch principal fará um novo deploy automaticamente.


## Performance de imagens (V15)

- Os animais e configurações são carregados do Neon no servidor antes do HTML ser enviado.
- A Home não espera mais um `fetch` no navegador para descobrir as fotos reais.
- Cloudinary entrega tamanhos adequados para card, hero, galeria e histórias.
- `f_auto` e `q_auto` continuam ativos.
- Imagens acima da dobra usam prioridade/eager; imagens abaixo usam lazy loading.
- O layout faz `preconnect` com `res.cloudinary.com`.

Resultado esperado: elimina o atraso visual de aproximadamente 1 segundo que ocorria quando o conteúdo real era buscado somente depois da hidratação.
