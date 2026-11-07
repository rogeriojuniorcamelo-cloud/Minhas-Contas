# MINHAS CONTAS — Controle Financeiro Pessoal

Aplicativo moderno, elegante, intuitivo e responsivo para controle de despesas mensais, contas parceladas, despesas recorrentes, pagamentos, vencimentos e compromissos financeiros.

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
   - Suporte a despesas **Recorrentes**, **Parceladas** e **À Vista**.
   - Campos: Nome da despesa, Categoria personalizável com ícones, Valor total/período, Valor da parcela, Data de vencimento, Quantidade de parcelas, Parcelas restantes calculadas automaticamente e Observações.

3. **Despesas Recorrentes (Novo)**
   - Repetições configuráveis: **Semanalmente**, **Mensalmente**, **A cada 2 meses**, **A cada 3 meses**, **A cada 6 meses** e **Anualmente**.
   - Definição de data de início, data de término (opcional) e dia fixo de vencimento (1 a 31).
   - Ajuste automático para meses menores como fevereiro (28 ou 29 dias) e meses de 30 dias, sem distorcer o dia original nos meses subsequentes.
   - Geração automática e contínua de lançamentos futuros sem duplicidade.
   - Opção de edição flexível: alterar **apenas o lançamento atual** ou **este e todos os próximos lançamentos**.
   - Opção de **interromper a recorrência**, preservando integralmente os lançamentos passados e o histórico de pagamentos.

4. **Gerenciamento de Categorias (Novo)**
   - Área dedicada "Gerenciar categorias" acessível no cabeçalho e nos filtros.
   - Criação de novas categorias com nome personalizado, seletor com mais de 24 ícones financeiros e paleta de cores.
   - Edição de categorias existentes mantendo o vínculo automático com as despesas já cadastradas.
   - Exclusão segura: se houver despesas associadas, o aplicativo exige a escolha de uma categoria substituta para reclassificação antes da exclusão, impedindo perda de dados.
   - Prevenção de categorias duplicadas (validação sem distinção de maiúsculas/minúsculas).
   - Armazenamento 100% no IndexedDB com preservação de todas as categorias padrão.

5. **Lista & Tabela de Contas**
   - Visualização alternável entre **Cartões responsivos** (ideal para celular) e **Tabela completa** (desktop).
   - Filtros instantâneos por mês/ano, busca textual, filtro por tipo (Recorrente, Parcelada, À Vista), filtro por categoria e por situação (Todas, Pendentes, Pagas, Atrasadas).
   - Ordenação inteligente: Vencimento mais próximo/distante, Maior/Menor valor e Ordem alfabética.

6. **Controle Inteligente de Parcelas & Quitação**
   - Cálculo automático das parcelas restantes e do saldo devedor.
   - Registro rápido de quitação: pagar uma parcela pontual ou **liquidar todas as parcelas restantes**.
   - Cronograma detalhado: veja cada parcela com data mensal prevista, status e data do pagamento.
   - Suporte a **desfazer/estornar** pagamentos caso registrado por engano.

7. **Armazenamento 100% Local com IndexedDB**
   - Todos os dados (despesas e categorias) ficam armazenados diretamente no navegador do dispositivo.
   - Sem custos de banco de dados, sem autenticação obrigatória e sem envio de dados a terceiros.
   - Exportação e restauração de backup em arquivo JSON com 1 clique (`backup-minhas-contas-AAAA-MM-DD.json`).
   - Confirmação de segurança antes de excluir qualquer registro.

8. **Instalação no Android (PWA)**
   - Funciona como aplicativo nativo no Android e desktop via Progressive Web App.
   - Manifesto `manifest.webmanifest`, ícones de alta resolução (192px, 512px, maskable e SVG).
   - Service Worker com suporte offline: abra e use suas contas mesmo sem conexão com a internet.
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

O projeto é **100% estático** (não exige servidor Node.js em produção). A configuração `base: './'` no `vite.config.ts` garante que o app funciona em qualquer subpasta do GitHub Pages.

```bash
# 1. Gerar os arquivos estáticos de produção:
npm run build

# 2. Enviar para o repositório GitHub (já configurado com GitHub Actions):
git add .
git commit -m "feat: adicionar despesas recorrentes e gerenciamento de categorias"
git push origin main
```
