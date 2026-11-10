// Gera artigo/Artigo_RS_profilaxia_LV_HIV.docx no formato da Revista de Medicina (USP).
// Uso: node artigo/gerar_artigo.js
// Marcação no texto:  {chave1,chave2} = citação (numerada pela ordem de aparecimento)
//                     [[texto]] = trecho a completar/confirmar (realce amarelo)
//                     **negrito**   _itálico_   ^sobrescrito^
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, PageNumber, Footer, PageBreak, ShadingType,
} = require("docx");

const ROOT = path.resolve(__dirname, "..");
const SCR = "/tmp/claude-0/-home-user-Artigo-MAD/eb703f61-90d5-5b64-98fa-8f1301297af7/scratchpad";
const R1 = JSON.parse(fs.readFileSync(path.join(SCR, "refs.json"), "utf8"));   // 14 estudos
const R2 = JSON.parse(fs.readFileSync(path.join(SCR, "refs2.json"), "utf8"));  // demais

const fix = (s) => s.replace("?.", "?").replace(/\.\./g, ".");
const REFS = {
  alvar: R2["22693548"], lindoso: R2["30410407"], vangriensven: R2["24450618"],
  cota2013: R2["23658850"], cota2011: R2["21666786"],
  ms2015: "Brasil. Ministério da Saúde. Secretaria de Vigilância em Saúde. Departamento de Vigilância das Doenças Transmissíveis. Manual de recomendações para diagnóstico, tratamento e acompanhamento de pacientes com a coinfecção Leishmania-HIV. Brasília: Ministério da Saúde; 2015.",
  prisma: R2["33782057"], robins: R2["27733354"], rob2: R2["31462531"],
  dersimonian: R2["3802833"], higgins: R2["12958120"], egger: R2["9310563"], grade: R2["18436948"],
  ribera1996: R1["8644760"], delgado: R1["9424140"], laguna: R1["9495670"], pintado: R1["11204503"],
  bossolasco: R1["14605142"], lopezvelez: R1["14739148"], pasquau: R1["15928908"],
  goswami: R1["27879457"], diro2019: R1["30789910"], araujo: R1["34562423"],
  mira: R1["15031520"], fcotarelo: R1["13130410"], ribera1995: R1["7711130"], cipriano: R1["28898610"],
  alexandrino: "Alexandrino-de-Oliveira P, Santos-Oliveira JR, Dorval ME, Da-Costa FC, Pereira GR, da Cunha RV, et al. HIV/AIDS-associated visceral leishmaniasis in patients from an endemic area in Central-west Brazil. Mem Inst Oswaldo Cruz. 2010;105(5):692-7. doi:10.1590/s0074-02762010000500016",
  hernandez: "Hernández-Torres A, García-Vázquez E, Bravo-Urbieta J, Bernal Morell E, Alcaraz-Vidal B, Sánchez-Serrano A, et al. La leishmaniasis visceral en la región de Murcia: estudio multicéntrico 1997-2013. Infectio. 2015;19(1):24-30. doi:10.1016/j.infect.2014.11.007",
  molina2007: R2["17684055"], diro2015: R2["26431253"], diro2018: R2["29020217"],
  cota2014: R2["24743472"], henn: R2["29601790"],
};
for (const [k, v] of Object.entries(REFS)) { if (!v) throw new Error("referência ausente: " + k); REFS[k] = fix(v); }

// ---------- formatação ----------
const FONT = "Times New Roman";
const SZ = 24;              // 12 pt
const LINE = 360;           // 1,5
const INDENT = 567;         // 1 cm
const order = [];           // ordem de citação
function cite(keys) {
  const nums = keys.split(",").map((k) => k.trim()).map((k) => {
    if (!REFS[k]) throw new Error("chave de citação desconhecida: " + k);
    if (!order.includes(k)) order.push(k);
    return order.indexOf(k) + 1;
  }).sort((a, b) => a - b);
  // compacta sequências: 1,2,3 -> 1-3
  const out = []; let i = 0;
  while (i < nums.length) {
    let j = i; while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
    out.push(j - i >= 2 ? `${nums[i]}-${nums[j]}` : nums.slice(i, j + 1).join(","));
    i = j + 1;
  }
  return out.join(",");
}
function runs(text, base = {}) {
  const parts = text.split(/(\{[^}]+\}|\[\[[^\]]+\]\]|\*\*[^*]+\*\*|_[^_]+_|\^[^^]+\^)/).filter(Boolean);
  const out = [];
  for (const p of parts) {
    const o = { font: FONT, size: base.size || SZ, ...base };
    if (p.startsWith("{")) out.push(new TextRun({ ...o, text: cite(p.slice(1, -1)), superScript: true }));
    else if (p.startsWith("[[")) out.push(...runs(p.slice(2, -2), { ...base, highlight: "yellow" }));
    else if (p.startsWith("**")) out.push(...runs(p.slice(2, -2), { ...base, bold: true }));
    else if (p.startsWith("_") && p.length > 2) out.push(new TextRun({ ...o, text: p.slice(1, -1), italics: true }));
    else if (p.startsWith("^")) out.push(new TextRun({ ...o, text: p.slice(1, -1), superScript: true }));
    else out.push(new TextRun({ ...o, text: p }));
  }
  return out;
}
const P = (text, opt = {}) => new Paragraph({
  children: runs(text, opt.run || {}),
  alignment: opt.align || AlignmentType.JUSTIFIED,
  spacing: { line: opt.line || LINE, before: opt.before || 0, after: opt.after ?? 120 },
  indent: opt.noIndent ? undefined : { firstLine: INDENT },
  keepNext: opt.keepNext,
});
const C = (text, opt = {}) => P(text, { ...opt, align: AlignmentType.CENTER, noIndent: true });
const L = (text, opt = {}) => P(text, { ...opt, align: AlignmentType.LEFT, noIndent: true });
const H = (text) => new Paragraph({
  children: [new TextRun({ text, font: FONT, size: SZ, bold: true })],
  spacing: { line: LINE, before: 240, after: 120 }, keepNext: true,
});
const H2 = (text) => new Paragraph({
  children: [new TextRun({ text, font: FONT, size: SZ, bold: true, italics: true })],
  spacing: { line: LINE, before: 120, after: 60 }, keepNext: true,
});
const BREAK = () => new Paragraph({ children: [new PageBreak()] });

