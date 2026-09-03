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


## V16 — Fotos obrigatórias da moradia na adoção

O formulário de adoção passou a exigir evidências fotográficas de segurança:
- Gatos (casa ou apartamento): mínimo de 2 fotos das janelas/telas.
- Cães: mínimo de 1 foto da casa/apartamento e 1 foto do pátio/área externa.

As imagens são enviadas diretamente ao Cloudinary por upload assinado e as URLs ficam vinculadas à solicitação no Neon. O painel ADM mostra essas fotos na análise do candidato.


## Fotos obrigatórias da moradia (V17)

Regras simplificadas do formulário de adoção:
- Felinos: mínimo de 2 fotos das janelas/telas, independentemente de casa ou apartamento.
- Caninos: mínimo de 1 foto do pátio/área externa.
- O campo de foto “Casa / apartamento” foi removido.
- O servidor repete a mesma validação antes de gravar a solicitação no Neon.
- As imagens continuam sendo enviadas ao Cloudinary e as URLs ficam na solicitação.


## V18 — fotos flexíveis e WhatsApp de adoção
- Cadastro de animal exige somente 1 foto.
- É possível adicionar várias fotos; com uma única foto o perfil público não mostra miniaturas nem contador.
- O CMS ganhou o campo `Responsável pelas adoções` (padrão: Luise) e usa `adoptionWhatsApp` para o contato.
- Perfis dos animais, página de contato e confirmação do formulário podem exibir botão direto para o WhatsApp da responsável.


## V19 — WhatsApp por unidade da clínica

- O painel possui campos separados de WhatsApp para Gravataí e Cachoeirinha em `Configurações → Contatos`.
- Ao abrir um serviço e clicar em `Agendar atendimento`, a página de agendamento mostra as duas unidades com o número configurado e botão direto para WhatsApp.
- O serviço escolhido é preservado na mensagem enviada ao WhatsApp.
- Nas páginas individuais das unidades, o botão de agendamento também abre o WhatsApp correspondente e não retorna mais ao fluxo de agendamento.


## V20 — máscaras padronizadas

- Telefones e WhatsApps usam máscara brasileira `(DD) 99999-9999` / `(DD) 9999-9999`.
- A máscara foi aplicada ao formulário de adoção, Forge Connect, contatos e campos do painel.
- Nascimento aproximado aceita somente 4 dígitos.
- PIN do painel e campos numéricos relevantes aceitam somente números.
- Datas continuam usando o seletor nativo de data do navegador.
- Nenhum fluxo, regra ou layout foi alterado nesta versão.


## Equipe veterinária (V21)

Rotas:
- `/veterinarios`
- perfis individuais em `/veterinarios/[nome]`

A página utiliza as 6 artes originais enviadas pela Onda Animal.
O CMS permite mostrar/esconder o link `Veterinários` no menu e rodapé.

O botão `Agendar` leva o nome do profissional para a página de agendamento.
Ao escolher Gravataí ou Cachoeirinha, a mensagem do WhatsApp inclui o profissional selecionado.


## Assistente IA de Adoção (V22)

A IA foi integrada ao cadastro de animais já existente no `/admin` — não existe cadastro paralelo.

Fluxo:
1. adicione uma ou mais fotos do animal (a galeria continua ilimitada; a IA usa até 4 fotos);
2. clique em `✨ Preencher cadastro com IA`;
3. a IA sugere nome, espécie, sexo quando visualmente identificável, idade/nascimento aproximados, raça/SRD, cor, porte e peso aproximado quando possível;
4. um modal exige revisão humana e confirmação de vacinação, castração, vermifugação, necessidades especiais, energia, temperamento e convivência;
5. ao aplicar, a IA gera `Resumo do card`, `História completa` e `Lar ideal` usando somente os dados confirmados;
6. cada um desses três textos tem `✨ Reescrever com IA`;
7. nada é salvo no Neon até o usuário salvar o cadastro normalmente.

### Variáveis na Vercel

Adicione em `Settings → Environment Variables`:

- `OPENAI_API_KEY` — Secret, somente servidor;
- `OPENAI_MODEL` — opcional; padrão do projeto: `gpt-5.6-luna`.

Depois faça `Redeploy`.

O endpoint `/api/health` informa `ai: openai-configured` quando a chave está disponível.

### Segurança e responsabilidade

- A chave OpenAI nunca é enviada para o navegador.
- A rota `/api/admin/ai` exige sessão administrativa válida.
- A IA é instruída a não inventar vacinação, castração, vermifugação, doenças, temperamento, energia ou compatibilidade.
- Sexo não é inferido por aparência geral: quando a anatomia não permite identificação, o modal exige confirmação humana.


## CMS da equipe veterinária (V23)

A área `Painel → Veterinários` agora controla a equipe pública pelo Neon.

Cada profissional pode ter:
- nome, arte/apresentação, função, CRMV e ano de formação;
- especialidades/categorias;
- destaque e resumo;
- ordem de exibição;
- ativo/inativo sem excluir;
- agendamento ligado/desligado;
- unidades de atendimento independentes: Gravataí e/ou Cachoeirinha.

O agendamento respeita essas unidades:
- se o profissional atende somente em Gravataí, Cachoeirinha não aparece;
- se atende somente em Cachoeirinha, Gravataí não aparece;
- se atende nas duas, o cliente escolhe;
- se o agendamento estiver desativado ou sem unidades, o botão de agendar fica indisponível.

As artes novas dos veterinários são enviadas ao Cloudinary.
Os cadastros e configurações ficam no Neon em `site_store`, portanto aparecem em qualquer dispositivo.

Também é possível editar pelo painel os textos da página pública `/veterinarios`.
Não é necessário criar nova tabela nem executar SQL manual.
