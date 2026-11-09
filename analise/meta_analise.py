"""
Meta-análise: profilaxia secundária vs nenhuma profilaxia na recidiva de
leishmaniose visceral em pessoas vivendo com HIV.

Medida de efeito: odds ratio (OR), escala logarítmica.
Modelo principal: efeitos aleatórios (DerSimonian-Laird), inverso da variância.
Correção de continuidade: 0,5 em todas as células quando houver alguma célula zero.

Os dados vêm de 03_planilha_extracao_dados.xlsx (aba Extração).
Para rodar: python3 analise/meta_analise.py
"""
import math
from pathlib import Path

import numpy as np
from scipy import stats
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent / "resultados"
OUT.mkdir(exist_ok=True)

# --------------------------------------------------------------------------
# Dados
# Campos: estudo, ano, país, eI, nI, eC, nC  (recidivas / n)
# ou estudo, ano, país, logOR, SE  (quando só há OR e IC)
# 'era': "1996–2005" (estudos europeus, era pré/início da TARV) ou
#        "2017–2021" (estudos recentes, Índia/Etiópia/Brasil)
# 'alocacao': como os grupos foram formados
# --------------------------------------------------------------------------
def from_ci(or_, lo, hi):
    lor = math.log(or_)
    se = (math.log(hi) - math.log(lo)) / (2 * 1.959964)
    return lor, se

STUDIES = [
    # Ribera 1996: análise principal com os DOIS braços de profilaxia somados
    # (antimonial 3/17 + alopurinol 5/9), segundo o PICO ("qualquer profilaxia").
    dict(id="Ribera 1996", pais="Espanha", eI=8, nI=26, eC=13, nC=20,
         era="1996–2005", alocacao="Época (controle histórico)", fonte="Texto completo"),
    dict(id="Delgado Fernández 1997", pais="Espanha", eI=3, nI=17, eC=4, nC=6,
         era="1996–2005", alocacao="Não informada", fonte="Resumo + Cota 2011"),
    dict(id="Laguna 1997", pais="Espanha", eI=5, nI=13, eC=5, nC=10,
         era="1996–2005", alocacao="Critério clínico (CD4 menor no grupo profilaxia)", fonte="Texto completo"),
    dict(id="Pintado 2001", pais="Espanha", ci=(0.269, 0.084, 0.867),
         era="1996–2005", alocacao="Não informada", fonte="Cota 2011 (OR e IC)"),
    dict(id="Bossolasco 2003", pais="Itália", eI=3, nI=5, eC=4, nC=4,
         era="1996–2005", alocacao="Não informada", fonte="Texto completo"),
    dict(id="López-Vélez 2004", pais="Espanha", eI=4, nI=8, eC=7, nC=9,
         era="1996–2005", alocacao="Randomizada (ECR)", fonte="Resumo + Cota 2011"),
    dict(id="Goswami 2017", pais="Índia", eI=0, nI=27, eC=18, nC=24,
         era="2017–2021", alocacao="Época (controle histórico)", fonte="Texto completo"),
    dict(id="Diro 2019", pais="Etiópia", eI=12, nI=29, eC=9, nC=22,
         era="2017–2021", alocacao="Critério clínico (CD4 < 200)", fonte="Texto completo"),
    dict(id="Araújo 2021", pais="Brasil", eI=4, nI=11, eC=1, nC=17,
         era="2017–2021", alocacao="Critério clínico (CD4 < 350)", fonte="Texto completo"),
]

# Pasquau 2005: só RR ajustado (Cox) 0,78 (0,68–0,89). Não é OR -> entra apenas
# em análise de sensibilidade (aproximação declarada).
PASQUAU = dict(id="Pasquau 2005*", pais="Espanha", ci=(0.78, 0.68, 0.89),
               era="1996–2005", alocacao="Não informada", fonte="Texto completo (RR ajustado)")