function figure(file, caption, widthCm = 16) {
  const buf = fs.readFileSync(path.join(ROOT, "artigo", "figuras", file));
  const w = buf.readUInt16BE ? null : null; // dimensões via cabeçalho JPEG
  const { width, height } = jpegSize(buf);
  const px = Math.round(widthCm / 2.54 * 96);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true,
      children: [new ImageRun({ type: "jpg", data: buf, transformation: { width: px, height: Math.round(px * height / width) } })] }),
    P(caption, { noIndent: true, line: 276, run: { size: 20 }, after: 240 }),
  ];
}
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const m = buf[i + 1]; const len = buf.readUInt16BE(i + 2);
    if (m >= 0xC0 && m <= 0xC3) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error("JPEG sem SOF");
}

// ---------- Tabela 1 ----------
const TW = 9071; // largura útil A4 com margens de 2,5 cm
const COLS = [1450, 850, 1350, 800, 1950, 850, 850, 971];
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const line = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
function cell(text, w, { bold = false, top = false, bottom = false, shade = false } = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: { left: none, right: none, top: top ? line : none, bottom: bottom ? line : none },
    shading: shade ? { type: ShadingType.CLEAR, fill: "F2F2F2", color: "auto" } : undefined,
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    children: [new Paragraph({ spacing: { line: 240, after: 0 }, children: runs(text, { size: 17, bold }) })],
  });
}
const T1_HEAD = ["Estudo", "País", "Desenho (período)", "n (P/C)", "Profilaxia (esquema)", "Recidiva P", "Recidiva C", "Principal limitação"];
const T1 = [
  ["Ribera 1996{ribera1996}", "Espanha", "Ensaio não randomizado (1988–1995)", "26/20", "Antimonial 850 mg/mês ou alopurinol 300 mg 8/8 h", "8/26", "13/20", "Controle histórico"],
  ["Delgado Fernández 1997{delgado}", "Espanha", "Coorte retrospectiva (1992–1996)", "17/6", "NR", "3/17", "4/6^a^", "Texto completo não obtido"],
  ["Laguna 1997{laguna}", "Espanha", "Coorte retrospectiva (1986–1994)", "13/10", "Pentamidina 4 mg/kg/mês", "5/13", "5/10", "CD4 menor no grupo P"],
  ["Pintado 2001{pintado}", "Espanha", "Coorte retrospectiva (NR)", "NR", "Antimonial ou anfotericina B", "NR^b^", "NR^b^", "Texto completo não obtido"],
  ["Bossolasco 2003{bossolasco}", "Itália", "Coorte prospectiva (NR)", "5/4", "AmB-L 3 mg/kg/mês", "3/5", "4/4", "n pequeno; 2 controles sem TARV"],
  ["López-Vélez 2004{lopezvelez}", "Espanha", "ECR aberto (NR)", "8/9", "AmB-CL 3 mg/kg a cada 21 dias", "4/8", "7/9", "n pequeno; dados do resumo^a^"],
  ["Pasquau 2005{pasquau}", "Espanha", "Coorte retrospectiva multicêntrica (1988–2001)", "62/93", "Antimonial, pentamidina, AmB ou outros", "NR^c^", "NR^c^", "Contagens por grupo não informadas"],
  ["Goswami 2017{goswami}", "Índia", "Coorte retrospectiva (2005–2015)", "27/24", "AmB 1 mg/kg/mês", "0/27", "18/24", "Controle histórico"],
  ["Diro 2019{diro2019}", "Etiópia", "Coorte prospectiva (2014–2017)", "29/22", "Pentamidina 4 mg/kg/mês", "12/29", "9/22", "Alocação pelo CD4"],
  ["Araújo 2021{araujo}", "Brasil", "Coorte retro e prospectiva (2000–2020)", "11/17", "AmB-L 3–5 mg/kg a cada 15 dias", "4/11", "1/17", "Alocação pelo CD4"],
];
function table1() {
  const rows = [new TableRow({ tableHeader: true, children: T1_HEAD.map((h, i) => cell(h, COLS[i], { bold: true, top: true, bottom: true })) })];
  T1.forEach((r, k) => rows.push(new TableRow({ children: r.map((t, i) => cell(t, COLS[i], { bottom: k === T1.length - 1 })) })));
  return new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COLS, rows });
}

