Choisir une pallette de couleurs et commencer a composer le css (utiliser sass?)
Creer un hover commun
  cf https://www.w3schools.com/Css/css_tooltip.asp:
  ```
  <div class="tooltip">Hover over me
    <span class="tooltiptext">Tooltip text</span>
  </div>
  ```

Bubble viz:
- Ajouter la deuxieme annee
  DONE Gerer le z-order des bulles
  DONE Gerer la transparence des bulles
  - Distance entre les bulles pour indiquer la similitude?
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
- Forme: briques de texte colorees? dot matrix chart? Pie chart?
- Get data
- combiend de data montrer? comparer les decennies ou les annees? montrer toutes les annees en meme temps ou avoir un menu pour selectionner?
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
- Quel est cette viz en fait?
- De quelles donnees on a besoin?