def effect(s):
    """Retorna logOR, SE e as contagens (com correção, se aplicada)."""
    if "ci" in s:
        lor, se = from_ci(*s["ci"])
        return lor, se
    a, b = s["eI"], s["nI"] - s["eI"]
    c, d = s["eC"], s["nC"] - s["eC"]
    if 0 in (a, b, c, d):
        a, b, c, d = a + .5, b + .5, c + .5, d + .5
    lor = math.log((a * d) / (b * c))
    se = math.sqrt(1 / a + 1 / b + 1 / c + 1 / d)
    return lor, se


def meta(studies):
    y = np.array([effect(s)[0] for s in studies])
    se = np.array([effect(s)[1] for s in studies])
    v = se ** 2
    w = 1 / v
    k = len(y)
    # efeito fixo
    fe = np.sum(w * y) / np.sum(w)
    fe_se = math.sqrt(1 / np.sum(w))
    Q = float(np.sum(w * (y - fe) ** 2))
    df = k - 1
    pQ = 1 - stats.chi2.cdf(Q, df) if df > 0 else float("nan")
    C = np.sum(w) - np.sum(w ** 2) / np.sum(w)
    tau2 = max(0.0, (Q - df) / C) if df > 0 else 0.0
    I2 = max(0.0, (Q - df) / Q) * 100 if Q > 0 else 0.0
    # efeitos aleatórios (DerSimonian-Laird)
    wr = 1 / (v + tau2)
    re = np.sum(wr * y) / np.sum(wr)
    re_se = math.sqrt(1 / np.sum(wr))
    z = re / re_se
    p = 2 * (1 - stats.norm.cdf(abs(z)))
    # intervalo de predição (t com k-2 gl)
    if k >= 3:
        tcrit = stats.t.ppf(0.975, k - 2)
        pi = (re - tcrit * math.sqrt(tau2 + re_se ** 2), re + tcrit * math.sqrt(tau2 + re_se ** 2))
    else:
        pi = (float("nan"), float("nan"))
    return dict(k=k, y=y, se=se, w_re=wr / np.sum(wr) * 100,
                re=re, re_lo=re - 1.959964 * re_se, re_hi=re + 1.959964 * re_se, p=p,
                fe=fe, fe_lo=fe - 1.959964 * fe_se, fe_hi=fe + 1.959964 * fe_se,
                Q=Q, df=df, pQ=pQ, I2=I2, tau2=tau2, pi=pi)


def egger(studies):
    y = np.array([effect(s)[0] for s in studies])
    se = np.array([effect(s)[1] for s in studies])
    res = stats.linregress(1 / se, y / se)
    t = res.intercept / res.intercept_stderr
    p = 2 * (1 - stats.t.cdf(abs(t), len(y) - 2))
    return res.intercept, p


def fmt(x):
    return f"{math.exp(x):.2f}".replace(".", ",")


def summary_line(m):
    return (f"OR {fmt(m['re'])} (IC95% {fmt(m['re_lo'])}–{fmt(m['re_hi'])}); "
            f"p = {m['p']:.3f}; I² = {m['I2']:.0f}%; τ² = {m['tau2']:.3f}; "
            f"Q = {m['Q']:.2f} (gl = {m['df']}, p = {m['pQ']:.3f})").replace(".", ",", 0)


# --------------------------------------------------------------------------
# Forest plot
# --------------------------------------------------------------------------
plt.rcParams["font.family"] = "Liberation Serif"   # métrica igual a Times New Roman