// ---------- CONTEÚDO ----------
const body = [];
const add = (...x) => body.push(...x.flat());

// Página de rosto
add(
  C("**Profilaxia secundária para prevenção de recidiva da leishmaniose visceral em pessoas vivendo com HIV: revisão sistemática e meta-análise**"),
  C("_Secondary prophylaxis for the prevention of visceral leishmaniasis relapse in people living with HIV: a systematic review and meta-analysis_", { after: 360 }),
  C("**[[Autor 1]]^1^, [[Autor 2]]^2^, [[Autor 3]]^3^, Adelson Luiz Ferreira^4^, Rodrigo Moraes^5^, Priscila Pinto e Silva-dos-Santos^6^**", { after: 240 }),
  L("1. Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória – EMESCAM. Vitória, Espírito Santo, Brasil. ORCID: [[XXXX]]. E-mail: [[XXX@edu.emescam.br]]."),
  L("2. Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória – EMESCAM. Vitória, Espírito Santo, Brasil. ORCID: [[XXXX]]. E-mail: [[XXX@edu.emescam.br]]."),
  L("3. Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória – EMESCAM. Vitória, Espírito Santo, Brasil. ORCID: [[XXXX]]. E-mail: [[XXX@edu.emescam.br]]."),
  L("4. Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória – EMESCAM. Vitória, Espírito Santo, Brasil. ORCID: 0009-0005-5190-6093. E-mail: adelson.ferreira@emescam.br"),
  L("5. Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória – EMESCAM. Vitória, Espírito Santo, Brasil. ORCID: 0000-0001-9175-4825. E-mail: rodrigo.moraes@emescam.br"),
  L("6. Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória – EMESCAM. Vitória, Espírito Santo, Brasil. ORCID: 0009-0006-9374-8385. E-mail: priscilap.santos@emescam.br", { after: 240 }),
  L("**Instituição onde o trabalho foi realizado:** Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória – EMESCAM."),
  L("**Apresentação em evento:** [[não se aplica / informar evento, local e data]]."),
  L("**Endereço para correspondência:** [[Nome do 1º autor]]. Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória, Av. Nossa Sra. da Penha, 2190 - Santa Luíza - Vitória, Espírito Santo, Brasil, 29045-402. E-mail: [[XXX@edu.emescam.br]]."),
  BREAK(),
);

