# AppCEP

Aplicação em Next.js + TypeScript com Tailwind, Material UI e Zod para consultar CEPs via [ViaCEP](https://viacep.com.br/), preencher automaticamente os campos e salvar os dados em disco.

## Principais funcionalidades
- Formulário responsivo com campos de CEP, logradouro, número, complemento, bairro, cidade e estado, controles de caracteres e máscaras.
- Validações com Zod exibindo mensagens amigáveis campo a campo.
- Busca automática no ViaCEP ao sair do campo de CEP e preenchimento dos demais campos.
- Botões de limpar e salvar (Material UI). O botão salvar persiste os dados no arquivo `data/saved-addresses.json`.
- Layout moderno com gradientes, componentes do Material UI e alternância entre tema claro/escuro.
- Testes automatizados com React Testing Library cobrindo validações e integrações com fetch/axios simulados.

## Scripts úteis

```bash
npm install        # instala dependências
npm run dev        # sobe o servidor de desenvolvimento em http://localhost:3000
npm run lint       # roda o ESLint
npm run test       # executa a suíte do Jest/RTL
```

## Estrutura relevante

- `src/components/CepForm.tsx` – formulário completo com validações, integração ViaCEP (axios) e chamadas à API `/api/salvar`.
- `src/components/ThemeToggle.tsx` – botão para alternar entre tema claro e escuro.
- `src/providers/theme.tsx` – provedor do Material UI com persistência do tema.
- `src/app/api/salvar/route.ts` – endpoint REST que valida os dados com Zod e grava no arquivo JSON.
- `data/saved-addresses.json` – banco local onde cada salvamento é anexado com timestamp.
- `src/components/__tests__/CepForm.test.tsx` – testes automatizados com React Testing Library.

## Fluxo da aplicação
1. Informe o CEP com 8 dígitos; ao sair do campo os demais dados são preenchidos automaticamente via ViaCEP.
2. Ajuste qualquer campo manualmente; validações são aplicadas tanto no blur quanto no momento de salvar.
3. Clique em **Limpar** para resetar todos os campos ou em **Salvar** para persistir os dados no arquivo JSON.
4. Utilize o ícone de sol/luar para alternar entre os temas claro e escuro.

## Requisitos originais do teste
1. Criar um formulário com os campos: CEP, Logradouro, Número, Complemento, Bairro, Cidade e Estado.
2. Validar campos (tipagem e controle de caracteres) utilizando Zod.
3. Incluir botões de **LIMPAR** e **SALVAR** (Material UI).
4. Ao digitar o CEP e sair do campo, preencher automaticamente os demais campos com ViaCEP.
5. Botão **LIMPAR** remove todos os dados; botão **SALVAR** registra os valores em um arquivo JSON.
6. Stack: Next.js + TypeScript (TSX), TailwindCSS, Material UI, Axios para consumo REST e React Testing Library para testes.
