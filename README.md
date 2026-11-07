# MINHAS CONTAS — Controle Financeiro Pessoal

Aplicativo moderno, elegante, intuitivo e responsivo para controle de despesas mensais, contas parceladas, pagamentos, vencimentos e compromissos financeiros.

Desenvolvido especialmente em **Português Brasileiro (pt-BR)** com armazenamento local seguro via **IndexedDB** e conformidade total com **PWA (Progressive Web App)** para instalação no Android e computadores.

---

## 🌟 Funcionalidades Principais

1. **Painel Principal & Indicadores**
   - Total de despesas cadastradas e total do período selecionado.
   - Total já pago com barra de progresso visual percentual.
   - Total ainda pendente / a pagar.
   - Quantidade de contas cadastradas e parcelas restantes.
   - Alertas destacados para **Contas Atrasadas**, **Contas que Vencem Hoje** e **Próximas do Vencimento (7 dias)**.

2. **Cadastro & Edição de Despesas**
   - Suporte a despesas **À Vista** ou **Parceladas**.
   - Campos: Nome da despesa, Categoria com ícones, Valor total, Valor da parcela, Data de vencimento, Quantidade total de parcelas, Quantidade de parcelas pagas, Parcelas restantes calculadas automaticamente e Observações.
   - Cálculo e sincronização automática entre valor total, número de parcelas e valor da parcela.

3. **Lista & Tabela de Contas**
   - Visualização alternável entre **Cartões responsivos** (ideal para celular) e **Tabela completa** (desktop).
   - Filtros instantâneos por mês/ano, busca textual por nome ou observações, filtro por categoria e por situação (Todas, Pendentes, Pagas, Atrasadas).
   - Ordenação inteligente: Vencimento mais próximo, Mais distante, Maior valor, Menor valor e Ordem alfabética.

4. **Controle Inteligente de Parcelas**
   - Cálculo automático das parcelas restantes e do saldo devedor.
   - Registro rápido de quitação: pagar a próxima parcela ou **liquidar todas as parcelas restantes**.
   - Cronograma detalhado: veja cada parcela (1 a N) com sua data mensal prevista, status e data do pagamento.
   - Suporte a **desfazer/estornar** pagamentos caso você tenha marcado por engano.
   - Impede registros além do total de parcelas.

5. **Armazenamento 100% Local com IndexedDB**
   - Todos os dados ficam armazenados diretamente no navegador do seu dispositivo.
   - Sem custos de banco de dados, sem autenticação obrigatória e sem envio de dados a terceiros.
   - Exportação de backup em arquivo JSON com 1 clique (`backup-minhas-contas-AAAA-MM-DD.json`).
   - Restauração de backup em JSON (substituindo ou mesclando dados).
   - Confirmação de segurança antes de excluir qualquer despesa.

6. **Instalação no Android (PWA)**
   - Funciona como aplicativo nativo no Android e desktop via Progressive Web App.
   - Manifesto `manifest.webmanifest`, ícones de alta resolução (192px, 512px, maskable e SVG).
   - Service Worker com suporte offline: abra e use suas contas mesmo sem internet.
   - Botão direto "Instalar App" no cabeçalho.

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

Abra no navegador em `http://localhost:3000`.

---

## 🌐 Publicação Gratuita no GitHub Pages

O projeto foi construído para ser **100% estático** (não exige servidor Node.js em produção). A configuração `base: './'` no `vite.config.ts` garante que o app funciona em qualquer subpasta do GitHub Pages.

### Passo a passo rápido:

1. **Gere os arquivos de produção:**
   ```bash
   npm run build
   ```
   Isso criará a pasta `dist/` com todos os arquivos estáticos otimizados.

2. **Crie um repositório no GitHub:**
   - Acesse [github.com/new](https://github.com/new) e crie um repositório (ex: `minhas-contas`).

3. **Envie seu código:**
   ```bash
   git init
   git add .
   git commit -m "Publicação Minhas Contas"
   git remote add origin https://github.com/SEU-USUARIO/minhas-contas.git
   git push -u origin main
   ```

4. **Ative o GitHub Pages:**
   - No GitHub, acesse **Settings** > **Pages**.
   - Em **Build and deployment** > **Source**, selecione **Deploy from a branch** e aponte para a pasta `dist` (ou utilize a action padrão Vite do GitHub).
   - Você também pode usar o pacote `gh-pages`:
     ```bash
     npx gh-pages -d dist
     ```

5. **Pronto!** Seu aplicativo estará no ar gratuitamente com HTTPS e PWA funcionando.