// Resumo
add(
  P("**RESUMO: Introdução:** A leishmaniose visceral (LV) em pessoas vivendo com HIV apresenta recidiva frequente, e a profilaxia secundária é recomendada com base em evidência limitada. **Objetivo:** Avaliar a eficácia da profilaxia secundária, comparada à ausência de profilaxia, na prevenção da recidiva da LV em pacientes coinfectados pelo HIV. **Método:** Revisão sistemática com meta-análise conduzida segundo o PRISMA 2020. A busca foi realizada no PubMed/MEDLINE e na Biblioteca Virtual em Saúde (LILACS) em novembro de 2026, sem restrição de data, com os descritores Leishmaniose Visceral, Infecções por HIV, Prevenção Secundária, Quimioprevenção e Recidiva (DeCS/MeSH). Foram incluídos estudos que compararam pacientes com e sem profilaxia secundária e relataram recidiva. Os odds ratios (OR) foram combinados por modelo de efeitos aleatórios. **Resultados:** Dos 389 registros triados, 10 estudos foram incluídos (um ensaio clínico randomizado e nove estudos não randomizados), publicados entre 1996 e 2021 na Espanha, Itália, Índia, Etiópia e Brasil. A profilaxia associou-se a menor chance de recidiva (nove estudos; OR 0,34; IC95% 0,13–0,87), com heterogeneidade substancial (I² = 61%). Nos estudos em que a profilaxia não foi direcionada aos pacientes mais imunossuprimidos, o efeito foi consistente (OR 0,22; IC95% 0,09–0,54; I² = 0%); nos estudos em que a profilaxia foi indicada pela contagem de linfócitos T CD4+, não houve benefício (OR 1,36; IC95% 0,39–4,75). O efeito perdeu significância em análises de sensibilidade, e a certeza da evidência foi muito baixa. **Conclusão:** A profilaxia secundária pode reduzir a recidiva da LV em pessoas vivendo com HIV, mas a evidência é de certeza muito baixa e limitada por confundimento; ensaios clínicos randomizados são necessários.", { noIndent: true }),
  P("**PALAVRAS-CHAVE:** Leishmaniose Visceral; Infecções por HIV; Coinfecção; Prevenção Secundária; Recidiva.", { noIndent: true, after: 360 }),
  P("**ABSTRACT: Introduction:** Visceral leishmaniasis (VL) in people living with HIV frequently relapses, and secondary prophylaxis is recommended on the basis of limited evidence. **Objective:** To evaluate the efficacy of secondary prophylaxis, compared with no prophylaxis, in preventing VL relapse in HIV-coinfected patients. **Method:** Systematic review with meta-analysis conducted according to PRISMA 2020. PubMed/MEDLINE and the Virtual Health Library (LILACS) were searched in November 2026, without date restriction, using the descriptors Leishmaniasis, Visceral; HIV Infections; Secondary Prevention; Chemoprevention; and Recurrence (MeSH/DeCS). Studies comparing patients with and without secondary prophylaxis and reporting relapse were included. Odds ratios (OR) were pooled with a random-effects model. **Results:** Of 389 records screened, 10 studies were included (one randomized controlled trial and nine non-randomized studies), published between 1996 and 2021 in Spain, Italy, India, Ethiopia and Brazil. Prophylaxis was associated with lower odds of relapse (nine studies; OR 0.34; 95% CI 0.13–0.87), with substantial heterogeneity (I² = 61%). In studies in which prophylaxis was not targeted at the most immunosuppressed patients, the effect was consistent (OR 0.22; 95% CI 0.09–0.54; I² = 0%); in studies in which prophylaxis was indicated by CD4+ T-cell count, no benefit was observed (OR 1.36; 95% CI 0.39–4.75). The effect lost significance in sensitivity analyses, and the certainty of the evidence was very low. **Conclusion:** Secondary prophylaxis may reduce VL relapse in people living with HIV, but the evidence is of very low certainty and limited by confounding; randomized controlled trials are needed.", { noIndent: true }),
  P("**KEYWORDS:** Leishmaniasis, Visceral; HIV Infections; Coinfection; Secondary Prevention; Recurrence.", { noIndent: true }),
  BREAK(),
);

// Introdução
add(
  H("INTRODUÇÃO"),
  P("A leishmaniose visceral (LV) é uma doença parasitária sistêmica causada por protozoários do complexo _Leishmania donovani_, transmitida por flebotomíneos e potencialmente fatal quando não tratada. Estima-se a ocorrência de 200 mil a 400 mil casos novos por ano no mundo, e o Brasil concentra a maior parte dos casos registrados nas Américas{alvar}. A coinfecção com o vírus da imunodeficiência humana (HIV) modifica a história natural da doença: os pacientes coinfectados apresentam manifestações atípicas, maior toxicidade ao tratamento, maior mortalidade e recidivas frequentes{lindoso,vangriensven}."),
  P("A recidiva é o principal desafio no seguimento desses pacientes. Na ausência de profilaxia, a recidiva em pacientes coinfectados variou de 26% a 50% em estudos que avaliaram a resposta ao tratamento{cota2013}, e a contagem baixa de linfócitos T CD4+, o antecedente de recidiva e a ausência de profilaxia secundária foram identificados como preditores de novos episódios{cota2011}. Por analogia com outras infecções oportunistas, propõe-se a administração periódica de fármacos antileishmania após o tratamento do episódio agudo (profilaxia secundária), com esquemas que incluem antimoniais pentavalentes, formulações de anfotericina B e pentamidina{vangriensven}. No Brasil, o Ministério da Saúde{ms2015} recomenda a profilaxia secundária com anfotericina B lipossomal para pacientes coinfectados com contagem de linfócitos T CD4+ inferior a 350 células/mm³."),
  P("A única revisão sistemática sobre o tema, publicada em 2011, reuniu seis estudos europeus e estimou redução da recidiva com a profilaxia (OR 0,23), sem heterogeneidade entre os estudos{cota2011}. Desde então, foram publicados estudos da Índia, da Etiópia e do Brasil, com resultados discordantes{goswami,diro2019,araujo}, e a recomendação continua apoiada em estudos observacionais pequenos. Diante disso, esta revisão teve como objetivo avaliar a eficácia da profilaxia secundária, comparada à ausência de profilaxia, na prevenção da recidiva da LV em pessoas vivendo com HIV, e explorar as fontes de heterogeneidade entre os estudos."),
);

