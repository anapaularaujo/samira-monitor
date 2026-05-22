# Samira Monitor

Painel de monitoramento navegável para análise de histórico de tickets por atendimento.

## Funcionalidades

- Upload de planilhas CSV, XLS e XLSX diretamente no navegador.
- Dashboard executivo com KPIs, tendência por período, distribuição por status, ranking de atendentes e alertas de qualidade.
- Sistema de filtros avançados por período, atendente, canal, status, prioridade e busca livre.
- Análise detalhada em tabela com exportação da base filtrada.
- Gestão de critérios configuráveis para SLA, satisfação, backlog, FCR e palavras-chave críticas.
- Relatórios customizados por atendente, canal, status, prioridade ou categoria.
- Exportação de dados filtrados, relatório CSV e relatório JSON.

## Como executar

Este projeto é uma aplicação web estática. Abra `index.html` no navegador ou rode um servidor local:

```bash
python3 -m http.server 8080
```

Depois acesse:

```text
http://localhost:8080
```

## Colunas reconhecidas

O upload tenta mapear automaticamente colunas com nomes equivalentes a:

```text
ticket, data_abertura, data_fechamento, atendente, canal, status, prioridade,
categoria, cliente, satisfacao, sla_horas, tempo_atendimento_horas,
primeira_resposta_horas, fcr, descricao
```

Também há um botão na tela de upload para baixar um modelo CSV.
