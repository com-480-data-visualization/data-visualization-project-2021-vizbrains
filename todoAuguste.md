Choisir une pallette de couleurs et commencer a composer le css (utiliser sass?)
Creer un hover commun
  cf https://www.w3schools.com/Css/css_tooltip.asp:
  ```
  <div class="tooltip">Hover over me
    <span class="tooltiptext">Tooltip text</span>
  </div>
  ```
  answer by Nims Patel on https://stackoverflow.com/questions/7117073/add-a-tooltip-to-a-div
  The EXPAND effect is super cool looking.

Drop-down menu:
  cf https://bl.ocks.org/ProQuestionAsker/8382f70af7f4a7355827c6dc4ee8817d

Sliders:
  cf https://www.w3schools.com/howto/howto_js_rangeslider.asp

Bubble viz:
- Ajouter la deuxieme annee
  DONE Gerer le z-order des bulles
  DONE Gerer la transparence des bulles
  - Distance entre les bulles pour indiquer la similitude?
  TODO Quand 2 annees on la meme valeur, il faut que la bulle ait toujours la meme couleur (cf 1950 et 2001, valence et danceability: les 2 sont quasi egales mais l'une est rouge alors que l'autre est verte, or on veut montrer que les 2 annees sont egales)
    Quand les 2 opacites sont a exactement 0.5, on obtient l'effet attendu (les couleurs se melangent pour former la couleur au premier plan)
- ajouter des bandes horizontales indiquant a quoi correspond tel rayon de bulles
  - Si c'est pas moche !
    - Pt des petits ticks sur les bords a la place ?
  - faire ca apres avoir mis la 2e annee
- Rendre bulles interactives (choisir l'annee c'est plus important que choisir les facteurs)
- Choisir combien de bulles au maximum et si elles peuvent wrap
  - Pt qu'un div pourrait faire le taf
- Quelles quantites: essayer de tous normaliser mais check que ca couvre bien l'intervalle [0,1]
  - Ajouter une maniere de passer une liste de quantites (ca pourra etre utilise pour laisser le choix)
DONE avoir des labels anglais (pas track_popularity)
  -> Y a-t-il une maniere plus elegante? je pourrais avoir le json dans le fichier mais je suppose qu'on en aura besoin a d'autres endroits

Pour l'instant ca me parait logique de passer les features et les 2 annees comme des list au constructeur.
Mais est-ce que c'est bien compatible avec la possibilite de changer ces infos? est-ce que le contrsucteur va etre relance a chaque fois qu'un choix est fait, comme je m'y attends?
sinon je sais pas encore comment je vais faire

Genres viz:
- Bar chart
- Get data
- combien de data montrer? comparer les decennies ou les annees? montrer toutes les annees en meme temps ou avoir un menu pour selectionner?
si c'est juste 2 annees cette viz peut rejoindre la bubble viz

Timeline viz:
DONE Qu'est-ce qui est plot?
- Regler les axes
- Ca vaut peut-etre le coup de changer l'axe des y quand on zoom sur une courte periode
- ca vaut peut-etre aussi le coup de montrer directement les noms des chansons quand il y a peu de bulles, comme ca pas besoin de hover (mais le hover peut rester of course)
DONE quand on zoom une meme annee peut apparaitre plusieurs fois

Grande viz
- mettre des liens spotify vers les musiques, ca fait une espece de voyage musical temporel
idealement on en aurait plus d'une et elles auraient des genres assez varies
  - embed spotify c'est pas tres dur mais c'est assez manuel a premiere vue
- on pourrait faire par decennie (au choix du user)


Pionneer viz
- De quelles donnees on a besoin?


3/5:
Fix CSS
Milestone 2: a-t-on toutes les viz qu'on veut?
  Definir clairement jusqu'ou on va dans chaque viz
  Pionniers?
  Spotify API?
Emploi du temps a clarifier (exams en fin de semestre)
Tooltip
Menus -> je peux faire comme c'est surtout moi qui en ai besoin, sauf si qqun se chauffe

Visu yanis: menus + barres bougent qd on change
Quoi faire de plus a celle de clement?
pionneer:
  A quel moment y-a-t-il un changement de genre?
  Top musiques de ce genre -> ce doit etre celles-ci qui ont rendu le genre style

Check les anciennes milestones pour savoir jusqu'ou on doit aller

Bulles -> trouver les menus

spotify api: c'est fun mais pas de la visu donc pas la priorite

4/5:
Bar viz: doit-on ordonner les barres qd on change d'annee?
Auguste: deja qu'il y a bcp de barres, si elles bougent toutes en meme temps a chaque changement c'est fatiguant, surtout si on les anime. ou alors il faut qu'elles bougent assez lentement, mais du coup pour comparer 2 annees il faut attendre longtemps.
En plus, meme si c'est peut-etre plus facile de voir les meilleurs genres, je pense qu'on peut tres bien voir ca meme sans changer les barres de place.
En plus, si elles restent en place on verra mieux les differences entre les annees pour chaque genre.
En plus, si elles restent en place ca fait beaucoup plus spectre, avec les toutes les barres qui changent de taille. pour moi ca fait un parallele assez elegant.

Tout ca ca depend de quelle information on cherche a faire passer: est-ce qu'on prefere mettre l'accent sur l'ordre entre les genres pour chaque annee, ou est-ce qu'on prefere regarder l'evolution sur plusieurs annees?
si on cherche a comparer les annees alors il vaudrait mieux avoir les barres pour les 2 annees deja visibles, comme ds la bubble viz.