// Material e Métodos
add(
  H("MATERIAL E MÉTODOS"),
  H2("Desenho e registro"),
  P("Trata-se de revisão sistemática com meta-análise, relatada segundo as recomendações do _Preferred Reporting Items for Systematic Reviews and Meta-Analyses_ (PRISMA 2020){prisma}. [[O protocolo não foi registrado previamente no PROSPERO. ADEQUAR: registrar antes da submissão ou declarar a ausência de registro.]]"),
  H2("Pergunta de pesquisa e critérios de elegibilidade"),
  P("A pergunta de pesquisa foi estruturada no formato PICO: em pessoas vivendo com HIV tratadas para LV (P), a profilaxia secundária com qualquer fármaco antileishmania (I), comparada à ausência de profilaxia (C), reduz a recidiva da LV (O)? O desfecho primário foi a recidiva de LV; os desfechos secundários foram mortalidade e eventos adversos."),
  P("Foram incluídos ensaios clínicos, randomizados ou não, e estudos observacionais (coortes e caso-controle) que incluíram pacientes com HIV após tratamento de um episódio de LV, compararam um grupo que recebeu profilaxia secundária com um grupo que não a recebeu e relataram a recidiva em cada grupo. Não houve restrição de data, e foram aceitas publicações em português, inglês e espanhol. Foram excluídos relatos e séries de casos sem grupo comparador, revisões narrativas, editoriais, estudos em animais, estudos restritos à leishmaniose tegumentar e estudos que avaliaram apenas a suspensão da profilaxia."),
  H2("Fontes de informação e estratégia de busca"),
  P("A busca foi realizada em 9 de novembro de 2026 no PubMed/MEDLINE e na Biblioteca Virtual em Saúde (BVS), coleção LILACS Plus. A estratégia combinou descritores do _Medical Subject Headings_ (MeSH) e dos Descritores em Ciências da Saúde (DeCS) com termos livres, em três blocos unidos pelo operador AND: doença (Leishmaniasis, Visceral; kala-azar), população (HIV Infections; AIDS; coinfecção) e intervenção ou desfecho (Secondary Prevention; Chemoprevention; prophylaxis; maintenance therapy; Recurrence; relapse). A estratégia do PubMed foi: (\"Leishmaniasis, Visceral\"[Mesh] OR \"visceral leishmaniasis\"[tiab] OR \"kala-azar\"[tiab]) AND (\"HIV Infections\"[Mesh] OR HIV[tiab] OR AIDS[tiab] OR coinfect*[tiab]) AND (\"Secondary Prevention\"[Mesh] OR \"Chemoprevention\"[Mesh] OR prophyla*[tiab] OR \"maintenance therapy\"[tiab] OR \"Recurrence\"[Mesh] OR relaps*[tiab] OR recurren*[tiab]). A estratégia foi adaptada para a BVS com termos em português, espanhol e inglês. As listas de referências da revisão sistemática prévia{cota2011} também foram examinadas."),
  H2("Seleção dos estudos e extração dos dados"),
  P("As duplicatas foram removidas pela comparação do identificador PubMed (PMID) e do título. A triagem por título e resumo e a avaliação dos textos completos foram realizadas de forma independente por duas revisoras (L.C.P. e V.M.C.), e as divergências foram resolvidas por uma terceira revisora (L.V.G.). Os dados foram extraídos por uma revisora (L.C.P.) e conferidos por outra (V.M.C.), em planilha padronizada, com as seguintes variáveis: autor, ano, país, desenho, período, número de pacientes por grupo, fármaco e esquema da profilaxia, recidivas por grupo, seguimento, contagem de linfócitos T CD4+, uso de terapia antirretroviral (TARV), óbitos e eventos adversos. Quando o texto completo não pôde ser obtido, foram utilizados os dados do resumo e as estimativas por estudo publicadas na revisão sistemática prévia{cota2011}, após verificação de consistência entre as duas fontes."),
  H2("Avaliação do risco de viés e da certeza da evidência"),
  P("O risco de viés foi avaliado com o RoB 2 para o ensaio clínico randomizado{rob2} e com o ROBINS-I para os estudos não randomizados{robins}. A certeza da evidência para o desfecho recidiva foi avaliada segundo o sistema GRADE{grade}."),
  H2("Análise estatística"),
  P("A medida de efeito foi o odds ratio (OR) de recidiva, com intervalo de confiança de 95% (IC95%). As estimativas foram combinadas pelo método do inverso da variância com modelo de efeitos aleatórios de DerSimonian e Laird{dersimonian}. Em estudos com casela zero, acrescentou-se 0,5 a todas as caselas. No estudo com dois braços de profilaxia{ribera1996}, os braços foram somados na análise principal. Para o estudo com dados disponíveis apenas como OR e IC95%{pintado}, utilizou-se a estimativa publicada. O estudo que relatou apenas risco relativo ajustado{pasquau} foi incluído somente em análise de sensibilidade. A heterogeneidade foi avaliada pelo teste Q de Cochran, pela estatística I²{higgins}, pela variância entre estudos (τ²) e pelo intervalo de predição de 95%. Foram realizadas análises de subgrupo exploratórias, segundo a forma de alocação da profilaxia e o período de publicação, e análises de sensibilidade, incluindo a exclusão sequencial de cada estudo. A assimetria do gráfico de funil foi avaliada pelo teste de Egger{egger}. As análises foram feitas em Python (bibliotecas NumPy, SciPy e Matplotlib), com nível de significância de 5%."),
);

