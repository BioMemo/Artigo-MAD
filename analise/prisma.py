"""Fluxograma PRISMA 2020 (português), JPEG 300 dpi.
Números documentados em 06_numeros_prisma.md. Para rodar: python3 analise/prisma.py
"""
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

OUT = Path(__file__).resolve().parent / "resultados" / "Figura_PRISMA_2020.jpg"
plt.rcParams["font.family"] = "Liberation Serif"

N = dict(
    pubmed=354, bvs=96, dup=61, screened=389, excl_screen=370,
    sought=19, not_retrieved=9, assessed=10, excl_ft=3,
    incl_ft=7, incl_secondary=3, included=10, meta=9,
)
assert N["pubmed"] + N["bvs"] - N["dup"] == N["screened"]
assert N["screened"] - N["excl_screen"] == N["sought"]
assert N["sought"] - N["not_retrieved"] == N["assessed"]
assert N["assessed"] - N["excl_ft"] == N["incl_ft"]
assert N["incl_ft"] + N["incl_secondary"] == N["included"]

fig, ax = plt.subplots(figsize=(11, 13.5), dpi=300)
ax.set_xlim(0, 110)
ax.set_ylim(0, 135)
ax.axis("off")


def box(x, y, w, h, text, fs=10.5, bold_first=False, fc="white", ec="black"):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.25,rounding_size=0.8",
                                fc=fc, ec=ec, lw=1.1))
    lines = text.split("\n")
    if bold_first:
        ax.text(x + 1.2, y + h - 1.6, lines[0], fontsize=fs, fontweight="bold", va="top", ha="left")
        ax.text(x + 1.2, y + h - 4.3, "\n".join(lines[1:]), fontsize=fs, va="top", ha="left", linespacing=1.35)
    else:
        ax.text(x + 1.2, y + h - 1.6, text, fontsize=fs, va="top", ha="left", linespacing=1.35)


def arrow(x1, y1, x2, y2):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1), arrowprops=dict(arrowstyle="-|>", lw=1.1, color="black"))


def stage(y0, y1, label):
    ax.add_patch(FancyBboxPatch((0.5, y0), 5, y1 - y0, boxstyle="round,pad=0.2,rounding_size=0.8",
                                fc="#BDD7EE", ec="#1F4E78", lw=1))
    ax.text(3, (y0 + y1) / 2, label, rotation=90, fontsize=11, fontweight="bold", ha="center", va="center")


ax.text(55, 133, "Fluxograma PRISMA 2020 de seleção dos estudos", fontsize=14, fontweight="bold", ha="center")
# top header boxes
ax.add_patch(FancyBboxPatch((8, 124), 64, 5, boxstyle="round,pad=0.2", fc="#FFE699", ec="#BF9000"))
ax.text(40, 126.5, "Identificação de estudos em bases de dados", fontsize=11, fontweight="bold", ha="center", va="center")
ax.add_patch(FancyBboxPatch((76, 124), 33, 5, boxstyle="round,pad=0.2", fc="#D9D9D9", ec="#7F7F7F"))
ax.text(92.5, 126.5, "Outros métodos", fontsize=11, fontweight="bold", ha="center", va="center")

# IDENTIFICATION
stage(102, 122, "Identificação")
box(8, 103, 30, 18,
    f"Registros identificados\n(09/11/2026):\n• PubMed/MEDLINE (n = {N['pubmed']})\n• BVS – coleção LILACS Plus\n   (n = {N['bvs']})")
box(42, 106, 30, 12,
    f"Registros removidos antes\nda triagem:\n• Duplicatas (n = {N['dup']})")
arrow(38, 112, 42, 112)
box(76, 103, 33, 18,
    "Revisão sistemática de\nCota et al., 2011 (lista de\nreferências e Figura 3):\n• Registros novos (n = 0)\n• Fonte de dados para 3 estudos\n   sem texto completo")

# SCREENING
stage(36, 100, "Triagem")
box(8, 88, 30, 9, f"Registros triados por\ntítulo e resumo\n(n = {N['screened']})")
box(42, 88, 30, 9, f"Registros excluídos\n(n = {N['excl_screen']})")
arrow(23, 103, 23, 97)
arrow(38, 92.5, 42, 92.5)

box(8, 71, 30, 9, f"Relatos buscados para\nleitura do texto completo\n(n = {N['sought']})")
box(42, 64, 30, 16,
    f"Relatos não recuperados\n(n = {N['not_retrieved']}):\n• Artigos sem acesso (n = 5)\n• Duplicata de população\n   (Ribera 1995) (n = 1)\n• Teses/dissertação (n = 3)")
arrow(23, 88, 23, 80)
arrow(38, 75.5, 42, 75.5)

box(8, 50, 30, 9, f"Relatos avaliados quanto\nà elegibilidade (texto\ncompleto) (n = {N['assessed']})")
box(42, 38, 30, 21,
    f"Relatos excluídos (n = {N['excl_ft']}):\n• Sem grupo controle\n   comparável: controles\n   perdidos no seguimento\n   (Cipriano 2017) (n = 1)\n• Sem dados de profilaxia\n   secundária (Alexandrino-de-\n   Oliveira 2010; Hernández-\n   Torres 2015) (n = 2)")
arrow(23, 71, 23, 59)
arrow(38, 54.5, 42, 54.5)

box(76, 64, 33, 16,
    "Incluídos com dados do resumo\ne de Cota et al., 2011, sem\ntexto completo (n = 3):\n• López-Vélez 2004 (ECR)\n• Delgado Fernández 1997\n• Pintado 2001")
arrow(72, 72, 76, 72)

# INCLUDED
stage(4, 34, "Inclusão")
box(8, 16, 64, 16,
    f"Estudos incluídos na revisão (n = {N['included']})\n"
    f"• Com texto completo (n = {N['incl_ft']}); com dados do resumo/Cota 2011 (n = {N['incl_secondary']})\n"
    f"• Incluídos na meta-análise principal (n = {N['meta']}); Pasquau 2005 apenas na análise\n"
    f"   de sensibilidade (relata somente RR ajustado)",
    bold_first=True)
arrow(23, 50, 23, 32)
ax.plot([92.5, 92.5], [64, 24], color='black', lw=1.1)
arrow(92.5, 24, 72, 24)
box(8, 4, 101, 9,
    "Citados apenas na síntese narrativa (texto completo não obtido e dados insuficientes): Mira 2004 (recidivas no grupo\n"
    "com profilaxia não informadas no resumo) e Fernández Cotarelo 2003 (sem dados por grupo; não incluído na meta-análise de Cota 2011).",
    fs=9.5, fc="#F2F2F2", ec="#7F7F7F")

fig.text(0.02, 0.005, "Adaptado de: Page MJ, et al. The PRISMA 2020 statement. BMJ 2021;372:n71.",
         fontsize=8, style="italic")
plt.tight_layout()
fig.savefig(OUT, dpi=300, format="jpg", pil_kwargs={"quality": 95})
print("salvo", OUT)
