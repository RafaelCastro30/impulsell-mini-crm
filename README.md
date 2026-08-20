# Desafio Impulsell — Mini CRM de Leads

## Em resumo

Você recebeu um arquivo com leads de campanhas de marketing. Sua tarefa é construir uma aplicação web pequena para que o time comercial consiga:

1. visualizar os leads;
2. encontrar uma pessoa rapidamente;
3. consultar seus dados;
4. registrar que entrou em contato.

O desafio começa sem aplicação pronta. Queremos observar como você transforma uma necessidade de negócio em uma solução funcional e compreensível.

## Cenário

Paula trabalha no atendimento comercial de uma loja de veículos. Novos interessados chegam por anúncios do Meta, Google, indicação e tráfego orgânico.

Hoje esses dados estão apenas no arquivo [`dados/leads.json`](dados/leads.json). Paula precisa de um mini CRM para organizar o atendimento.

## O que construir

Crie um frontend e uma API que atendam aos critérios abaixo.

### 1. API de leads

Implemente:

```http
GET /leads
```

Deve retornar todos os leads carregados de `dados/leads.json`.

Implemente também:

```http
PATCH /leads/:id/contact
```

Esse endpoint não precisa receber um corpo. Para um identificador válido, deve:

- alterar `status` para `contacted`;
- preencher `lastContactAt` com a data e hora atuais em ISO 8601;
- devolver o lead atualizado;
- manter a alteração em memória enquanto a API estiver rodando.

Para um identificador inexistente, deve responder com `404`.

Não é necessário usar banco de dados.

### 2. Lista de leads

A interface deve consumir a API e exibir, no mínimo:

- nome;
- telefone;
- origem;
- status;
- data de entrada.

Os valores técnicos podem ser traduzidos na interface. Por exemplo, `meta_ads` pode aparecer como “Meta Ads” e `new` como “Novo”.

### 3. Busca e filtros

A pessoa usuária deve conseguir:

- pesquisar por nome ou telefone;
- filtrar por origem;
- filtrar por status;
- combinar busca e filtros.

A pesquisa por nome não deve diferenciar letras maiúsculas de minúsculas.

Você decide se a busca e os filtros serão feitos no frontend, no backend ou nos dois. Explique sua decisão na entrega.

### 4. Detalhes do lead

Ao selecionar um lead, mostre todos os seus dados. Você pode usar uma página, modal, painel lateral, expansão da linha ou outra solução que considerar adequada.

### 5. Registrar contato

A interface deve permitir marcar um lead como contatado usando `PATCH /leads/:id/contact`.

Durante a ação, deixe claro que a atualização está em andamento. Depois, mostre o resultado atualizado sem exigir que a página seja recarregada manualmente.

Também mostre um feedback compreensível se a atualização falhar.

### 6. Estados da interface

Trate pelo menos estes estados:

- carregando os leads;
- falha ao consultar a API;
- nenhum resultado para a busca ou os filtros;
- atualizando um lead;
- falha ao registrar o contato.

### 7. Teste automatizado

Escreva pelo menos um teste para um comportamento importante. Algumas possibilidades:

- registrar o contato de um lead válido;
- rejeitar um identificador inexistente;
- combinar pesquisa e filtros;
- atualizar a interface depois do contato.

Um teste pequeno que protege um comportamento real vale mais do que vários testes superficiais.

## Tecnologias

Use tecnologias compatíveis com a rotina da Impulsell:

- frontend em React ou Next.js;
- backend em Node.js, com o framework que preferir;
- JavaScript ou TypeScript.

Você pode instalar bibliotecas adicionais, mas precisa conseguir explicar suas escolhas.

## Limite de tempo

Reserve **até 4 horas**, contando a configuração inicial.

- Pare quando atingir o limite.
- Se não concluir tudo, entregue o que fez e explique o que priorizou.
- Uma solução parcial bem compreendida pode ser melhor avaliada do que uma solução completa que você não consegue explicar.

Não implemente autenticação, banco de dados, Docker, deploy ou integrações externas. Eles não fazem parte do desafio.

## O que não estamos procurando

- Arquitetura sofisticada para um problema pequeno.
- Fidelidade a um layout específico.
- Uma quantidade grande de bibliotecas ou arquivos.
- Funcionalidades extras antes do fluxo principal.
- Trabalho além do limite de tempo.

## Uso de inteligência artificial

Você pode usar ChatGPT, Claude, Copilot, Codex ou ferramentas semelhantes.

Queremos entender como você utilizou essas ferramentas e como verificou o resultado. Não queremos uma coleção completa de prompts.

Preencha a seção correspondente em [`ENTREGA.md`](ENTREGA.md), incluindo um exemplo de sugestão que você alterou, verificou ou descartou.

## Entrega

1. Crie um repositório privado com a sua solução.
2. Inclua este README, os dados fornecidos e o arquivo `ENTREGA.md` preenchido.
3. Escreva instruções suficientes para executar frontend, backend e testes.
4. Conceda acesso ao avaliador informado no processo seletivo.
5. Envie o link do repositório.

O histórico de commits ajuda a entender seu processo, mas a quantidade de commits não faz parte da nota.

## Como será a avaliação

Os critérios e pesos estão em [`CRITERIOS.md`](CRITERIOS.md).

Depois da entrega, você participará de uma conversa técnica de aproximadamente 30 minutos para:

- demonstrar o fluxo principal;
- explicar suas decisões;
- comentar o teste e o uso de IA;
- trabalhar em uma pequena alteração com apoio do entrevistador.

O objetivo é entender seu raciocínio e sua capacidade de aprender, não medir velocidade de digitação.

Boa construção. Faça algo pequeno, funcional e que você compreenda por inteiro.