// Resultados
add(
  H("RESULTADOS"),
  H2("Seleção dos estudos"),
  P("A busca identificou 450 registros (354 no PubMed e 96 na BVS). Após a remoção de 61 duplicatas, 389 registros foram triados por título e resumo, e 19 foram selecionados para leitura do texto completo. Nove relatos não foram recuperados (cinco artigos sem acesso, três teses ou dissertações e um relato com população duplicada{ribera1995}). Dos 10 relatos avaliados pelo texto completo, três foram excluídos: um porque o grupo sem profilaxia era formado por pacientes perdidos no seguimento{cipriano} e dois por não apresentarem dados sobre profilaxia secundária{alexandrino,hernandez}. Três estudos sem texto completo disponível foram incluídos com dados do resumo e da revisão sistemática prévia{delgado,pintado,lopezvelez}. Assim, 10 estudos foram incluídos na revisão e nove na meta-análise principal (Figura 1). Dois estudos com texto completo não obtido e dados insuficientes foram considerados apenas na síntese narrativa{mira,fcotarelo}.", { keepNext: false }),
  figure("Figura1_PRISMA.jpg", "**Figura 1** – Fluxograma de seleção dos estudos, segundo o PRISMA 2020. Fonte: Elaboração própria, 2026."),
  H2("Características dos estudos"),
  P("Os 10 estudos foram publicados entre 1996 e 2021: seis na Espanha, um na Itália, um na Índia, um na Etiópia e um no Brasil (Tabela 1). Um era ensaio clínico randomizado{lopezvelez}, um era ensaio não randomizado{ribera1996}, dois eram coortes prospectivas{bossolasco,diro2019} e seis eram coortes retrospectivas ou mistas. Os estudos com contagens por grupo somaram 248 pacientes (136 com profilaxia e 112 sem profilaxia); o estudo de Pasquau et al.{pasquau} acrescentou 155 pacientes, sem contagem de recidivas por grupo. Os esquemas de profilaxia variaram entre antimonial pentavalente, alopurinol, pentamidina e formulações de anfotericina B, administrados a cada duas a quatro semanas. Nos estudos mais recentes{diro2019,araujo}, a profilaxia foi indicada aos pacientes com contagem de linfócitos T CD4+ abaixo de 200 ou 350 células/mm³."),
  P("**Tabela 1** – Características dos estudos incluídos", { noIndent: true, keepNext: true, after: 60 }),
  table1(),
  P("P: grupo com profilaxia; C: grupo sem profilaxia; NR: não relatado; ECR: ensaio clínico randomizado; AmB: anfotericina B; AmB-L: anfotericina B lipossomal; AmB-CL: anfotericina B em complexo lipídico; TARV: terapia antirretroviral. ^a^Dados derivados do resumo e confirmados pela Figura 3 de Cota et al.{cota2011}. ^b^Apenas OR 0,27 (IC95% 0,08–0,87), extraído de Cota et al.{cota2011}. ^c^Apenas risco relativo ajustado 0,78 (IC95% 0,68–0,89). Fonte: Elaboração própria, 2026.", { noIndent: true, line: 240, run: { size: 18 }, before: 60, after: 240 }),
  H2("Risco de viés"),
  P("[[AVALIAÇÃO PRELIMINAR, A SER CONFIRMADA POR DOIS AVALIADORES:]] o ensaio clínico randomizado foi classificado com algumas preocupações, por ser aberto e ter amostra pequena (17 de 115 pacientes triados){lopezvelez}. Os estudos não randomizados apresentaram risco de viés grave por confundimento: em dois, os grupos foram definidos pelo período de inclusão, configurando controle histórico{ribera1996,goswami}; em três, a profilaxia foi indicada aos pacientes com menor contagem de linfócitos T CD4+, configurando confundimento por indicação{laguna,diro2019,araujo}."),
  H2("Efeito da profilaxia secundária sobre a recidiva"),
  P("A recidiva ocorreu em 39 de 136 pacientes (29%) com profilaxia e em 61 de 112 pacientes (54%) sem profilaxia. Na meta-análise de nove estudos, a profilaxia associou-se a menor chance de recidiva (OR 0,34; IC95% 0,13–0,87; p = 0,025), com heterogeneidade substancial (Q = 20,28; p = 0,009; I² = 61%; τ² = 1,14). O intervalo de predição de 95% variou de 0,02 a 5,40 (Figura 2). O teste de Egger não indicou assimetria (p = 0,48)."),
  figure("Figura2_forest_principal.jpg", "**Figura 2** – Meta-análise do efeito da profilaxia secundária sobre a recidiva da leishmaniose visceral em pessoas vivendo com HIV (odds ratio, modelo de efeitos aleatórios). Fonte: Elaboração própria, 2026."),
  H2("Análises de subgrupo e de sensibilidade"),
  P("A heterogeneidade associou-se à forma de alocação da profilaxia (Figura 3). Nos estudos em que a profilaxia não foi direcionada aos pacientes mais imunossuprimidos (ensaio randomizado ou alocação não informada), o efeito foi consistente (quatro estudos; OR 0,22; IC95% 0,09–0,54; I² = 0%). Nos estudos com controle histórico, o efeito foi de grande magnitude, porém impreciso e heterogêneo (dois estudos; OR 0,05; IC95% 0,00–1,70; I² = 80%). Nos estudos em que a profilaxia foi indicada pela contagem de linfócitos T CD4+, não houve redução da recidiva (três estudos; OR 1,36; IC95% 0,39–4,75; I² = 43%)."),
  figure("Figura3_subgrupos_alocacao.jpg", "**Figura 3** – Análise de subgrupos segundo a forma de alocação da profilaxia secundária. Fonte: Elaboração própria, 2026."),
  P("Os estudos publicados entre 1996 e 2005 mostraram efeito consistente (seis estudos; OR 0,27; IC95% 0,14–0,52; I² = 0%), ao passo que os estudos publicados entre 2017 e 2021 foram heterogêneos e imprecisos (três estudos; OR 0,46; IC95% 0,02–11,97; I² = 86%); a diferença entre os subgrupos não foi significativa (p = 0,75) (Figura 4)."),
  figure("Figura4_subgrupos_periodo.jpg", "**Figura 4** – Análise de subgrupos segundo o período de publicação. Fonte: Elaboração própria, 2026."),
  P("O resultado foi sensível à composição da análise. Com a exclusão do estudo com maior efeito{goswami}, o OR foi 0,45 (IC95% 0,21–1,00). Restrita aos estudos com texto completo avaliado, a estimativa perdeu significância (OR 0,42; IC95% 0,10–1,72). A inclusão do risco relativo ajustado de Pasquau et al.{pasquau} resultou em OR 0,41 (IC95% 0,20–0,86), e o uso apenas do braço antimonial de Ribera et al.{ribera1996} resultou em OR 0,31 (IC95% 0,11–0,84). Na exclusão sequencial, o limite superior do IC95% ultrapassou 1 após a exclusão de três dos nove estudos."),
  H2("Mortalidade, eventos adversos e síntese narrativa"),
  P("A mortalidade foi relatada por grupo em dois estudos: no estudo indiano, não houve óbitos com profilaxia, contra 11 de 24 sem profilaxia{goswami}; no estudo etíope, ocorreram cinco óbitos com pentamidina e um sem profilaxia{diro2019}. Os eventos adversos da profilaxia foram infrequentes: um caso de exantema com alopurinol e nenhum evento com antimonial mensal{ribera1996}, reações leves à infusão de anfotericina B em complexo lipídico{lopezvelez} e um caso de insuficiência renal fatal possivelmente relacionado à pentamidina{diro2019}. Entre os estudos considerados apenas na síntese narrativa, Mira et al.{mira} relataram recidiva em 8 de 21 pacientes sem profilaxia, sem informar as recidivas no grupo com profilaxia no resumo, e Fernández Cotarelo et al.{fcotarelo} não apresentaram dados por grupo no resumo."),
  H2("Certeza da evidência"),
  P("A certeza da evidência para o desfecho recidiva foi classificada como muito baixa, com rebaixamento por risco de viés (predomínio de estudos observacionais com confundimento grave), inconsistência (I² = 61%) e imprecisão (poucos eventos e amostras pequenas)."),
);

