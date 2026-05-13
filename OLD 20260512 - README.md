# 🛒 Shop List

> Lista de compras com controle de estoque doméstico — PWA offline-first, sem backend, sem conta, sem rastreamento.

---

## ✨ Funcionalidades

### Três abas integradas

| Aba | Função |
|-----|--------|
| **All** | Gerencia o catálogo completo de itens da despensa |
| **Selected** | Controla quantidades mínimas e atuais com steppers |
| **Refill** | Lista o que está em falta para a próxima compra |

### Experiência mobile-first

- **Swipe para ação** — deslize um item para a esquerda para excluir, para a direita para ativar/desativar o estoque
- **Toque no nome** — abre o modal de edição diretamente
- **Stepper tátil** — controle de quantidade com botões `−` e `+` em todos os contextos
- **Tema claro/escuro** — persistido entre sessões

### Organização e filtros

- **Categorias via `#hashtag`** na descrição do item (ex: `#laticínios · 500g`)
- **Favoritos** — estrela acessível em todas as abas, sincronizada em tempo real sem re-render
- **Ordenação cíclica** — A·Z → #·Z (por categoria) → ★↕ (favoritos primeiro)
- **Filtro rápido ⭐** — exibe apenas favoritos com contagem em toast
- **Busca por texto e `#categoria`** com autocomplete

### Dados e segurança

- **Persistência local** via `localStorage` — nenhum dado sai do dispositivo
- **Timestamp de base** — ao abrir o app, um diálogo exibe quando os dados foram salvos pela última vez e pergunta se deseja importar uma base mais recente
- **Exportar/Importar** em `.json` para backup e transferência entre dispositivos
- **Banner de backup** após 10 alterações consecutivas

---

## 🗂 Estrutura de arquivos

```
/
├── index.html       # App principal — HTML, CSS e JS em arquivo único
├── manifest.json       # Manifesto PWA (nome, ícones, cores, atalhos)
├── sw.js               # Service Worker (cache offline)
├── icon-192.png        # Ícone padrão (Android, favicon)
├── icon-512.png        # Ícone splash / loja
└── icon-maskable.png   # Ícone adaptável Android (safe zone 80%)
```

Todos os arquivos precisam estar na **mesma pasta** no servidor.

---

## 🚀 Deploy

O app precisa ser servido via HTTPS para que o Service Worker funcione. Escolha qualquer host estático:

### GitHub Pages

1. Crie um repositório público e faça upload dos 6 arquivos na raiz
2. Vá em **Settings → Pages → Source**: `main / root`
3. Acesse `https://<usuario>.github.io/<repositorio>/index.html`

### Netlify (arraste e solte)

1. Acesse [netlify.com](https://netlify.com) → **Sites → Add new → Deploy manually**
2. Arraste a pasta com os 6 arquivos
3. URL gerada automaticamente

### Vercel (CLI)

```bash
npx vercel --prod
```

### Qualquer servidor HTTP

```bash
# Python (desenvolvimento local)
python3 -m http.server 8080
# Acesse http://localhost:8080/index.html
```

> ⚠️ `file://` não funciona para PWA — use sempre um servidor HTTP, mesmo localmente.

---

## 📲 Instalação no dispositivo

### Android (Chrome / Edge)

O banner de instalação aparece automaticamente na primeira visita. Clique em **Instalar** no banner verde ou use o menu do navegador → *Instalar aplicativo*.

### iPhone / iPad (Safari)

1. Toque no ícone de **Compartilhar** (quadrado com seta ↑)
2. Role e toque em **"Adicionar à Tela de Início"**
3. Confirme o nome e toque em **Adicionar**

### Atalhos de tela inicial

O manifesto registra dois atalhos acessíveis com toque longo no ícone (Android):

| Atalho | URL |
|--------|-----|
| Adicionar item | `index.html?action=add` |
| Lista de compras | `index.html?tab=2` |

---

## ⚙️ Service Worker

Estratégia de cache dupla para máxima confiabilidade:

| Tipo de requisição | Estratégia | Comportamento |
|--------------------|------------|---------------|
| HTML principal | **Network-First** | Busca versão atualizada na rede; cai no cache se offline |
| Assets locais (ícones, manifesto) | **Cache-First** | Resposta instantânea do cache; atualiza em background |
| Fontes Google | **Cache-First** | Cached na primeira visita; offline sem delay |

**Atualização automática:** quando uma nova versão do SW estiver disponível, um banner roxo aparece com o botão "Atualizar". O app recarrega automaticamente após aplicar a atualização.

Para publicar uma nova versão, incremente `CACHE_VERSION` em `sw.js`:

```js
const CACHE_VERSION = 'shoplist-v2'; // era v1
```

---

## 🗄 Formato de dados

Os dados são salvos no `localStorage` com a chave `Shop_List_v20260510`:

```json
{
  "savedAt": "2026-05-11T14:32:00.000Z",
  "data": [
    {
      "id": "id-abc123",
      "name": "Manteiga",
      "desc": "#laticínios · 200g",
      "inStock": true,
      "min": 2,
      "qty": 1,
      "fav": false
    }
  ]
}
```

O campo `_done` (checkbox da aba Reposição) é **estado de sessão** — não é persistido entre aberturas do app.

O arquivo exportado (`.json`) é compatível com o formato acima e também com o formato legado (array puro), para retrocompatibilidade.

---

## 🛠 Desenvolvimento

Nenhuma dependência, nenhum build step. Edite `index.html` diretamente.

```bash
# Clone e sirva localmente
git clone https://github.com/<usuario>/<repositorio>.git
cd <repositorio>
python3 -m http.server 8080
```

Para testar o SW e o manifesto, use o Chrome DevTools:
- **Application → Service Workers** — status, atualização forçada
- **Application → Manifest** — validação do manifesto
- **Application → Storage** — inspeção do localStorage
- **Lighthouse** — auditoria PWA completa (score de instalabilidade)

---

## 🔒 Privacidade

- Nenhum dado é enviado a servidores externos
- Sem cookies, sem analytics, sem rastreamento
- Fontes carregadas do Google Fonts na primeira visita (cacheadas depois)
- Totalmente funcional offline após a primeira abertura

---

## 📄 Licença

MIT — use, modifique e distribua livremente.
