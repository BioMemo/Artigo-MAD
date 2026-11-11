# Estratégias de busca: dose de manutenção na imunoterapia oral

Ao rodar cada busca, anotem a **data** e o **número de resultados**. Os dois vão para a seção de Métodos e para o fluxograma PRISMA.

| Base | Quem | Data | Resultados | Arquivo |
|---|---|---|---|---|
| PubMed/MEDLINE | Claude | 11/11/2026 | 201 | `busca/pubmed_2026-11-11.nbib` |
| BVS/LILACS | Vocês | | | |
| Cochrane CENTRAL | Vocês | | | |
| ClinicalTrials.gov | Vocês | | | |

---

## 1. PubMed: já feita

```
("Food Hypersensitivity"[Mesh] OR "food allerg*"[tiab] OR peanut[tiab] OR "cow* milk"[tiab] OR milk[tiab] OR egg[tiab] OR wheat[tiab] OR sesame[tiab] OR "tree nut*"[tiab] OR cashew[tiab] OR walnut[tiab] OR hazelnut[tiab]) AND ("Desensitization, Immunologic"[Mesh] OR "oral immunotherapy"[tiab] OR OIT[tiab] OR "oral desensiti*"[tiab] OR "oral tolerance induction"[tiab] OR "specific oral tolerance"[tiab]) AND (dose[tiab] OR doses[tiab] OR dosing[tiab] OR "low-dose"[tiab] OR "low dose"[tiab] OR maintenance[tiab]) AND ("Randomized Controlled Trial"[pt] OR "Controlled Clinical Trial"[pt] OR randomi*[tiab])
```

---

## 2. BVS/LILACS

**Onde:** https://pesquisa.bvsalud.org/portal/

**Como:** colar tudo na caixa de busca, numa linha só. No filtro "Base de dados", **marcar LILACS**. Depois exportar em **RIS** (para o Rayyan) ou CSV.

Aqui não usei os blocos de dose e de ensaio randomizado: a LILACS é pequena, e esses filtros poderiam perder estudos mal indexados.

```
(mh:"Hipersensibilidade Alimentar" OR tw:"alergia alimentar" OR tw:"alergia alimentaria" OR tw:"food allergy" OR tw:amendoim OR tw:peanut OR tw:maní OR tw:cacahuete OR tw:"leite de vaca" OR tw:"leche de vaca" OR tw:"cow's milk" OR tw:ovo OR tw:huevo OR tw:egg OR tw:trigo OR tw:wheat OR tw:castanha* OR tw:nuez OR tw:"tree nut") AND (mh:"Dessensibilização Imunológica" OR tw:"imunoterapia oral" OR tw:"inmunoterapia oral" OR tw:"oral immunotherapy" OR tw:"dessensibilização oral" OR tw:"desensibilización oral" OR tw:"oral desensitization" OR tw:"indução de tolerância oral" OR tw:"inducción de tolerancia oral" OR tw:OIT)
```

---

## 3. Cochrane CENTRAL (ensaios clínicos)

**Onde:** https://www.cochranelibrary.com, em **Advanced search** > **Search manager**. No Brasil, o acesso é gratuito.

**Como:** criar uma linha por vez, na ordem abaixo. Na linha #8, clicar no número de resultados e abrir a aba **"Trials"** (essa é a CENTRAL). Exportar em **RIS**.

```
#1  MeSH descriptor: [Food Hypersensitivity] explode all trees
#2  ("food allerg*" OR peanut* OR milk OR egg OR wheat OR sesame OR "tree nut*" OR cashew OR walnut OR hazelnut):ti,ab,kw
#3  #1 OR #2
#4  MeSH descriptor: [Desensitization, Immunologic] explode all trees
#5  ("oral immunotherapy" OR OIT OR "oral desensiti*" OR "oral tolerance induction" OR "specific oral tolerance"):ti,ab,kw
#6  #4 OR #5
#7  (dose OR doses OR dosing OR "low-dose" OR "low dose" OR maintenance):ti,ab,kw
#8  #3 AND #6 AND #7
```

---

## 4. ClinicalTrials.gov (ensaios em andamento ou não publicados)

**Onde:** https://clinicaltrials.gov, na busca avançada ("More filters").

**Como preencher:**
- **Condition/disease:** `food allergy OR peanut allergy OR milk allergy OR egg allergy OR wheat allergy OR tree nut allergy`
- **Intervention/treatment:** `oral immunotherapy`
- **Other terms:** `dose OR maintenance`
- **Study type:** Interventional

Exportar a lista em **CSV** (botão "Download"). Esses registros não entram no Rayyan. Servem para:
- identificar ensaios terminados com resultados publicados só no site;
- citar na Discussão os ensaios ainda em andamento.

---

## 5. Depois das buscas

1. Mandem aqui os arquivos exportados (RIS/CSV) e os números de resultados.
2. Eu junto tudo com o PubMed, removo as duplicatas e gero **um único arquivo RIS** para o Rayyan.
3. Vocês importam no Rayyan e fazem a triagem **cega e independente** (L.C.P. e V.M.C.; divergências: L.V.G.).

> **Rayyan:** criem a revisão em https://www.rayyan.ai, convidem as três revisoras e ativem o **"Blind ON"**, para que uma não veja a decisão da outra até o fim da triagem.