// Discussão
add(
  H("DISCUSSÃO"),
  P("Esta revisão incluiu 10 estudos e mostrou que a profilaxia secundária se associa a menor chance de recidiva da LV em pessoas vivendo com HIV, mas com heterogeneidade substancial e certeza muito baixa. A estimativa combinada (OR 0,34) indica efeito menor que o da revisão de 2011 (OR 0,23), que reuniu seis estudos europeus sem heterogeneidade{cota2011}. A diferença decorre da inclusão de estudos publicados após 2011, realizados na Índia, na Etiópia e no Brasil{goswami,diro2019,araujo}, que ampliaram a variabilidade dos resultados."),
  P("A análise de subgrupos sugere que a heterogeneidade se explica, ao menos em parte, pela forma como a profilaxia foi indicada. Nos estudos em que a profilaxia não dependeu da gravidade do paciente, o benefício foi consistente. Nos estudos em que ela foi indicada pela contagem de linfócitos T CD4+, os pacientes que a receberam eram mais imunossuprimidos que os controles: no estudo de Laguna et al.{laguna}, a média de linfócitos T CD4+ foi de 36 células/mm³ no grupo com profilaxia e de 118 células/mm³ no grupo sem profilaxia; no estudo etíope{diro2019}, as medianas foram de 110 e 337 células/mm³; no estudo brasileiro{araujo}, a profilaxia foi indicada aos pacientes com contagem inferior a 350 células/mm³. Como a imunossupressão é o principal preditor de recidiva{cota2011}, esse confundimento por indicação tende a anular ou inverter o efeito observado, o que é compatível com a ausência de benefício nesse subgrupo. Em sentido oposto, os estudos com controle histórico{ribera1996,goswami} compararam pacientes tratados em períodos diferentes, e a melhora do cuidado ao paciente com HIV ao longo do tempo pode ter superestimado o efeito da profilaxia."),
  P("Estudos de braço único, não incluídos na meta-análise, reforçam que a profilaxia não elimina a recidiva. Com anfotericina B lipossomal, 89,7% dos pacientes permaneceram sem recidiva em seis meses{molina2007}; com pentamidina mensal, 71% permaneceram sem recidiva em 12 meses, e o risco de recidiva em dois anos foi de 36,9%{diro2015,diro2018}. Em coorte brasileira de Belo Horizonte, a recidiva em seis meses foi de 37%, apesar da profilaxia com anfotericina B{cota2014}. Esses resultados são inferiores às taxas de recidiva de 26% a 50% descritas sem profilaxia{cota2013}, mas indicam que a recuperação imunológica, e não apenas o fármaco, determina o prognóstico."),
  P("No Brasil, a recomendação de profilaxia com anfotericina B lipossomal do Ministério da Saúde{ms2015}, para pacientes com linfócitos T CD4+ abaixo de 350 células/mm³, apoia-se em evidência majoritariamente europeia. Os dados nacionais que permitem comparar pacientes com e sem profilaxia restringem-se a um estudo de 28 pacientes, que não mostrou benefício{araujo}. Coortes brasileiras maiores descreveram a coinfecção sem analisar a profilaxia{henn,alexandrino}. Essa lacuna é relevante, pois a doença no Brasil é causada por _Leishmania infantum_, e o acesso à TARV e os esquemas de tratamento diferem daqueles dos estudos europeus da década de 1990."),
  P("Esta revisão apresenta limitações. Os estudos incluídos são pequenos, majoritariamente observacionais e utilizaram fármacos, doses e critérios de indicação diferentes. Três estudos foram incluídos sem acesso ao texto completo, com dados do resumo e da revisão prévia, embora as estimativas tenham sido verificadas quanto à consistência. A busca restringiu-se a duas bases de dados, e o número de estudos limita a avaliação do viés de publicação. Por fim, a análise de subgrupos foi exploratória e não permite inferência causal."),
  P("Apesar dessas limitações, os resultados têm implicações para a prática e para a pesquisa. A profilaxia secundária permanece uma medida plausível para pacientes coinfectados com imunossupressão grave, mas a magnitude do benefício é incerta, e o risco de recidiva persiste enquanto não há recuperação imunológica. Ensaios clínicos randomizados, de preferência multicêntricos e realizados em áreas endêmicas da América Latina, são necessários para definir o fármaco, o esquema e os critérios de início e de suspensão da profilaxia."),
);

