# Guia do avaliador

Use este guia para avaliar todas as pessoas candidatas com as mesmas expectativas. Registre evidências antes de registrar uma recomendação.

## Processo

1. Revise a entrega e preencha uma nota preliminar.
2. Faça a conversa técnica de 30 minutos usando o mesmo roteiro.
3. Atualize notas apenas quando surgirem novas evidências.
4. Se houver dois avaliadores, cada um pontua antes do debrief.

## Roteiro de 30 minutos

|     Tempo | Atividade                                   |
| --------: | ------------------------------------------- |
|   0–3 min | Acolhimento e explicação da dinâmica        |
|   3–9 min | Demonstração do fluxo principal             |
|  9–19 min | Perguntas sobre produto, código, teste e IA |
| 19–27 min | Pequena alteração ao vivo                   |
| 27–30 min | Dúvidas e encerramento                      |

É permitido consultar código e documentação. Observe como a pessoa investiga, formula hipóteses, valida o resultado e recebe sugestões.

## Perguntas principais

Faça as mesmas perguntas para todas as pessoas:

1. O que você priorizou dentro do limite e o que deixou para depois?
2. Acompanhe no código o caminho dos dados entre o arquivo, a API e a interface.
3. Onde um erro pode acontecer nesse fluxo e como ele é tratado?
4. Por que você implementou a pesquisa e os filtros dessa forma?
5. Por que escolheu esse comportamento para testar?
6. Mostre uma sugestão da IA que você verificou, alterou ou rejeitou.

Perguntas de aprofundamento, quando necessárias:

- Se a API retornasse dez mil leads, o que você investigaria antes de alterar a solução?
- Como investigaria um caso em que a API atualiza o lead, mas a tela continua com o status antigo?
- O que deveria acontecer se a conexão ficasse lenta durante o registro do contato?
- Qual informação buscaria antes de criar outra funcionalidade para o time comercial?

## Alteração ao vivo

Escolha uma opção antes de iniciar o processo e use a mesma com todas as pessoas candidatas:

- mostrar somente leads que nunca foram contatados;
- ordenar os leads mais recentes primeiro sem quebrar os filtros;
- pedir confirmação antes de registrar o contato;
- impedir dois cliques simultâneos na ação de contato.

Não é obrigatório concluir. Avalie se a pessoa localiza o ponto de mudança, explica o plano, experimenta e valida.

## Pontuação

Para cada competência de [`CRITERIOS.md`](CRITERIOS.md), atribua uma nota de 1 a 4 e registre pelo menos uma evidência concreta.

```text
nota final = soma((nota da competência / 4) × peso da competência)
```

- **75 a 100:** avançar.
- **60 a 74:** discutir no debrief, considerando potencial e necessidade de acompanhamento.
- **Abaixo de 60:** não avançar neste momento.

A faixa apoia a decisão, mas não substitui as evidências. Uma entrega parcial não elimina automaticamente. A pessoa, porém, precisa conseguir executar ou investigar o projeto e explicar com honestidade o código enviado.

## Ficha de avaliação

```md
# Avaliação — [nome]

## Evidências da entrega

- Fluxo demonstrado:
- Pontos concluídos:
- Pontos incompletos:
- Testes executados:

## Scorecard

| Competência               | Peso | Nota (1–4) | Evidência |
| ------------------------- | ---: | ---------: | --------- |
| Fluxo principal           |  30% |            |           |
| Fundamentos técnicos      |  20% |            |           |
| Raciocínio de produto     |  15% |            |           |
| Experiência de uso        |  15% |            |           |
| Qualidade e testes        |  10% |            |           |
| Comunicação e aprendizado |  10% |            |           |

Nota final:

## Alteração ao vivo

- Alteração solicitada:
- Como investigou:
- Resultado:
- Evidências observadas:

## Recomendação

- [ ] Avançar
- [ ] Discutir no debrief
- [ ] Não avançar neste momento

Justificativa baseada em evidências:

Riscos ou lacunas a validar:
```

## Debrief

Quando houver mais de um avaliador, responda antes da discussão:

1. Qual é a evidência mais forte a favor da contratação?
2. Qual é o principal risco observado?
3. Em qual competência as notas divergem e por quê?
4. A lacuna é compatível com estágio e desenvolvível com acompanhamento?
5. Qual é a recomendação final baseada nas evidências?

Não use estilo de comunicação, nervosismo, velocidade de digitação ou semelhança cultural como substitutos para competência.
