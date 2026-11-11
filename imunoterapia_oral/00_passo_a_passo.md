# Revisão 3: Dose baixa vs dose padrão na manutenção da imunoterapia oral para alergia alimentar

Início: 11/11/2026

## Pergunta (PICO)

| | Definição |
|---|---|
| **P** | Crianças e adultos com alergia alimentar IgE-mediada (amendoim, leite, ovo, trigo, castanhas, gergelim etc.), confirmada por teste de provocação oral ou por história clínica com sensibilização |
| **I** | Imunoterapia oral com **dose de manutenção menor** |
| **C** | Imunoterapia oral com **dose de manutenção maior** (padrão), no mesmo estudo |
| **O** | **Primários:** (1) dessensibilização, ou seja, tolerar a dose-alvo no teste de provocação ao fim do tratamento; (2) reações sistêmicas ou anafilaxia durante o tratamento. **Secundários:** uso de adrenalina, abandono por evento adverso, tolerância sustentada (sem reação após suspender), esofagite eosinofílica, qualidade de vida |
| **Desenho** | Ensaios clínicos randomizados que comparem diretamente duas ou mais doses de manutenção. Estudos comparativos não randomizados entram só em análise de sensibilidade |

> Como "dose baixa" varia entre alimentos e estudos, a comparação é sempre **dentro do mesmo estudo** (dose menor vs maior). Na análise, dá para separar subgrupos por alimento e pela razão entre as doses.

## Passo a passo

| # | Etapa | Quem faz | Produto |
|---|---|---|---|
| 1 | Revisar o PICO com o orientador | Vocês | PICO aprovado |
| 2 | **Registrar o protocolo no PROSPERO**, antes da triagem | Vocês (eu redijo o texto de cada campo) | Número CRD |
| 3 | Busca no **PubMed** | Claude | Lista de registros |
| 4 | Busca na **BVS/LILACS** e na **Cochrane CENTRAL** | Vocês (eu passo as estratégias prontas) | Arquivos exportados (RIS/CSV) |
| 5 | Busca de ensaios em andamento no **ClinicalTrials.gov** | Vocês (estratégia pronta) | Lista de ensaios |
| 6 | Remoção de duplicatas e preparo do arquivo para o Rayyan | Claude | Arquivo RIS único |
| 7 | **Triagem por título e resumo**, independente e cega, no Rayyan (gratuito) | L.C.P. e V.M.C.; divergências: L.V.G. | Lista para texto completo |
| 8 | Obter os PDFs (Periódicos CAPES, e-mail ao autor) | Vocês | PDFs |
| 9 | **Leitura do texto completo** e decisão de inclusão, em dupla | L.C.P. e V.M.C.; divergências: L.V.G. | Estudos incluídos + motivos de exclusão |
| 10 | **Extração dos dados** em planilha padronizada | L.C.P. extrai e V.M.C. confere (Claude pode pré-preencher para conferência) | Planilha de extração |
| 11 | **Risco de viés** com RoB 2, em dupla | L.C.P. e V.M.C. | Tabela de risco de viés |
| 12 | Meta-análise: risco relativo, efeitos aleatórios, subgrupos por alimento, sensibilidade | Claude | Forest plots (JPEG, 300 dpi) |
| 13 | Certeza da evidência (GRADE) e tabela "Resumo dos achados" | Claude propõe, vocês validam | Tabela GRADE |
| 14 | Fluxograma PRISMA 2020 | Claude | Figura |
| 15 | Redação no formato da Revista de Medicina (USP) | Claude rascunha, vocês revisam | Artigo .docx |
| 16 | Revisão final do orientador e submissão | Vocês | Submissão |

## Estratégia do PubMed (testada em 11/11/2026: 201 registros)

```
("Food Hypersensitivity"[Mesh] OR "food allerg*"[tiab] OR peanut[tiab] OR "cow* milk"[tiab] OR milk[tiab] OR egg[tiab] OR wheat[tiab] OR sesame[tiab] OR "tree nut*"[tiab] OR cashew[tiab] OR walnut[tiab] OR hazelnut[tiab]) AND ("Desensitization, Immunologic"[Mesh] OR "oral immunotherapy"[tiab] OR OIT[tiab] OR "oral desensiti*"[tiab] OR "oral tolerance induction"[tiab] OR "specific oral tolerance"[tiab]) AND (dose[tiab] OR doses[tiab] OR dosing[tiab] OR "low-dose"[tiab] OR "low dose"[tiab] OR maintenance[tiab]) AND ("Randomized Controlled Trial"[pt] OR "Controlled Clinical Trial"[pt] OR randomi*[tiab])
```

Os 4 blocos (alimento, imunoterapia oral, dose/manutenção e ensaio randomizado) são unidos por AND.

## Ensaios já conhecidos (devem aparecer na busca; servem para validar a estratégia)
- Yanagida N et al., 2020, World Allergy Organ J: 100% vs 25% da dose (ovo, leite, trigo); PMID 33024480
- Ensaio de amendoim 30 mg vs 300 mg, 2026, J Allergy Clin Immunol Pract; PMID 41109568
- Ensaio de leite com dose fixa baixa vs escalonamento para dose média, 2026, J Allergy Clin Immunol Pract; PMID 41633410
- Ensaio de ovo com dose baixa vs alta, 2025, Asian Pac J Allergy Immunol; PMID 37061933