// Conclusão e demais seções
add(
  H("CONCLUSÃO"),
  P("A profilaxia secundária pode reduzir a recidiva da leishmaniose visceral em pessoas vivendo com HIV, mas a evidência disponível é de certeza muito baixa e limitada por confundimento. Estudos recentes, com profilaxia indicada pela contagem de linfócitos T CD4+, não reproduziram o benefício observado nos estudos europeus mais antigos."),
  P("**AGRADECIMENTOS:** [[opcional]].", { noIndent: true, before: 240 }),
  P("**PARTICIPAÇÃO DOS AUTORES NO TEXTO:** [[Autor 1: concepção, busca, seleção, extração dos dados e redação. Autor 2: ... Autor 3: ...]] Adelson Luiz Ferreira, Rodrigo Moraes, Priscila Pinto e Silva-dos-Santos: orientação, supervisão e revisão do manuscrito.", { noIndent: true }),
  P("[[DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL: ADEQUAR conforme a política da revista. Ferramentas de IA foram usadas como apoio na busca, na extração dos dados, na análise estatística e na redação; os autores revisaram e assumem a responsabilidade pelo conteúdo.]]", { noIndent: true }),
  BREAK(),
  H("REFERÊNCIAS"),
);
order.forEach((k, i) => body.push(new Paragraph({
  children: runs(`${i + 1}. ${REFS[k]}`),
  alignment: AlignmentType.LEFT, spacing: { line: LINE, after: 60 },
  indent: { left: 397, hanging: 397 },
})));

// referências não citadas (verificação)
const unused = Object.keys(REFS).filter((k) => !order.includes(k));
if (unused.length) console.warn("Referências não citadas:", unused.join(", "));

const doc = new Document({
  creator: "Autores", title: "Profilaxia secundária da leishmaniose visceral em pessoas vivendo com HIV",
  styles: { default: { document: { run: { font: FONT, size: SZ } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 },
      margin: { top: 1418, bottom: 1418, left: 1418, right: 1418 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 })] })] }) },
    children: body,
  }],
});
const OUT = path.join(ROOT, "artigo", "Artigo_RS_profilaxia_LV_HIV.docx");
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log("salvo", OUT, "referências:", order.length); });