def forest(groups, fname, title, overall=None, note=""):
    """groups: lista de (rótulo_do_subgrupo ou None, lista de estudos, meta do subgrupo)."""
    rows = []
    for label, sts, m in groups:
        if label:
            rows.append(("header", label))
        for s, y, se, w in zip(sts, m["y"], m["se"], m["w_re"]):
            rows.append(("study", s, y, se, w))
        if label or overall is None:
            rows.append(("diamond", f"Subtotal (I² = {m['I2']:.0f}%)" if label else
                         f"Total, efeitos aleatórios (I² = {m['I2']:.0f}%)", m))
        rows.append(("blank",))
    if overall is not None:
        rows.append(("diamond", f"Total, efeitos aleatórios (I² = {overall['I2']:.0f}%)", overall))

    n = len(rows)
    fig_h = 2.0 + 0.32 * n
    fig, ax = plt.subplots(figsize=(11, fig_h), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(-3.0, n + 1)
    ax.axis("off")
    # colunas
    X_STUDY, X_I, X_C, X_PLOT0, X_PLOT1, X_OR, X_W = 0.05, 3.0, 4.15, 5.3, 8.4, 8.6, 10.35
    lo_lim, hi_lim = math.log(0.01), math.log(100)

    def px(v):
        v = min(max(v, lo_lim), hi_lim)
        return X_PLOT0 + (v - lo_lim) / (hi_lim - lo_lim) * (X_PLOT1 - X_PLOT0)

    top = n + 0.3
    hdr = dict(fontsize=10, fontweight="bold", va="center")
    ax.text(X_STUDY, top, "Estudo", **hdr)
    ax.text(X_I, top, "Profilaxia\nrecidivas/n", ha="center", **hdr)
    ax.text(X_C, top, "Sem profilaxia\nrecidivas/n", ha="center", **hdr)
    ax.text((X_PLOT0 + X_PLOT1) / 2, top, "Odds ratio (IC95%)", ha="center", **hdr)
    ax.text(X_OR + 0.75, top, "OR [IC95%]", ha="center", **hdr)
    ax.text(X_W, top, "Peso", ha="center", **hdr)
    ax.plot([0, 11], [top - 0.45, top - 0.45], color="black", lw=0.8)

    for i, r in enumerate(rows):
        yy = n - i - 0.5
        if r[0] == "header":
            ax.text(X_STUDY, yy, r[1], fontsize=10, fontweight="bold", fontstyle="italic", va="center")
        elif r[0] == "study":
            s, y, se, w = r[1:]
            lo, hi = y - 1.959964 * se, y + 1.959964 * se
            ax.text(X_STUDY, yy, s["id"], fontsize=10, va="center")
            if "eI" in s:
                ax.text(X_I, yy, f"{s['eI']}/{s['nI']}", fontsize=10, va="center", ha="center")
                ax.text(X_C, yy, f"{s['eC']}/{s['nC']}", fontsize=10, va="center", ha="center")
            else:
                ax.text((X_I + X_C) / 2, yy, "só OR", fontsize=9, va="center", ha="center", fontstyle="italic")
            ax.plot([px(lo), px(hi)], [yy, yy], color="black", lw=1)
            if lo < lo_lim:
                ax.annotate("", xy=(px(lo_lim), yy), xytext=(px(lo_lim) + 0.12, yy),
                            arrowprops=dict(arrowstyle="->", lw=1))
            if hi > hi_lim:
                ax.annotate("", xy=(px(hi_lim), yy), xytext=(px(hi_lim) - 0.12, yy),
                            arrowprops=dict(arrowstyle="->", lw=1))
            ms = 4 + 14 * math.sqrt(w / 100)
            ax.plot([px(y)], [yy], marker="s", markersize=ms, color="#1F4E78", zorder=3)
            ax.text(X_OR + 0.75, yy, f"{fmt(y)} [{fmt(lo)}–{fmt(hi)}]", fontsize=10, va="center", ha="center")
            ax.text(X_W, yy, f"{w:.1f}%".replace(".", ","), fontsize=10, va="center", ha="center")
        elif r[0] == "diamond":
            lab, m = r[1], r[2]
            ax.text(X_STUDY, yy, lab, fontsize=10, fontweight="bold", va="center")
            xs = [px(m["re_lo"]), px(m["re"]), px(m["re_hi"]), px(m["re"])]
            ys = [yy, yy + 0.25, yy, yy - 0.25]
            ax.add_patch(plt.Polygon(list(zip(xs, ys)), color="#C00000"))
            ax.text(X_OR + 0.75, yy, f"{fmt(m['re'])} [{fmt(m['re_lo'])}–{fmt(m['re_hi'])}]",
                    fontsize=10, fontweight="bold", va="center", ha="center")
    # eixo
    base = -0.2
    ax.plot([X_PLOT0, X_PLOT1], [base, base], color="black", lw=0.8)
    for t in [0.01, 0.1, 1, 10, 100]:
        ax.plot([px(math.log(t))] * 2, [base, base - 0.12], color="black", lw=0.8)
        ax.text(px(math.log(t)), base - 0.35, f"{t:g}".replace(".", ","), fontsize=9, ha="center", va="center")
    ax.plot([px(0)] * 2, [base, n], color="black", lw=0.8, ls="--")
    ax.text(px(math.log(0.1)), base - 0.8, "Favorece profilaxia", fontsize=9, ha="center", va="center")
    ax.text(px(math.log(10)), base - 0.8, "Favorece controle", fontsize=9, ha="center", va="center")
    if note:
        import textwrap
        ax.text(0.05, -1.8, "\n".join(textwrap.wrap(note, 170)), fontsize=8, va="top", ha="left")
    ax.set_title(title, fontsize=12, fontweight="bold", loc="left")
    plt.tight_layout()
    fig.savefig(OUT / fname, dpi=300, format="jpg", pil_kwargs={"quality": 95})
    plt.close(fig)


# --------------------------------------------------------------------------
# Análises
# --------------------------------------------------------------------------
lines = []
def log(s=""):
    print(s); lines.append(s)

main = meta(STUDIES)
log("# Resultados da meta-análise")
log()
log("Medida: odds ratio (OR) de recidiva, profilaxia vs sem profilaxia. Efeitos aleatórios (DerSimonian-Laird).")
log()
log("## 1. Análise principal (9 estudos)")
log()
log("| Estudo | Profilaxia | Sem profilaxia | OR (IC95%) | Peso |")
log("|---|---|---|---|---|")
for s, y, se, w in zip(STUDIES, main["y"], main["se"], main["w_re"]):
    cI = f"{s['eI']}/{s['nI']}" if "eI" in s else "—"
    cC = f"{s['eC']}/{s['nC']}" if "eC" in s else "—"
    log(f"| {s['id']} | {cI} | {cC} | {fmt(y)} ({fmt(y-1.96*se)}–{fmt(y+1.96*se)}) | {w:.1f}% |".replace(".", ","))
log()
log(f"**Efeito combinado (aleatórios):** OR {fmt(main['re'])} (IC95% {fmt(main['re_lo'])}–{fmt(main['re_hi'])}); p = {main['p']:.4f}")
log(f"**Efeito combinado (fixos):** OR {fmt(main['fe'])} (IC95% {fmt(main['fe_lo'])}–{fmt(main['fe_hi'])})")
log(f"**Heterogeneidade:** Q = {main['Q']:.2f} (gl = {main['df']}; p = {main['pQ']:.3f}); I² = {main['I2']:.0f}%; τ² = {main['tau2']:.3f}")
log(f"**Intervalo de predição 95%:** {fmt(main['pi'][0])}–{fmt(main['pi'][1])}")
ei, ep = egger(STUDIES)
log(f"**Teste de Egger (assimetria/viés de publicação):** intercepto = {ei:.2f}; p = {ep:.3f} (baixo poder com < 10 estudos)")
tI = sum(s["eI"] for s in STUDIES if "eI" in s); nI = sum(s["nI"] for s in STUDIES if "eI" in s)
tC = sum(s["eC"] for s in STUDIES if "eC" in s); nC = sum(s["nC"] for s in STUDIES if "eC" in s)
log(f"**Total de pacientes com contagem:** {nI + nC} ({nI} com profilaxia, {nC} sem); recidivas {tI}/{nI} vs {tC}/{nC}. Pintado 2001 entra só pelo OR.")
log()

# Subgrupos por era
log("## 2. Subgrupos por período de publicação")
log()
groups = []
for era in ["1996–2005", "2017–2021"]:
    sub = [s for s in STUDIES if s["era"] == era]
    m = meta(sub)
    groups.append((f"Estudos de {era}", sub, m))
    log(f"- **{era}** ({m['k']} estudos): OR {fmt(m['re'])} (IC95% {fmt(m['re_lo'])}–{fmt(m['re_hi'])}); p = {m['p']:.4f}; I² = {m['I2']:.0f}%")
# teste de diferença entre subgrupos (Q entre)
ms = [g[2] for g in groups]
yb = np.array([m["re"] for m in ms]); vb = np.array([((m["re_hi"] - m["re_lo"]) / (2 * 1.959964)) ** 2 for m in ms])
wb = 1 / vb; pooled = np.sum(wb * yb) / np.sum(wb)
Qb = float(np.sum(wb * (yb - pooled) ** 2)); pb = 1 - stats.chi2.cdf(Qb, 1)
log(f"- **Diferença entre subgrupos:** Q = {Qb:.2f} (gl = 1); p = {pb:.3f}")
log()

# Subgrupos por forma de alocação
log("## 3. Subgrupos por forma de alocação")
log()
def aloc_group(s):
    if s["alocacao"].startswith("Critério clínico"):
        return "Profilaxia indicada pela gravidade/CD4 (confundimento por indicação)"
    if s["alocacao"].startswith("Época"):
        return "Controle histórico"
    return "Randomizado ou alocação não informada"
agroups = []
for g in ["Randomizado ou alocação não informada", "Controle histórico",
          "Profilaxia indicada pela gravidade/CD4 (confundimento por indicação)"]:
    sub = [s for s in STUDIES if aloc_group(s) == g]
    m = meta(sub)
    agroups.append((g, sub, m))
    log(f"- **{g}** ({m['k']} estudos: {', '.join(s['id'] for s in sub)}): OR {fmt(m['re'])} (IC95% {fmt(m['re_lo'])}–{fmt(m['re_hi'])}); I² = {m['I2']:.0f}%")
log()

# Sensibilidade
log("## 4. Análises de sensibilidade")
log()
sens = []
def sens_run(label, sts):
    m = meta(sts)
    log(f"- {label} ({m['k']} estudos): OR {fmt(m['re'])} (IC95% {fmt(m['re_lo'])}–{fmt(m['re_hi'])}); p = {m['p']:.4f}; I² = {m['I2']:.0f}%")
    sens.append((label, m))
rib_ant = [dict(s, eI=3, nI=17) if s["id"] == "Ribera 1996" else s for s in STUDIES]
sens_run("Ribera 1996 só com o braço antimonial (3/17), como em Cota 2011", rib_ant)
sens_run("Incluindo Pasquau 2005 (RR ajustado tratado como OR — aproximação)", STUDIES + [PASQUAU])
sens_run("Sem Goswami 2017 (controle histórico, maior efeito)", [s for s in STUDIES if s["id"] != "Goswami 2017"])
sens_run("Sem estudos com dados obtidos indiretamente (Delgado Fernández, Pintado)",
         [s for s in STUDIES if s["id"] not in ("Delgado Fernández 1997", "Pintado 2001")])
sens_run("Só estudos com texto completo lido", [s for s in STUDIES if s["fonte"] == "Texto completo"])
log()
log("### Exclusão de um estudo por vez (leave-one-out)")
log()
for s in STUDIES:
    m = meta([x for x in STUDIES if x is not s])
    log(f"- Sem {s['id']}: OR {fmt(m['re'])} ({fmt(m['re_lo'])}–{fmt(m['re_hi'])}); I² = {m['I2']:.0f}%")
log()

# Figuras
note = ("OR < 1 favorece a profilaxia. Efeitos aleatórios (DerSimonian-Laird). Correção de 0,5 em estudos com célula zero (Goswami 2017, Bossolasco 2003). "
        "Ribera 1996: braços antimonial e alopurinol somados. Pintado 2001: OR e IC extraídos de Cota et al., 2011.")
forest([(None, STUDIES, main)], "Figura1_forest_principal.jpg",
       "Figura 1. Profilaxia secundária e recidiva de leishmaniose visceral em pacientes com HIV", note=note)
forest(groups, "Figura2_forest_subgrupos_periodo.jpg",
       "Figura 2. Análise de subgrupos por período de publicação", overall=main,
       note=note + f" Diferença entre subgrupos: p = {pb:.3f}".replace(".", ",", 0))
forest(agroups, "Figura3_forest_subgrupos_alocacao.jpg",
       "Figura 3. Análise de subgrupos pela forma de alocação da profilaxia", overall=main, note=note)

(OUT / "resultados_meta_analise.md").write_text("\n".join(lines), encoding="utf-8")
print("\nFiguras salvas em", OUT)
